
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

function Cart() {
    const navigate = useNavigate();

    const {
        cartItems,
        loading,
        error,
        fetchCart,
        updateQuantity,
        removeFromCart,
        subtotal,
        totalItems,
    } = useCart();

    const [actionError, setActionError] = useState("");
    const [busyProduct, setBusyProduct] = useState("");

    const handleQuantityChange = async (productId, quantity) => {
        try {
            setBusyProduct(productId);
            setActionError("");
            await updateQuantity(productId, quantity);
        } catch (err) {
            setActionError(
                err.response?.data?.message ||
                "Unable to update quantity."
            );
        } finally {
            setBusyProduct("");
        }
    };

    const handleRemove = async (productId) => {
        try {
            setBusyProduct(productId);
            setActionError("");
            await removeFromCart(productId);
        } catch (err) {
            setActionError(
                err.response?.data?.message ||
                "Unable to remove product."
            );
        } finally {
            setBusyProduct("");
        }
    };

    if (loading) {
        return <h2>Loading your cart...</h2>;
    }

    if (error && cartItems.length === 0) {
        return (
            <div>
                <h2>{error}</h2>
                <button onClick={fetchCart}>Try Again</button>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="cart-page">
                <h1>Your cart is empty 🛒</h1>
                <button onClick={() => navigate("/products")}>
                    Browse Products
                </button>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <h1>Shopping Cart</h1>

            {actionError && <p>{actionError}</p>}

            {cartItems.map((item) => {
                const product = item.product;

                if (!product) return null;

                const busy = busyProduct === product._id;

                return (
                    <div className="cart-item" key={product._id}>
                        <img
                            src={product.image}
                            alt={product.name}
                            width="120"
                        />

                        <div>
                            <h2>{product.name}</h2>
                            <p>Price: ₹{product.price}</p>
                            <p>Available stock: {product.stock}</p>
                            <p>
                                Item total: ₹
                                {product.price * item.quantity}
                            </p>

                            <button
                                disabled={busy || item.quantity <= 1}
                                onClick={() =>
                                    handleQuantityChange(
                                        product._id,
                                        item.quantity - 1
                                    )
                                }
                            >
                                −
                            </button>

                            <span> {item.quantity} </span>

                            <button
                                disabled={
                                    busy ||
                                    item.quantity >= product.stock
                                }
                                onClick={() =>
                                    handleQuantityChange(
                                        product._id,
                                        item.quantity + 1
                                    )
                                }
                            >
                                +
                            </button>

                            <button
                                disabled={busy}
                                onClick={() => handleRemove(product._id)}
                            >
                                {busy ? "Please wait..." : "Remove"}
                            </button>
                        </div>
                    </div>
                );
            })}

            <hr />

            <h3>Total items: {totalItems}</h3>
            <h2>Subtotal: ₹{subtotal.toLocaleString("en-IN")}</h2>

            <button onClick={() => navigate("/products")}>
                Continue Shopping
            </button>

            <button onClick={() => navigate("/checkout")}>
    Proceed to Checkout
    </button>
        </div>
    );
}

export default Cart;
