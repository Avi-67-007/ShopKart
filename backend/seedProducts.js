import "./config/env.js";
import mongoose from "mongoose";
import Product from "./models/product.model.js";

const products = [
  {
    name: "Wireless Headphones",
    description: "Comfortable over-ear headphones with clear sound and wireless connectivity.",
    price: 1999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
    stock: 25,
  },
  {
    name: "Smart Watch",
    description: "A stylish smartwatch for tracking daily activity and notifications.",
    price: 2499,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
    stock: 18,
  },
  {
    name: "Bluetooth Speaker",
    description: "Portable speaker with rich sound for music at home or outdoors.",
    price: 1499,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800",
    stock: 20,
  },
  {
    name: "USB-C Hub",
    description: "A compact multiport hub for connecting accessories to your laptop.",
    price: 1199,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1625842268584-8f3296236761?w=800",
    stock: 30,
  },
  {
    name: "Laptop Stand",
    description: "An ergonomic laptop stand designed for a comfortable desk setup.",
    price: 899,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800",
    stock: 22,
  },
  {
    name: "Webcam",
    description: "A compact webcam for online meetings, classes, and video calls.",
    price: 1799,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=800",
    stock: 14,
  },
  {
    name: "Power Bank",
    description: "A portable power bank for charging your devices while travelling.",
    price: 1299,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1609592806596-b43bada1f3b7?w=800",
    stock: 28,
  },
  {
    name: "Desk Lamp",
    description: "A modern desk lamp for studying, reading, and working.",
    price: 799,
    category: "Home",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800",
    stock: 16,
  },
  {
    name: "Gaming Controller",
    description: "An ergonomic controller for comfortable gaming sessions.",
    price: 2199,
    category: "Gaming",
    image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800",
    stock: 12,
  },
  {
    name: "Phone Stand",
    description: "A compact adjustable stand for your phone on a desk.",
    price: 399,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=800",
    stock: 35,
  },
];

async function seedProducts() {
  try {
    const dbURL = process.env.dbURL;

    if (!dbURL) {
      throw new Error(
        "dbURL is missing. Check the variable name in backend/.env and config/env.js."
      );
    }

    await mongoose.connect(dbURL);
    console.log("Connected to MongoDB");

    let added = 0;
    let skipped = 0;

    for (const product of products) {
      const existing = await Product.findOne({
        name: product.name,
      });

      if (existing) {
        console.log(`Skipped existing product: ${product.name}`);
        skipped++;
        continue;
      }

      await Product.create(product);
      console.log(`Added: ${product.name}`);
      added++;
    }

    const totalProducts = await Product.countDocuments();

    console.log("\nProduct seeding complete!");
    console.log(`Added: ${added}`);
    console.log(`Skipped: ${skipped}`);
    console.log(`Total products in database: ${totalProducts}`);
  } catch (error) {
    console.error("Failed to seed products:", error.message);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
}

seedProducts();
