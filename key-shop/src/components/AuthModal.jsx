import { useState } from "react";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function AuthModal({ isOpen, onClose, onAuthSuccess, initialMode = "login" }) {
  const [mode, setMode] = useState(initialMode); // "login" or "signup"
  const [role, setRole] = useState("customer"); // "customer" or "vendor"
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const endpoint = mode === "signup" ? "/api/auth/signup" : "/api/auth/login";
      const payload =
        mode === "signup"
          ? {
              name: formData.name,
              username: formData.username,
              email: formData.email,
              password: formData.password,
              role
            }
          : {
              username: formData.username,
              password: formData.password
            };

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `${mode === "signup" ? "Signup" : "Login"} failed`);
      }

      toast.success(
        mode === "signup"
          ? `Account created as ${role === "vendor" ? "Vendor" : "Customer"}!`
          : `Welcome back, ${data.user?.name || data.username || "User"}!`
      );

      const session = {
        username: data.user?.username || data.username,
        name: data.user?.name || data.username,
        email: data.user?.email || "",
        role: data.user?.role || role || "customer",
        token: data.token
      };

      onAuthSuccess(session);
      onClose();
    } catch (err) {
      setErrorMessage(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalContent authModalCard" onClick={(e) => e.stopPropagation()}>
        <button
          className="authCloseBtn"
          type="button"
          onClick={onClose}
          aria-label="Close modal"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <div className="authModalHeader">
          <div className="authBrandBadge">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M21 2l-2 2m-2-2l2 2M3 11a7 7 0 1 0 14 0 7 7 0 1 0-14 0z"/>
              <path d="M15.5 15.5L20 20"/>
              <path d="M7 11a2 2 0 1 1 4 0 2 2 0 0 1-4 0z"/>
            </svg>
            <span>Key Shop</span>
          </div>
          <h2 className="authTitle">
            {mode === "login" ? "Welcome Back!" : "Create Your Account"}
          </h2>
          <p className="authSubtitle">
            {mode === "login"
              ? "Sign in to access your orders and saved keychains"
              : "Join Key Shop to buy or list custom handcrafted keychains"}
          </p>
        </div>

        <div className="authTabs">
          <button
            type="button"
            className={`authTab ${mode === "login" ? "active" : ""}`}
            onClick={() => {
              setMode("login");
              setErrorMessage("");
            }}
          >
            Log In
          </button>
          <button
            type="button"
            className={`authTab ${mode === "signup" ? "active" : ""}`}
            onClick={() => {
              setMode("signup");
              setErrorMessage("");
            }}
          >
            Create Account
          </button>
        </div>

        {mode === "signup" && (
          <div className="roleSelectorGroup">
            <label className="roleLabel">I want to register as:</label>
            <div className="roleCardsGrid">
              <div
                className={`roleCard ${role === "customer" ? "selected" : ""}`}
                onClick={() => setRole("customer")}
              >
                <div className="roleRadio">
                  <div className="radioDot"></div>
                </div>
                <div className="roleCardInfo">
                  <strong>Customer</strong>
                  <span>Buy keychains & track orders</span>
                </div>
              </div>

              <div
                className={`roleCard ${role === "vendor" ? "selected" : ""}`}
                onClick={() => setRole("vendor")}
              >
                <div className="roleRadio">
                  <div className="radioDot"></div>
                </div>
                <div className="roleCardInfo">
                  <strong>Vendor / Seller</strong>
                  <span>List & sell custom keychains</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="authForm">
          {mode === "signup" && (
            <div className="formGroup">
              <label htmlFor="name">Full Name</label>
              <div className="inputWithIcon">
                <svg className="inputIcon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          )}

          <div className="formGroup">
            <label htmlFor="username">Username {mode === "login" && "/ Email"}</label>
            <div className="inputWithIcon">
              <svg className="inputIcon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="4"/>
                <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"/>
              </svg>
              <input
                id="username"
                name="username"
                type="text"
                placeholder={mode === "login" ? "Username or email" : "Choose username"}
                value={formData.username}
                onChange={handleChange}
                required
                autoFocus
              />
            </div>
          </div>

          {mode === "signup" && (
            <div className="formGroup">
              <label htmlFor="email">Email Address</label>
              <div className="inputWithIcon">
                <svg className="inputIcon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          )}

          <div className="formGroup">
            <label htmlFor="password">Password</label>
            <div className="inputWithIcon">
              <svg className="inputIcon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>
          </div>

          {mode === "login" && (
            <div className="vendorDemoNotice">
              <span className="noticeIcon">💡</span>
              <div>
                <strong>Vendor Demo Account</strong>
                <span>Username: <code>vendor</code> | Password: <code>vendor123</code></span>
              </div>
            </div>
          )}

          {errorMessage && <div className="authErrorBanner">{errorMessage}</div>}

          <button type="submit" className="authSubmitBtn" disabled={loading}>
            {loading ? (
              <span className="btnLoadingState">
                <span className="spinnerIcon"></span> Processing...
              </span>
            ) : mode === "login" ? (
              "Log In to Account →"
            ) : (
              `Sign Up as ${role === "vendor" ? "Vendor" : "Customer"} →`
            )}
          </button>

          <p className="authToggleText">
            {mode === "login" ? "Don't have an account yet?" : "Already registered?"}{" "}
            <button
              type="button"
              className="authToggleLink"
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setErrorMessage("");
              }}
            >
              {mode === "login" ? "Create an account" : "Log in here"}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

export default AuthModal;
