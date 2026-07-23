import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

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

function Cart({ cartItems, increaseQuantity, decreaseQuantity, removeItem, clearCart, session, onOpenAuthModal }) {
  const navigate = useNavigate();
  const totalAmount = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  const [showClearConfirmation, setShowClearConfirmation] = useState(false);
  const [selectedItemToRemove, setSelectedItemToRemove] = useState(null);
  const [checkoutMessage, setCheckoutMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDecreaseQuantity = (item) => {
    if (item.quantity === 1) {
      setSelectedItemToRemove(item);
    } else {
      decreaseQuantity(item.id || item._id);
    }
  };

  const startCheckout = async () => {
    if (!session?.token) {
      onOpenAuthModal("login");
      return;
    }

    setIsProcessing(true);
    setCheckoutMessage("");

    try {
      const sdkLoaded = await loadRazorpayCheckout();

      const response = await fetch(`${API_URL}/api/payments/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`
        },
        body: JSON.stringify({
          items: cartItems.map((item) => ({
            productId: item.id || item._id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image
          }))
        })
      });

      const orderData = await response.json();

      if (response.status === 401) {
        toast.error("Session expired. Please log in again.");
        onOpenAuthModal("login");
        setIsProcessing(false);
        return;
      }

      if (!response.ok) {
        throw new Error(orderData.message || "Unable to process payment order");
      }

      // If test mock order mode
      if (orderData.isMock || !sdkLoaded || !window.Razorpay) {
        const verifyResponse = await fetch(`${API_URL}/api/payments/verify`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.token}`
          },
          body: JSON.stringify({
            order_id: orderData.order.id
          })
        });

        const verifyData = await verifyResponse.json();
        if (!verifyResponse.ok) {
          throw new Error(verifyData.message || "Payment verification failed");
        }

        clearCart();
        toast.success("Order placed successfully!");
        setCheckoutMessage(`Order placed successfully! Payment ID: ${verifyData.paymentId}`);
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
        return;
      }

      // Standard Razorpay Checkout
      const checkout = new window.Razorpay({
        key: orderData.keyId,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "Key Shop",
        description: `${totalItems} Key Chain${totalItems === 1 ? "" : "s"}`,
        order_id: orderData.order.id,
        handler: async (payment) => {
          try {
            const verifyResponse = await fetch(`${API_URL}/api/payments/verify`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.token}`
              },
              body: JSON.stringify(payment)
            });
            const verifyData = await verifyResponse.json();
            if (!verifyResponse.ok) {
              throw new Error(verifyData.message || "Payment verification failed");
            }

            clearCart();
            toast.success("Order placed successfully!");
            setCheckoutMessage(`Payment successful! Payment ID: ${verifyData.paymentId}`);
            setTimeout(() => {
              navigate("/dashboard");
            }, 1500);
          } catch (error) {
            toast.error(error.message);
            setCheckoutMessage(error.message);
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: session.name || session.username,
          email: session.email || ""
        },
        theme: { color: "#f59e0b" },
        modal: { ondismiss: () => setIsProcessing(false) }
      });

      checkout.on("payment.failed", (res) => {
        toast.error(res.error?.description || "Payment failed");
        setIsProcessing(false);
      });

      checkout.open();
    } catch (error) {
      toast.error(error.message);
      setCheckoutMessage(error.message);
      setIsProcessing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <section className="cartPage emptyCartPage">
        <div className="emptyCartBox">
          <div className="emptyCartIcon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="9" cy="21" r="1"/>
              <circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
          </div>
          <h1>Your Shopping Cart is Empty</h1>
          {checkoutMessage ? (
            <p className="checkoutSuccess">{checkoutMessage}</p>
          ) : (
            <p>Looks like you haven't added any keychains to your cart yet.</p>
          )}
          <Link to="/products" className="continueShoppingBtn">
            Explore Keychains Catalog →
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="cartPage">
      <div className="cartHeading">
        <div>
          <h1>Shopping Cart ({totalItems} {totalItems === 1 ? "item" : "items"})</h1>
          <p className="cartSubheading">Review your selected keychains before checking out</p>
        </div>
        <button
          type="button"
          className="clearCartBtn"
          onClick={() => setShowClearConfirmation(true)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
          <span>Clear Cart</span>
        </button>
      </div>

      <div className="cartLayout">
        <div className="cartItemsList">
          {cartItems.map((item) => (
            <div className="cartItemRow" key={item.id || item._id}>
              <img
                src={item.image || "/images/shopping.webp"}
                alt={item.name}
                className="cartItemImg"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/images/shopping.webp";
                }}
              />

              <div className="cartItemDetails">
                <span className="cartItemCategory">{item.category || "Keychain"}</span>
                <h3>{item.name}</h3>
                <span className="unitPrice">₹{item.price} per unit</span>

                <div className="quantityControl">
                  <button
                    type="button"
                    onClick={() => handleDecreaseQuantity(item)}
                    aria-label={`Decrease ${item.name} quantity`}
                  >
                    −
                  </button>
                  <span className="qtyNum">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => increaseQuantity(item.id || item._id)}
                    aria-label={`Increase ${item.name} quantity`}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="cartItemPriceSection">
                <span className="subtotalLabel">Subtotal</span>
                <strong className="itemSubtotal">₹{item.price * item.quantity}</strong>
                <button
                  type="button"
                  className="removeItemBtn"
                  onClick={() => removeItem(item.id || item._id)}
                  title="Remove item"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                  <span>Remove</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="cartSummaryCard">
          <h2>Order Summary</h2>
          <div className="summaryDivider"></div>

          <div className="summaryRow">
            <span>Subtotal ({totalItems} items)</span>
            <strong>₹{totalAmount}</strong>
          </div>
          <div className="summaryRow">
            <span>Delivery & Shipping</span>
            <strong className="freeShippingText">FREE</strong>
          </div>
          <div className="summaryRow">
            <span>Estimated Taxes</span>
            <span>Included</span>
          </div>

          <div className="summaryDivider"></div>

          <div className="summaryRow totalRow">
            <span>Total Amount</span>
            <strong className="finalTotalValue">₹{totalAmount}</strong>
          </div>

          {session ? (
            <div className="signedInNotice">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <span>Signed in as <strong>{session.name || session.username}</strong></span>
            </div>
          ) : (
            <div className="authPromptNotice">
              🔒 You will be asked to <strong>Sign In</strong> or <strong>Register</strong> to place order.
            </div>
          )}

          {checkoutMessage && <p className="checkoutStatusMessage">{checkoutMessage}</p>}

          <button
            type="button"
            className="checkOutBtn"
            onClick={startCheckout}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <div className="btnSpinnerWrapper">
                <span className="btnSpinner"></span>
                <span>Processing Order...</span>
              </div>
            ) : session ? (
              "Proceed to Secure Checkout →"
            ) : (
              "Login / Register to Buy"
            )}
          </button>

          <Link to="/products" className="continueShoppingLink">
            ← Continue Shopping
          </Link>
        </div>
      </div>

      {showClearConfirmation && (
        <div className="modalOverlay" onClick={() => setShowClearConfirmation(false)}>
          <div className="modalContent confirmModal" onClick={(e) => e.stopPropagation()}>
            <div className="modalHeaderIcon warningIcon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <h3>Clear Shopping Cart?</h3>
            <p>Are you sure you want to remove all {totalItems} items from your cart?</p>
            <div className="modalActions">
              <button
                type="button"
                className="confirmDeleteBtn"
                onClick={() => {
                  clearCart();
                  setShowClearConfirmation(false);
                  toast.success("Cart cleared");
                }}
              >
                Yes, Clear Cart
              </button>
              <button
                type="button"
                className="cancelBtn"
                onClick={() => setShowClearConfirmation(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedItemToRemove && (
        <div className="modalOverlay" onClick={() => setSelectedItemToRemove(null)}>
          <div className="modalContent confirmModal" onClick={(e) => e.stopPropagation()}>
            <h3>Remove Item?</h3>
            <p>
              Remove <strong>{selectedItemToRemove.name}</strong> from your cart?
            </p>
            <div className="modalActions">
              <button
                type="button"
                className="confirmDeleteBtn"
                onClick={() => {
                  removeItem(selectedItemToRemove.id || selectedItemToRemove._id);
                  setSelectedItemToRemove(null);
                  toast.success("Item removed from cart");
                }}
              >
                Yes, Remove
              </button>
              <button
                type="button"
                className="cancelBtn"
                onClick={() => setSelectedItemToRemove(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Cart;
