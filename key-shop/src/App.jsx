import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Products from "./pages/Products";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Cart from "./pages/Cart";
import Dashboard from "./pages/Dashboard";
import VendorDashboard from "./pages/VendorDashboard";
import AuthModal from "./components/AuthModal";
import toast, { Toaster } from "react-hot-toast";
import "./App.css";

const CART_STORAGE_KEY = "keyShop_cart_items";
const SESSION_STORAGE_KEY = "keyShop_user_session";

function getInitialCart() {
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function getInitialSession() {
  try {
    const saved = localStorage.getItem(SESSION_STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function App() {
  const [cartItems, setCartItems] = useState(getInitialCart);
  const [session, setSession] = useState(getInitialSession);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState("login");

  // Sync cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (err) {
      console.error("Failed to save cart to localStorage:", err);
    }
  }, [cartItems]);

  // Sync user session to localStorage whenever it changes
  useEffect(() => {
    try {
      if (session) {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      } else {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } catch (err) {
      console.error("Failed to save session to localStorage:", err);
    }
  }, [session]);

  const addToCart = (product) => {
    if (!product) return;
    const prodId = product._id || product.id;
    const normalizedProduct = {
      ...product,
      id: prodId
    };

    const existingItem = cartItems.find((item) => (item.id || item._id) === prodId);
    const currentQty = existingItem?.quantity ?? 0;

    if (Number.isFinite(product.stock) && currentQty >= product.stock) {
      toast.error(`Sorry, ${product.name} has no more available stock!`, {
        id: "cart-toast"
      });
      return;
    }

    setCartItems((prevItems) => {
      const matchIndex = prevItems.findIndex((item) => (item.id || item._id) === prodId);
      if (matchIndex >= 0) {
        const updated = [...prevItems];
        updated[matchIndex] = {
          ...updated[matchIndex],
          quantity: updated[matchIndex].quantity + 1
        };
        return updated;
      }
      return [...prevItems, { ...normalizedProduct, quantity: 1 }];
    });

    toast.success(`${product.name} (₹${product.price}) added to cart!`, {
      id: "cart-toast"
    });
  };

  const increaseQuantity = (productId) => {
    setCartItems((prev) =>
      prev.map((item) =>
        (item.id || item._id) === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decreaseQuantity = (productId) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          (item.id || item._id) === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (productId) => {
    setCartItems((prev) => prev.filter((item) => (item.id || item._id) !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const handleOpenAuthModal = (mode = "login") => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleCloseAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const handleAuthSuccess = (sessionData) => {
    setSession(sessionData);
  };

  const handleLogout = () => {
    setSession(null);
    toast.success("Logged out successfully");
  };

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <BrowserRouter>
      <div className="app">
        <Header
          cartCount={cartCount}
          session={session}
          onOpenAuthModal={handleOpenAuthModal}
          onLogout={handleLogout}
        />

        <main className="mainContentArea">
          <Routes>
            <Route path="/" element={<Home addToCart={addToCart} />} />
            <Route path="/products" element={<Products addToCart={addToCart} />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact-us" element={<Contact />} />
            <Route
              path="/cart"
              element={
                <Cart
                  cartItems={cartItems}
                  increaseQuantity={increaseQuantity}
                  decreaseQuantity={decreaseQuantity}
                  removeItem={removeItem}
                  clearCart={clearCart}
                  session={session}
                  onOpenAuthModal={handleOpenAuthModal}
                />
              }
            />
            <Route
              path="/dashboard"
              element={<Dashboard session={session} onLogout={handleLogout} />}
            />
            <Route
              path="/vendor-dashboard"
              element={<VendorDashboard session={session} onLogout={handleLogout} />}
            />
          </Routes>
        </main>

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={handleCloseAuthModal}
          onAuthSuccess={handleAuthSuccess}
          initialMode={authModalMode}
        />

        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{
            duration: 3500,
            style: {
              background: "#1f2937",
              color: "#fff",
              borderRadius: "10px",
              padding: "12px 18px",
              fontSize: "15px"
            },
            success: {
              iconTheme: {
                primary: "#10b981",
                secondary: "#fff"
              }
            },
            error: {
              style: {
                background: "#ef4444",
                color: "#fff"
              }
            }
          }}
        />

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
