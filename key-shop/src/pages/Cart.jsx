import { Link } from "react-router-dom";
import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const SESSION_KEY = "keyShopSession";

function getSavedSession() {
    try {
        return JSON.parse(sessionStorage.getItem(SESSION_KEY)) || null;
    } catch {
        return null;
    }
}

function loadRazorpayCheckout() {
    if (window.Razorpay) return Promise.resolve(true);

    return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
}

function Cart({ cartItems, increaseQuantity, decreaseQuantity, removeItem, clearCart }) {
    const totalAmount = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showItemConfirmation, setShowItemConfirmation] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showLogin, setShowLogin] = useState(false);
    const [session, setSession] = useState(getSavedSession);
    const [loginData, setLoginData] = useState({ username: "", password: "" });
    const [loginError, setLoginError] = useState("");
    const [checkoutMessage, setCheckoutMessage] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    const handleLoginInput = (event) => {
        const { name, value } = event.target;
        setLoginData((current) => ({ ...current, [name]: value }));
        setLoginError("");
    };

    const startPayment = async (activeSession = session) => {
        if (!activeSession?.token) {
            setShowLogin(true);
            return;
        }

        setIsProcessing(true);
        setCheckoutMessage("");

        try {
            const sdkLoaded = await loadRazorpayCheckout();
            if (!sdkLoaded) throw new Error("Unable to load Razorpay Checkout");

            const orderResponse = await fetch(`${API_URL}/api/payments/orders`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${activeSession.token}`
                },
                body: JSON.stringify({
                    items: cartItems.map((item) => ({
                        productId: item.id,
                        quantity: item.quantity
                    }))
                })
            });
            const orderData = await orderResponse.json();

            if (orderResponse.status === 401) {
                sessionStorage.removeItem(SESSION_KEY);
                setSession(null);
                setShowLogin(true);
            }
            if (!orderResponse.ok) throw new Error(orderData.message || "Unable to start payment");

            const checkout = new window.Razorpay({
                key: orderData.keyId,
                amount: orderData.order.amount,
                currency: orderData.order.currency,
                name: "Key Shop",
                description: `${totalItems} key chain${totalItems === 1 ? "" : "s"}`,
                order_id: orderData.order.id,
                handler: async (payment) => {
                    try {
                        const verifyResponse = await fetch(`${API_URL}/api/payments/verify`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${activeSession.token}`
                            },
                            body: JSON.stringify(payment)
                        });
                        const verifyData = await verifyResponse.json();
                        if (!verifyResponse.ok) {
                            throw new Error(verifyData.message || "Payment verification failed");
                        }

                        clearCart();
                        setCheckoutMessage(`Payment successful. Payment ID: ${verifyData.paymentId}`);
                    } catch (error) {
                        setCheckoutMessage(error.message);
                    } finally {
                        setIsProcessing(false);
                    }
                },
                prefill: { name: activeSession.username },
                theme: { color: "#d97706" },
                modal: { ondismiss: () => setIsProcessing(false) }
            });

            checkout.on("payment.failed", (response) => {
                setCheckoutMessage(response.error?.description || "Payment failed. Please try again.");
                setIsProcessing(false);
            });
            checkout.open();
        } catch (error) {
            setCheckoutMessage(error.message);
            setIsProcessing(false);
        }
    };

    const handleLogin = async (event) => {
        event.preventDefault();
        setLoginError("");

        if (!loginData.username.trim() || !loginData.password) {
            setLoginError("Username and password are required");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(loginData)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Login failed");

            const nextSession = { username: data.username, token: data.token };
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
            setSession(nextSession);
            setShowLogin(false);
            setLoginData({ username: "", password: "" });
            await startPayment(nextSession);
        } catch (error) {
            setLoginError(error.message);
        }
    };

    const handleCheckout = () => {
        if (!session) {
            setShowLogin(true);
            return;
        }
        startPayment();
    };

    const handleDecreaseQuantity = (item) => {
        if (item.quantity === 1) {
            setSelectedItem(item);
            setShowItemConfirmation(true);
        } else {
            decreaseQuantity(item.id);
        }
    };

    if (cartItems.length === 0) {
        return (
            <section className="cartPage emptyCart">
                <h1>Your Cart is Empty</h1>
                {checkoutMessage ? <p className="checkoutSuccess">{checkoutMessage}</p> : (
                    <p>You have not added any key chain yet</p>
                )}
                <Link to="/" className="continueShoppingBtn">Continue Shopping</Link>
            </section>
        );
    }

    return (
        <section className="cartPage">
            <div className="cartHeading">
                <h1>Your Shopping Cart</h1>
                <button className="clearCartBtn" onClick={() => setShowConfirmation(true)}>Clear Cart</button>
            </div>

            <div className="cartLayout">
                <div className="cartItems">
                    {cartItems.map((item) => (
                        <div className="cartItem" key={item.id}>
                            <img src={item.image} alt={item.name} />
                            <div className="cartItemDetails">
                                <h3>{item.name}</h3>
                                <p>₹{item.price} each</p>
                                <div className="quantityBox">
                                    <button onClick={() => handleDecreaseQuantity(item)} aria-label={`Decrease ${item.name} quantity`}>−</button>
                                    <span>{item.quantity}</span>
                                    <button onClick={() => increaseQuantity(item.id)} aria-label={`Increase ${item.name} quantity`}>+</button>
                                </div>
                            </div>
                            <div className="cartItemRight">
                                <strong>₹{item.price * item.quantity}</strong>
                                <button className="removeBtn" onClick={() => removeItem(item.id)}>Remove</button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="cartSummary">
                    <h2>Order Summary</h2>
                    <div className="summaryRow"><span>Total Items</span><strong>{totalItems}</strong></div>
                    <div className="summaryRow totalRow"><span>Total Amount</span><strong>₹{totalAmount}</strong></div>
                    {session && <p className="loggedInAs">Signed in as <strong>{session.username}</strong></p>}
                    {checkoutMessage && <p className="checkoutMessage">{checkoutMessage}</p>}
                    <button className="checkOutBtn" onClick={handleCheckout} disabled={isProcessing}>
                        {isProcessing ? "Starting secure payment…" : session ? "Pay with Razorpay" : "Login to Checkout"}
                    </button>
                    <Link to="/" className="continueLink">Continue Shopping</Link>
                </div>
            </div>

            {showConfirmation && (
                <div className="modal">
                    <div className="modalContent">
                        <h3>Clear Cart?</h3>
                        <p>Are you sure you want to remove all items?</p>
                        <button onClick={() => { clearCart(); setShowConfirmation(false); }}>Yes</button>
                        <button onClick={() => setShowConfirmation(false)}>No</button>
                    </div>
                </div>
            )}

            {showItemConfirmation && selectedItem && (
                <div className="modal">
                    <div className="modalContent">
                        <h3>Remove Item?</h3>
                        <p>Remove <strong>{selectedItem.name}</strong> from your cart?</p>
                        <button onClick={() => { removeItem(selectedItem.id); setShowItemConfirmation(false); }}>Yes</button>
                        <button onClick={() => setShowItemConfirmation(false)}>No</button>
                    </div>
                </div>
            )}

            {showLogin && (
                <div className="modalOverlay">
                    <div className="modalContent loginModal">
                        <button className="closeBtn" type="button" onClick={() => setShowLogin(false)} aria-label="Close">×</button>
                        <h2>Login to Checkout</h2>
                        <form onSubmit={handleLogin}>
                            <div className="formGroup">
                                <label htmlFor="username">Username</label>
                                <input id="username" name="username" value={loginData.username} onChange={handleLoginInput} autoComplete="username" autoFocus />
                            </div>
                            <div className="formGroup">
                                <label htmlFor="password">Password</label>
                                <input id="password" type="password" name="password" value={loginData.password} onChange={handleLoginInput} autoComplete="current-password" />
                            </div>
                            {loginError && <p className="error">{loginError}</p>}
                            <button type="submit">Login & Pay</button>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
}

export default Cart;
