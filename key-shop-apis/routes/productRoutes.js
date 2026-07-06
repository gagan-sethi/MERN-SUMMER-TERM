const express = require("express");
const Product = require("../models/Product.js");

const router = express.Router();

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

module.exports = router;