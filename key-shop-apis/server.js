const express= require("express");
const Product = require("./models/Product.js");
const productRoutes = require("./routes/productRoutes.js");
const authRoutes = require("./routes/authRoutes.js");
const paymentRoutes = require("./routes/paymentRoutes.js");
const vendorRoutes = require("./routes/vendorRoutes.js");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express(); // create nodejs / express app server
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

const dotenv = require("dotenv");
dotenv.config();

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB connected successfully!"))
.catch((err) => console.log(err));

app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/vendor", vendorRoutes);

app.use("/", (req, res) => {
    res.send("Welcome to the Key Shop API Backend!");
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server is running on port ${process.env.PORT || 5000}`);
});
