const express = require("express");
const Product = require("../models/Product.js");

const router = express.Router();

// API to fetch all products from the database

router.get("/", async (req, res) => {
        try {
            const products = await Product.find();

            res.status(200).json({
                success: true,
                products
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Unable to fetch products"
            });
        }
});
// API to save a new product to the database
router.post("/save-new-product", async (req, res) => {
    try {
        const { name, description, price, image, stock } = req.body;

        const newProduct = new Product({
            name,
            description,
            price,
            image,
            stock
        });

        await newProduct.save();

        res.status(201).json({
            success: true,
            product: newProduct
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Unable to save new product"
        });
    }
});
//API to delete a product from the database
router.delete("/delete-product/:id", async (req, res) => {
    try {
        const productId = req.params.id;
        await Product.findByIdAndDelete(productId);
        
        res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Unable to delete product"
        });
    }
});
//API to search product by name and description
router.get("/search", async (req, res) => {
    try {
        const { query } = req.query;
        const products = await Product.find({
            $or: [
                { name: { $regex: query, $options: "i" } },
                { description: { $regex: query, $options: "i" } }
            ]});
        if (products.length > 0) {
            res.status(200).json({
                success: true,
                products
            });
        } else {
            res.status(404).json({
                success: false,
                message: "No products found"
            }); 
        }
        }
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Unable to search products"
        });
    } 
});

module.exports = router;
