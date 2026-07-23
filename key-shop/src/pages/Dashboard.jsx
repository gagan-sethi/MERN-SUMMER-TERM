import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const TRACKING_STEPS = [
  { key: "paid", label: "Paid" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" }
];

function getStepIndex(status) {
  const normalized = (status || "Paid").toLowerCase();
  if (normalized === "cancelled") return -1;
  if (normalized === "delivered") return 3;
  if (normalized === "shipped") return 2;
  if (normalized === "processing") return 1;
  return 0; // Paid / Placed
}

function Dashboard({ session, onLogout }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!session?.token) {
      navigate("/");
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/payments/my-orders`, {
          headers: {
            Authorization: `Bearer ${session.token}`
          }
        });
        const data = await res.json();
        if (res.status === 401) {
          onLogout();
          toast.error("Session expired, please log in again.");
          navigate("/");
          return;
        }
        if (!res.ok) throw new Error(data.message || "Failed to fetch orders");
        setOrders(data.orders || []);
      } catch (err) {
        console.error("Dashboard error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [session, navigate, onLogout]);

  if (!session) return null;

  return (
    <div className="dashboardPage">
      <div className="dashboardHeader">
        <div className="userBanner">
          <div className="avatarCircle">
            {session.name ? session.name[0].toUpperCase() : session.username[0].toUpperCase()}
          </div>
          <div className="userInfo">
            <div className="userInfoHeader">
              <span className="customerBadge">Verified Customer</span>
              {session.role === "vendor" && <span className="vendorBadge">Vendor Account</span>}
            </div>
            <h1>Welcome back, {session.name || session.username}!</h1>
            <p className="userEmailText">@{session.username} {session.email && `• ${session.email}`}</p>
          </div>
        </div>
        <button type="button" className="logoutBtn" onClick={onLogout}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          <span>Log Out</span>
        </button>
      </div>

      <div className="dashboardBody">
        <div className="dashboardTitleBar">
          <h2>Your Orders & Live Tracking</h2>
          <span className="ordersCountBadge">{orders.length} Total {orders.length === 1 ? "Order" : "Orders"}</span>
        </div>

        {loading ? (
          <div className="productsLoading">
            <div className="spinner"></div>
            <p>Fetching your order history...</p>
          </div>
        ) : error ? (
          <div className="dashboardError">{error}</div>
        ) : orders.length === 0 ? (
          <div className="emptyOrdersCard">
            <div className="emptyOrdersIcon">📦</div>
            <h3>No orders placed yet</h3>
            <p>Discover our collection of handcrafted keychains and place your first order!</p>
            <Link to="/products" className="shopNowBtn">
              Browse Keychains →
            </Link>
          </div>
        ) : (
          <div className="ordersList">
            {orders.map((order) => {
              const currentStep = getStepIndex(order.status);
              const isCancelled = order.status?.toLowerCase() === "cancelled";

              return (
                <div key={order._id || order.id} className="orderCard">
                  <div className="orderMetaHeader">
                    <div className="orderIdGroup">
                      <span className="orderIdLabel">Order ID:</span>
                      <strong className="orderIdValue">{order._id || order.id}</strong>
                      <span className="orderDate">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    </div>
                    <span className={`statusBadge ${order.status?.toLowerCase() || "paid"}`}>
                      {order.status || "Paid"}
                    </span>
                  </div>

                  {/* Live Delivery Tracker Bar */}
                  <div className="orderTrackerSection">
                    <div className="trackerHeaderRow">
                      <span className="trackerTitle">Delivery Progress</span>
                      <span className="trackerSubtitle">Real-time status updates</span>
                    </div>

                    {isCancelled ? (
                      <div className="cancelledBanner">Order was Cancelled</div>
                    ) : (
                      <div className="trackerSteps">
                        <div
                          className="trackerLineProgress"
                          style={{ width: `${Math.max(0, Math.min(100, (currentStep / 3) * 100))}%` }}
                        ></div>
                        {TRACKING_STEPS.map((step, stepIdx) => (
                          <div
                            key={step.key}
                            className={`trackerStep ${stepIdx <= currentStep ? "completed" : ""} ${
                              stepIdx === currentStep ? "current" : ""
                            }`}
                          >
                            <div className="stepDot">
                              {stepIdx < currentStep ? (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                  <polyline points="20 6 9 17 4 12"/>
                                </svg>
                              ) : (
                                stepIdx + 1
                              )}
                            </div>
                            <span className="stepLabel">{step.label}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="orderItemsList">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="orderItemRow">
                        <img
                          src={item.image || "/images/shopping.webp"}
                          alt={item.name}
                          className="orderItemThumb"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/images/shopping.webp";
                          }}
                        />
                        <div className="orderItemDetails">
                          <h4>{item.name}</h4>
                          <p>
                            Quantity: {item.quantity} × ₹{item.price}
                          </p>
                        </div>
                        <div className="orderItemSubtotal">
                          ₹{item.price * item.quantity}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="orderFooter">
                    <span className="paymentIdText">
                      Payment Ref ID: <code>{order.paymentId || "PAY-" + (order._id || order.id).slice(-8)}</code>
                    </span>
                    <div className="orderTotal">
                      Total Paid: <strong>₹{order.totalAmount}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
