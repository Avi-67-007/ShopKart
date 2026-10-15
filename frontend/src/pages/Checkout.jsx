import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import api from "../services/api";

const initialAddress = {
    fullName: "",
    phone: "",
    addressLine1: "",
    city: "",
    state: "",
    pincode: "",
};

function loadRazorpayScript() {
    return new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true);
            return;
        }

        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";

        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);

        document.body.appendChild(script);
    });
}

function Checkout() {
    const navigate = useNavigate();

    const {
        cartItems,
        loading,
        error,
        subtotal,
        totalItems,
        fetchCart,
    } = useCart();

    const [shippingAddress, setShippingAddress] =
        useState(initialAddress);
    const [formErrors, setFormErrors] = useState({});
    const [submitError, setSubmitError] = useState("");
    const [placingOrder, setPlacingOrder] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setShippingAddress((prev) => ({
            ...prev,
            [name]: value,
        }));

        setFormErrors((prev) => ({
            ...prev,
            [name]: "",
        }));

        setSubmitError("");
    };

    const validateForm = () => {
        const errors = {};

        Object.entries(shippingAddress).forEach(([field, value]) => {
            if (!value.trim()) {
                errors[field] = "This field is required.";
            }
        });

        const phone = shippingAddress.phone.trim();

        if (phone && !/^[6-9]\d{9}$/.test(phone)) {
            errors.phone =
                "Enter a valid 10-digit Indian phone number.";
        }

        const pincode = shippingAddress.pincode.trim();

        if (pincode && !/^\d{6}$/.test(pincode)) {
            errors.pincode = "Pincode must contain 6 digits.";
        }

        setFormErrors(errors);

        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError("");

        if (placingOrder) return;

        if (!validateForm()) {
            return;
        }

        setPlacingOrder(true);

        try {
            // Load Razorpay Checkout.js
            const scriptLoaded = await loadRazorpayScript();

            if (!scriptLoaded) {
                throw new Error(
                    "Unable to load Razorpay. Check your internet connection and try again."
                );
            }

            // Create a pending order on the backend.
            const response = await api.post(
                "/orders/create-payment-order",
                {
                    shippingAddress: {
                        ...shippingAddress,
                        fullName: shippingAddress.fullName.trim(),
                        phone: shippingAddress.phone.trim(),
                        addressLine1:
                            shippingAddress.addressLine1.trim(),
                        city: shippingAddress.city.trim(),
                        state: shippingAddress.state.trim(),
                        pincode: shippingAddress.pincode.trim(),
                    },
                }
            );

            const {
                shopKartOrderId,
                razorpayOrderId,
                amount,
                currency,
                key,
            } = response.data;

            if (
                !shopKartOrderId ||
                !razorpayOrderId ||
                !amount ||
                !key
            ) {
                throw new Error(
                    "The server did not return all required payment details."
                );
            }

            const razorpay = new window.Razorpay({
                key,
                amount,
                currency,
                name: "ShopKart",
                description: "Order Payment",
                order_id: razorpayOrderId,

                prefill: {
                    name: shippingAddress.fullName.trim(),
                    contact: shippingAddress.phone.trim(),
                },

                notes: {
                    shopKartOrderId,
                },

                handler: async (paymentResponse) => {
                    try {
                        // Verify payment on the backend.
                        await api.post("/orders/verify-payment", {
                            shopKartOrderId,
                            razorpay_order_id:
                                paymentResponse.razorpay_order_id,
                            razorpay_payment_id:
                                paymentResponse.razorpay_payment_id,
                            razorpay_signature:
                                paymentResponse.razorpay_signature,
                        });

                        // Refresh cart only after successful verification.
                        await fetchCart();

                        navigate(`/order-success/${shopKartOrderId}`);
                    } catch (err) {
                        setSubmitError(
                            err.response?.data?.message ||
                            "Payment verification failed. Check My Orders before attempting payment again."
                        );

                        setPlacingOrder(false);
                    }
                },

                modal: {
                    ondismiss: () => {
                        setPlacingOrder(false);
                    },
                },
            });

            razorpay.on("payment.failed", (paymentError) => {
                setSubmitError(
                    paymentError.error?.description ||
                    "Payment failed. Please try again."
                );

                setPlacingOrder(false);
            });

            razorpay.open();
        } catch (err) {
            setSubmitError(
                err.response?.data?.message ||
                err.message ||
                "Unable to start checkout. Please try again."
            );

            setPlacingOrder(false);
        }
    };

    if (loading) {
        return <h2>Loading checkout...</h2>;
    }

    if (error && cartItems.length === 0) {
        return (
            <div>
                <h2>{error}</h2>
                <button onClick={() => navigate("/cart")}>
                    Return to Cart
                </button>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div>
                <h1>Your cart is empty</h1>
                <button onClick={() => navigate("/products")}>
                    Browse Products
                </button>
            </div>
        );
    }

    const fields = [
        { name: "fullName", label: "Full Name" },
        { name: "phone", label: "Phone Number" },
        { name: "addressLine1", label: "Address Line" },
        { name: "city", label: "City" },
        { name: "state", label: "State" },
        { name: "pincode", label: "Pincode" },
    ];

    return (
        <div className="checkout-page">
            <h1>Checkout</h1>

            <form onSubmit={handleSubmit} noValidate>
                <h2>Shipping Details</h2>

                {fields.map((field) => (
                    <div key={field.name} className="form-group">
                        <label htmlFor={field.name}>
                            {field.label}
                        </label>

                        <input
                            id={field.name}
                            name={field.name}
                            type={
                                field.name === "phone" ||
                                field.name === "pincode"
                                    ? "tel"
                                    : "text"
                            }
                            value={shippingAddress[field.name]}
                            onChange={handleChange}
                            aria-invalid={Boolean(
                                formErrors[field.name]
                            )}
                        />

                        {formErrors[field.name] && (
                            <p className="form-error">
                                {formErrors[field.name]}
                            </p>
                        )}
                    </div>
                ))}

                <h2>Order Summary</h2>

                {cartItems.map((item) => {
                    const product = item.product;

                    if (!product) return null;

                    return (
                        <div key={product._id}>
                            <p>
                                {product.name} × {item.quantity}
                                {" — "}
                                ₹
                                {(
                                    product.price * item.quantity
                                ).toLocaleString("en-IN")}
                            </p>
                        </div>
                    );
                })}

                <p>Total items: {totalItems}</p>

                <h2>
                    Total: ₹{subtotal.toLocaleString("en-IN")}
                </h2>

                {submitError && (
                    <p role="alert" className="form-error">
                        {submitError}
                    </p>
                )}

                <button type="submit" disabled={placingOrder}>
                    {placingOrder ? "Processing..." : "Place Order"}
                </button>

                <button
                    type="button"
                    onClick={() => navigate("/cart")}
                    disabled={placingOrder}
                >
                    Back to Cart
                </button>
            </form>
        </div>
    );
}

export default Checkout;
