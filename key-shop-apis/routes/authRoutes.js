const crypto = require("crypto");
const express = require("express");

const router = express.Router();
const STATIC_USERNAME = "gagan";
const STATIC_PASSWORD = "gagan123";
const SESSION_TTL_MS = 2 * 60 * 60 * 1000;

function getSessionSecret() {
    return process.env.AUTH_TOKEN_SECRET || "key-shop-development-session-secret";
}

function sign(payload) {
    return crypto.createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
}

function createSessionToken(username) {
    const payload = Buffer.from(JSON.stringify({
        username,
        expiresAt: Date.now() + SESSION_TTL_MS
    })).toString("base64url");
    return `${payload}.${sign(payload)}`;
}

function requireAuth(req, res, next) {
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
        if (session.username !== STATIC_USERNAME || session.expiresAt < Date.now()) {
            return res.status(401).json({ success: false, message: "Your login session has expired" });
        }
        req.user = session;
        next();
    } catch {
        return res.status(401).json({ success: false, message: "Your login session is invalid" });
    }
}

router.post("/login", (req, res) => {
    const { username, password } = req.body;
    if (username !== STATIC_USERNAME || password !== STATIC_PASSWORD) {
        return res.status(401).json({ success: false, message: "Incorrect username or password" });
    }

    res.json({
        success: true,
        username: STATIC_USERNAME,
        token: createSessionToken(STATIC_USERNAME)
    });
});

module.exports = router;
module.exports.requireAuth = requireAuth;
