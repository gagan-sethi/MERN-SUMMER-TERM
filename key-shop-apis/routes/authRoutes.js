const crypto = require("crypto");
const express = require("express");
const User = require("../models/User.js");

const router = express.Router();
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days session

function getSessionSecret() {
    return process.env.AUTH_TOKEN_SECRET || "key-shop-development-session-secret";
}

function sign(payload) {
    return crypto.createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
}

function createSessionToken(user) {
    const payload = Buffer.from(JSON.stringify({
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role || "customer",
        expiresAt: Date.now() + SESSION_TTL_MS
    })).toString("base64url");
    return `${payload}.${sign(payload)}`;
}

async function seedVendorAccount() {
    try {
        const existingVendor = await User.findOne({ role: "vendor" });
        if (!existingVendor) {
            const vendorUser = new User({
                name: "Key Shop Admin Vendor",
                username: "vendor",
                email: "vendor@keyshop.com",
                role: "vendor"
            });
            vendorUser.setPassword("vendor123");
            await vendorUser.save();
            console.log("Default Vendor account seeded: vendor / vendor123");
        }
    } catch (err) {
        console.error("Vendor account seed error:", err);
    }
}
seedVendorAccount();

async function requireAuth(req, res, next) {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
    const [payload, signature] = token?.split(".") || [];

    if (!payload || !signature) {
        return res.status(401).json({ success: false, message: "Please log in to continue" });
    }

    const expectedSignature = sign(payload);
    const providedBuffer = Buffer.from(signature, "hex");
    const expectedBuffer = Buffer.from(expectedSignature, "hex");
    if (
        providedBuffer.length !== expectedBuffer.length ||
        !crypto.timingSafeEqual(providedBuffer, expectedBuffer)
    ) {
        return res.status(401).json({ success: false, message: "Your login session is invalid" });
    }

    try {
        const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
        if (session.expiresAt && session.expiresAt < Date.now()) {
            return res.status(401).json({ success: false, message: "Your login session has expired" });
        }
        req.user = session;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: "Your login session is invalid" });
    }
}

// Signup route (Real DB user creation)
router.post("/signup", async (req, res) => {
    try {
        const { name, username, email, password, role } = req.body;

        if (!name || !username || !email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        if (password.length < 6) {
            return res.status(400).json({ success: false, message: "Password must be at least 6 characters long" });
        }

        const normalizedUsername = username.trim().toLowerCase();
        const normalizedEmail = email.trim().toLowerCase();
        const userRole = role === "vendor" ? "vendor" : "customer";

        const existingUsername = await User.findOne({ username: normalizedUsername });
        if (existingUsername) {
            return res.status(400).json({ success: false, message: "Username is already taken" });
        }

        const existingEmail = await User.findOne({ email: normalizedEmail });
        if (existingEmail) {
            return res.status(400).json({ success: false, message: "Email is already registered" });
        }

        const newUser = new User({
            name: name.trim(),
            username: normalizedUsername,
            email: normalizedEmail,
            role: userRole
        });
        newUser.setPassword(password);
        await newUser.save();

        const token = createSessionToken(newUser);

        res.status(201).json({
            success: true,
            message: "Account created successfully!",
            token,
            user: {
                id: newUser._id,
                name: newUser.name,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role
            }
        });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ success: false, message: "Server error during registration" });
    }
});

// Login route (Real DB user verification)
router.post("/login", async (req, res) => {
    try {
        await seedVendorAccount();
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ success: false, message: "Username/Email and password are required" });
        }

        const query = username.trim().toLowerCase();
        const user = await User.findOne({
            $or: [{ username: query }, { email: query }]
        });

        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const isMatch = user.verifyPassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const token = createSessionToken(user);

        res.json({
            success: true,
            message: "Logged in successfully",
            token,
            username: user.username,
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                role: user.role || "customer"
            }
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ success: false, message: "Server error during login" });
    }
});

// Get current user profile route
router.get("/me", requireAuth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-passwordHash -salt");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching user profile" });
    }
});

module.exports = router;
module.exports.requireAuth = requireAuth;
