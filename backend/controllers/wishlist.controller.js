
import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";

// POST /wishlist/:productId
export const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        // 1. Validate the product ID
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }

        // 2. Find the product
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        // 3. Find the authenticated customer
        const customer = await Customer.findById(req.user._id);

        if (!customer) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        // 4. Prevent duplicate wishlist entries
        if (customer.wishlist.some(
            id => id.toString() === productId
        )) {
            return res.status(409).json({
                success: false,
                message: "Product already in wishlist",
            });
        }

        // 5. Add the product ID and save
        customer.wishlist.push(product._id);
        await customer.save();

        return res.status(200).json({
            success: true,
            message: "Product added to wishlist",
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Failed to add product to wishlist",
        });
    }
};

export const getWishlist = async (req, res) => {
    try {
        // Find the authenticated customer and populate products
        const customer = await Customer.findById(req.user._id)
            .populate({
                path: "wishlist",
                select: "name price category image stock",
            });

        if (!customer) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const wishlist = customer.wishlist;

        return res.status(200).json({
            success: true,
            count: wishlist.length,
            wishlist,
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch wishlist",
        });
    }
};

export const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        // 1. Validate product ID
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }

        // 2. Find the authenticated customer
        const customer = await Customer.findById(req.user._id);

        if (!customer) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        // 3. Check whether the product is in the wishlist
        const index = customer.wishlist.findIndex(
            id => id.toString() === productId
        );

        if (index === -1) {
            return res.status(404).json({
                success: false,
                message: "Product not found in wishlist",
            });
        }

        // 4. Remove the reference and save
        customer.wishlist.splice(index, 1);
        await customer.save();

        return res.status(200).json({
            success: true,
            message: "Product removed from wishlist",
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Failed to remove product from wishlist",
        });
    }
};

