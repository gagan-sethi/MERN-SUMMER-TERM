const express = require("express");
const Order = require("../models/Order.js");
const Product = require("../models/Product.js");
const { requireAuth } = require("./authRoutes.js");

const router = express.Router();

function requireVendor(req, res, next) {
    if (!req.user || req.user.role !== "vendor") {
        return res.status(403).json({ success: false, message: "Access denied. Vendor privileges required." });
    }
    next();
}

// GET /api/vendor/stats -> Analytics Dashboard statistics
router.get("/stats", requireAuth, requireVendor, async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const totalProducts = await Product.countDocuments();
        const lowStockCount = await Product.countDocuments({ stock: { $lte: 5 } });

        const orders = await Order.find();
        const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

        const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5);

        res.json({
            success: true,
            stats: {
                totalRevenue,
                totalOrders,
                totalProducts,
                lowStockCount
            },
            recentOrders
        });
    } catch (error) {
        console.error("Vendor stats error:", error);
        res.status(500).json({ success: false, message: "Error fetching vendor statistics" });
    }
});

// GET /api/vendor/orders -> All orders placed across store
router.get("/orders", requireAuth, requireVendor, async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json({
            success: true,
            orders
        });
    } catch (error) {
        console.error("Vendor fetch orders error:", error);
        res.status(500).json({ success: false, message: "Error fetching store orders" });
    }
});

// PATCH /api/vendor/orders/:id/status -> Update order status
router.patch("/orders/:id/status", requireAuth, requireVendor, async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ["Paid", "Processing", "Shipped", "Delivered", "Cancelled"];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid order status value" });
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        res.json({
            success: true,
            message: `Order status updated to ${status}`,
            order: updatedOrder
        });
    } catch (error) {
        console.error("Update order status error:", error);
        res.status(500).json({ success: false, message: "Error updating order status" });
    }
});

module.exports = router;
