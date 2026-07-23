const express = require("express");
const Product = require("../models/Product.js");

const router = express.Router();

const INITIAL_SEED_PRODUCTS = [
  {
    name: "Cartoon Key Chain",
    description: "Colorful, cute silicone character keychain.",
    price: 99,
    image: "/images/shopping.webp",
    category: "Cartoon",
    rating: 4.8,
    stock: 25
  },
  {
    name: "Name Key Chain",
    description: "Customized engraved acrylic keychain with custom name.",
    price: 149,
    image: "/images/name.webp",
    category: "Customized",
    rating: 4.9,
    stock: 15
  },
  {
    name: "Leather Key Chain",
    description: "Premium handcrafted genuine leather key strap.",
    price: 199,
    image: "/images/leather.jpg",
    category: "Premium",
    rating: 4.7,
    stock: 10
  },
  {
    name: "Avengers Key Chain",
    description: "Super hero metallic shield keychain.",
    price: 210,
    image: "/images/captain.webp",
    category: "Avengers",
    rating: 4.9,
    stock: 20
  },
  {
    name: "Metallic Spinner Key Chain",
    description: "Heavy duty zinc alloy rotating spinner key ring.",
    price: 249,
    image: "/images/shopping.webp",
    category: "Metal",
    rating: 4.6,
    stock: 12
  },
  {
    name: "Custom Photo Key Chain",
    description: "Double-sided personalized photo key charm.",
    price: 179,
    image: "/images/name.webp",
    category: "Customized",
    rating: 4.8,
    stock: 18
  }
];

// API to fetch all products from the database (with auto-seed if empty)
router.get("/", async (req, res) => {
  try {
    let products = await Product.find();

    if (products.length === 0) {
      products = await Product.insertMany(INITIAL_SEED_PRODUCTS);
    }

    res.status(200).json({
      success: true,
      products
    });
  } catch (error) {
    console.error("Fetch products error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to fetch products"
    });
  }
});

// API to save a new product to the database
router.post("/save-new-product", async (req, res) => {
  try {
    const { name, description, price, image, stock, category, rating } = req.body;

    const newProduct = new Product({
      name,
      description,
      price,
      image,
      stock,
      category: category || "General",
      rating: rating || 4.5
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

// API to delete a product from the database
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

// API to search product by name, description, or category
router.get("/search", async (req, res) => {
  try {
    const { query } = req.query;
    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } }
      ]
    });
    res.status(200).json({
      success: true,
      products
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Unable to search products"
    });
  }
});

// API to update a product in the database
router.put("/update-product/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    const { name, description, price, image, stock, category, rating } = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { name, description, price, image, stock, category, rating },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }
    res.status(200).json({
      success: true,
      product: updatedProduct
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Unable to update product"
    });
  }
});

module.exports = router;
