const crypto = require("crypto");
const express = require("express");
const Product = require("../models/Product.js");
const { requireAuth } = require("./authRoutes.js");

const router = express.Router();
const pendingOrders = new Map();

function getRazorpayConfig() {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
        const error = new Error("Razorpay test keys are not configured on the server");
        error.status = 503;
        throw error;
    }
    if (!keyId.startsWith("rzp_test_")) {
        const error = new Error("Only Razorpay test mode keys are allowed");
        error.status = 503;
        throw error;
    }
    return { keyId, keySecret };
}

router.post("/orders", requireAuth, async (req, res) => {
    try {
        const items = Array.isArray(req.body.items) ? req.body.items : [];
        if (!items.length) {
            return res.status(400).json({ success: false, message: "Your cart is empty" });
        }

        const quantities = new Map();
        for (const item of items) {
            const productId = String(item.productId || "");
            const quantity = Number(item.quantity);
            if (!productId || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
                return res.status(400).json({ success: false, message: "Cart contains an invalid item" });
            }
            quantities.set(productId, (quantities.get(productId) || 0) + quantity);
        }

        const products = await Product.find({ _id: { $in: [...quantities.keys()] } });
        if (products.length !== quantities.size) {
            return res.status(400).json({ success: false, message: "One or more products are unavailable" });
        }

        let amount = 0;
        for (const product of products) {
            const quantity = quantities.get(String(product._id));
            if (quantity > product.stock) {
                return res.status(409).json({
                    success: false,
                    message: `${product.name} does not have enough stock`
                });
            }
            amount += Math.round(Number(product.price) * 100) * quantity;
        }

        const { keyId, keySecret } = getRazorpayConfig();
        const receipt = `key_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`.slice(0, 40);
        const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
            method: "POST",
            headers: {
                Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                amount,
                currency: "INR",
                receipt,
                notes: { customer: req.user.username }
            })
        });
        const order = await razorpayResponse.json();

        if (!razorpayResponse.ok) {
            console.error("Razorpay order error:", order);
            return res.status(razorpayResponse.status).json({
                success: false,
                message: order.error?.description || "Unable to create payment order"
            });
        }

        pendingOrders.set(order.id, {
            username: req.user.username,
            createdAt: Date.now()
        });

        res.status(201).json({
            success: true,
            keyId,
            order: { id: order.id, amount: order.amount, currency: order.currency }
        });
    } catch (error) {
        console.error("Create payment order error:", error);
        res.status(error.status || 500).json({
            success: false,
            message: error.message || "Unable to create payment order"
        });
    }
});

router.post("/verify", requireAuth, (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        const pendingOrder = pendingOrders.get(razorpay_order_id);
        if (!pendingOrder || pendingOrder.username !== req.user.username) {
            return res.status(400).json({ success: false, message: "Payment order was not found" });
        }

        const { keySecret } = getRazorpayConfig();
        const expectedSignature = crypto
            .createHmac("sha256", keySecret)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");
        const received = Buffer.from(String(razorpay_signature || ""), "hex");
        const expected = Buffer.from(expectedSignature, "hex");
        const isValid = received.length === expected.length && crypto.timingSafeEqual(received, expected);

        if (!isValid) {
            return res.status(400).json({ success: false, message: "Payment verification failed" });
        }

        pendingOrders.delete(razorpay_order_id);
        res.json({ success: true, paymentId: razorpay_payment_id });
    } catch (error) {
        console.error("Verify payment error:", error);
        res.status(error.status || 500).json({
            success: false,
            message: error.message || "Unable to verify payment"
        });
    }
});

module.exports = router;
