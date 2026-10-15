import mongoose from "mongoose";
import Product from "../models/product.model.js";

export const createProduct = async (req, res) =>{
    try {
        const{name, description, price, category, image, stock,} = req.body;
        const product = await Product.create({
            name, description, price, category, image, stock
        })
        return res.status(201).json({
            success : true,
            product
        })
    }
    catch(err){
        console.log(err);
        return res.status(400).json({
            success : false,
            message : err.message,
        })
    }
}

export const getAllProducts = async (req, res) => {
  try {
    const {search , category} = req.query;
    const query = {}
    if(search){
        query.name = {
            $regex : search,
            $options : "i",
        }
    }
    if(category){
        query.category = category;
    }

    const products = await Product.find(query);

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};

export const getProductById = async (req, res) => {
    try{
        const {id } = req.params;
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({
                success : false,
                message : "Invalid product ID",
            });
        }
        const product = await Product.findById(id);
        if(!product){
            return res.status(404).json({
                success : false,
                message : "Product Not found"
            })
        }
        return res.status(200).json({
                success : true,
                product,        
        });
    }
    catch(err){
        console.log(err);
        return res.status(500).json({
        success : false,
        message : "Failed to fetch Product"
        })
    }
}