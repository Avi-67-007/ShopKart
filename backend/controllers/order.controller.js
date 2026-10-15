import Order from "../models/order.model.js";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";
import razorpay from "../config/razorpay.js";
import crypto from "crypto";
import mongoose from "mongoose";
export const createPaymentOrder = async (req, res) => {
    try {
        const { shippingAddress } = req.body;

        // 1. Validate shipping address
        const requiredFields = [
            "fullName",
            "phone",
            "addressLine1",
            "city",
            "state",
            "pincode",
        ];

        if (
            !shippingAddress ||
            requiredFields.some(
                (field) =>
                    typeof shippingAddress[field] !== "string" ||
                    !shippingAddress[field].trim()
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "All shipping fields are required.",
            });
        }

        if (!/^[6-9]\d{9}$/.test(shippingAddress.phone.trim())) {
            return res.status(400).json({
                success: false,
                message: "Enter a valid 10-digit Indian phone number.",
            });
        }

        if (!/^\d{6}$/.test(shippingAddress.pincode.trim())) {
            return res.status(400).json({
                success: false,
                message: "Pincode must contain 6 digits.",
            });
        }

        // 2. Load the authenticated customer's cart
        const customer = await Customer.findById(req.user._id)
            .populate("cart.product");

        if (!customer) {
            return res.status(401).json({
                success: false,
                message: "Customer not found.",
            });
        }

        if (!customer.cart || customer.cart.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Your cart is empty.",
            });
        }

        // 3. Re-fetch current products and validate stock
        const orderItems = [];
        let totalAmount = 0;

        for (const cartItem of customer.cart) {
            const productId = cartItem.product?._id;

            if (!productId) {
                return res.status(400).json({
                    success: false,
                    message: "A product in your cart no longer exists.",
                });
            }

            const product = await Product.findById(productId);

            if (!product) {
                return res.status(400).json({
                    success: false,
                    message: "A product in your cart no longer exists.",
                });
            }

            if (
                !Number.isInteger(cartItem.quantity) ||
                cartItem.quantity < 1 ||
                cartItem.quantity > product.stock
            ) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}.`,
                });
            }

            // 4. Snapshot the latest product information
            orderItems.push({
                product: product._id,
                name: product.name,
                price: product.price,
                quantity: cartItem.quantity,
                image: product.image,
            });

            totalAmount += product.price * cartItem.quantity;
        }

        totalAmount = Number(totalAmount.toFixed(2));

        // 5. Create a pending ShopKart order
        const shopKartOrder = await Order.create({
            user: customer._id,
            items: orderItems,
            shippingAddress: {
                fullName: shippingAddress.fullName.trim(),
                phone: shippingAddress.phone.trim(),
                addressLine1: shippingAddress.addressLine1.trim(),
                city: shippingAddress.city.trim(),
                state: shippingAddress.state.trim(),
                pincode: shippingAddress.pincode.trim(),
            },
            totalAmount,
            paymentStatus: "PENDING",
            status: "PENDING_PAYMENT",
        });

        // 6. Create the Razorpay order (amount is in paise)
        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(totalAmount * 100),
            currency: "INR",
            receipt: shopKartOrder._id.toString(),
        });

        // 7. Save the Razorpay order ID
        shopKartOrder.razorpayOrderId = razorpayOrder.id;
        await shopKartOrder.save();

        // 8. Return safe checkout information
        return res.status(201).json({
            success: true,
            message: "Payment order created successfully.",
            shopKartOrderId: shopKartOrder._id,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            key: process.env.RAZORPAY_KEY_ID,
        });
    } catch (err) {
        console.error("Create payment order error:", err);

        return res.status(500).json({
            success: false,
            message: "Unable to create payment order.",
        });
    }
};
export const verifyPayment = async (req, res) => {
    try {
        const {
            shopKartOrderId,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = req.body;

        if (
            !shopKartOrderId ||
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature
        ) {
            return res.status(400).json({
                success: false,
                message: "Missing payment verification details.",
            });
        }

        if (!mongoose.isValidObjectId(shopKartOrderId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid ShopKart order ID.",
            });
        }

        const order = await Order.findOne({
            _id: shopKartOrderId,
            user: req.user._id,
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found.",
            });
        }

        // Ensure the order ID belongs to this saved ShopKart order.
        if (order.razorpayOrderId !== razorpay_order_id) {
            return res.status(400).json({
                success: false,
                message: "Razorpay order ID mismatch.",
            });
        }

        // Do not allow a second verification to repeat cart clearing.
        if (order.paymentStatus === "PAID") {
            return res.status(200).json({
                success: true,
                message: "Payment already verified.",
                order,
            });
        }

        // Verify Razorpay's HMAC SHA256 signature.
        const body =
            `${order.razorpayOrderId}|${razorpay_payment_id}`;

        const expectedSignature = crypto
            .createHmac(
                "sha256",
                process.env.RAZORPAY_KEY_SECRET
            )
            .update(body)
            .digest();

        const receivedSignature = Buffer.from(
            razorpay_signature,
            "hex"
        );

        if (
            receivedSignature.length !== expectedSignature.length ||
            !crypto.timingSafeEqual(
                expectedSignature,
                receivedSignature
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment signature.",
            });
        }

        // Only after signature verification succeeds:
        order.paymentStatus = "PAID";
        order.status = "PLACED";
        order.razorpayPaymentId = razorpay_payment_id;

        await order.save();

        // Clear only this authenticated customer's cart.
        const customer = await Customer.findById(req.user._id);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found.",
            });
        }

        customer.cart = [];
        await customer.save();

        return res.status(200).json({
            success: true,
            message: "Payment verified and order placed successfully.",
            order,
        });
    } catch (err) {
        console.error("Verify payment error:", err);

        return res.status(500).json({
            success: false,
            message: "Unable to verify payment.",
        });
    }
};

// GET /orders — Get the authenticated customer's orders
export const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            user: req.user._id,
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            orders,
        });
    } catch (err) {
        console.error("Get orders error:", err);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch orders.",
        });
    }
};


// GET /orders/:id — Get one order belonging to the customer
export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID.",
            });
        }

        const order = await Order.findOne({
            _id: id,
            user: req.user._id,
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found.",
            });
        }

        return res.status(200).json({
            success: true,
            order,
        });
    } catch (err) {
        console.error("Get order error:", err);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch order.",
        });
    }
};
