
import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";

// POST /cart/:productId
export const addToCart = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        const customer = await Customer.findById(req.user._id);

        if (!customer) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const item = customer.cart.find(
            (item) => item.product.toString() === productId
        );

        const newQuantity = item ? item.quantity + 1 : 1;

        if (newQuantity > product.stock) {
            return res.status(400).json({
                success: false,
                message: "Requested quantity exceeds available stock",
            });
        }

        if (item) {
            item.quantity = newQuantity;
        } else {
            customer.cart.push({
                product: product._id,
                quantity: 1,
            });
        }

        await customer.save();

        const updatedCustomer = await Customer.findById(customer._id)
            .populate({
                path: "cart.product",
                select: "name price image stock category",
            });

        return res.status(200).json({
            success: true,
            message: "Cart updated",
            cart: updatedCustomer.cart,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Failed to update cart",
        });
    }
};

export const getCart = async (req, res) => {
    try {
        const customer = await Customer.findById(req.user._id)
            .populate({
                path: "cart.product",
                select: "name price image stock category",
            });

        if (!customer) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        return res.status(200).json({
            success: true,
            cart: customer.cart,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch cart",
        });
    }
};

export const updateCartQuantity = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }

        if (
            typeof quantity !== "number" ||
            !Number.isInteger(quantity) ||
            quantity < 1
        ) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be a positive integer",
            });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        if (quantity > product.stock) {
            return res.status(400).json({
                success: false,
                message: "Quantity exceeds available stock",
            });
        }

        const customer = await Customer.findById(req.user._id);

        if (!customer) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const item = customer.cart.find(
            (item) => item.product.toString() === productId
        );

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Product not found in cart",
            });
        }

        item.quantity = quantity;
        await customer.save();

        const updatedCustomer = await Customer.findById(customer._id)
            .populate({
                path: "cart.product",
                select: "name price image stock category",
            });

        return res.status(200).json({
            success: true,
            message: "Cart quantity updated",
            cart: updatedCustomer.cart,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Failed to update cart",
        });
    }
};

export const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }

        const customer = await Customer.findById(req.user._id);

        if (!customer) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const index = customer.cart.findIndex(
            (item) => item.product.toString() === productId
        );

        if (index === -1) {
            return res.status(404).json({
                success: false,
                message: "Product not found in cart",
            });
        }

        customer.cart.splice(index, 1);
        await customer.save();

        const updatedCustomer = await Customer.findById(customer._id)
            .populate({
                path: "cart.product",
                select: "name price image stock category",
            });

        return res.status(200).json({
            success: true,
            message: "Product removed from cart",
            cart: updatedCustomer.cart,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Failed to remove product from cart",
        });
    }
};


