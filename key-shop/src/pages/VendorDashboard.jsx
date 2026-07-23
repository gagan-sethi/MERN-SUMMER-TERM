import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function VendorDashboard({ session, onLogout }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("analytics"); // "analytics" | "products" | "orders"

  // Analytics & Stats State
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    lowStockCount: 0
  });

  // Data Collections State
  const [storeOrders, setStoreOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // New / Edit Product Form State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    image: "/images/shopping.webp",
    stock: "10",
    category: "General"
  });

  useEffect(() => {
    if (!session || session.role !== "vendor") {
      toast.error("Access restricted to Vendors");
      navigate("/");
      return;
    }

    fetchVendorData();
  }, [session, navigate]);

  const fetchVendorData = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${session.token}` };

      // Fetch Stats & Recent Orders
      const statsRes = await fetch(`${API_URL}/api/vendor/stats`, { headers });
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.stats);
      }

      // Fetch All Orders
      const ordersRes = await fetch(`${API_URL}/api/vendor/orders`, { headers });
      const ordersData = await ordersRes.json();
      if (ordersData.success) {
        setStoreOrders(ordersData.orders || []);
      }

      // Fetch All Products
      const productsRes = await fetch(`${API_URL}/api/products`);
      const productsData = await productsRes.json();
      if (productsData.success) {
        setProducts(productsData.products || []);
      }
    } catch (err) {
      console.error("Fetch vendor data error:", err);
      toast.error("Failed to load vendor control panel");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/api/vendor/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update order status");

      toast.success(`Order status updated to ${newStatus}`);
      fetchVendorData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProductForm((prev) => ({
        ...prev,
        image: reader.result
      }));
      toast.success("Image uploaded successfully!");
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      if (!productForm.image) {
        toast.error("Please upload or provide an image for the product");
        return;
      }

      const isEdit = !!editingProductId;
      const endpoint = isEdit
        ? `${API_URL}/api/products/update-product/${editingProductId}`
        : `${API_URL}/api/products/save-new-product`;
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`
        },
        body: JSON.stringify({
          name: productForm.name,
          description: productForm.description,
          price: Number(productForm.price),
          image: productForm.image || "/images/shopping.webp",
          stock: Number(productForm.stock),
          category: productForm.category
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Product save failed");

      toast.success(isEdit ? "Product updated successfully!" : "New product published!");
      setShowProductModal(false);
      setEditingProductId(null);
      setProductForm({
        name: "",
        description: "",
        price: "",
        image: "/images/shopping.webp",
        stock: "10",
        category: "General"
      });
      fetchVendorData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`${API_URL}/api/products/delete-product/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete product");

      toast.success("Product deleted successfully!");
      fetchVendorData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const openEditModal = (product) => {
    setEditingProductId(product._id || product.id);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
      stock: product.stock,
      category: product.category || "General"
    });
    setShowProductModal(true);
  };

  if (!session) return null;

  return (
    <div className="vendorDashboardPage">
      <div className="vendorHeaderBar">
        <div className="vendorTitleGroup">
          <span className="vendorRoleBadge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
            Vendor Control Panel
          </span>
          <h1>Welcome, {session.name || session.username}</h1>
          <p>Manage product listings, inventory stock, and track store revenues</p>
        </div>
        <button type="button" className="vendorLogoutBtn" onClick={onLogout}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          <span>Vendor Logout</span>
        </button>
      </div>

      <div className="vendorTabs">
        <button
          type="button"
          className={`tabBtn ${activeTab === "analytics" ? "active" : ""}`}
          onClick={() => setActiveTab("analytics")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="20" x2="18" y2="10"/>
            <line x1="12" y1="20" x2="12" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
          <span>Analytics & Overview</span>
        </button>

        <button
          type="button"
          className={`tabBtn ${activeTab === "products" ? "active" : ""}`}
          onClick={() => setActiveTab("products")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          </svg>
          <span>Manage Products ({products.length})</span>
        </button>

        <button
          type="button"
          className={`tabBtn ${activeTab === "orders" ? "active" : ""}`}
          onClick={() => setActiveTab("orders")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="21" r="1"/>
            <circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          <span>Store Orders ({storeOrders.length})</span>
        </button>
      </div>

      {loading ? (
        <div className="productsLoading">
          <div className="spinner"></div>
          <p>Loading Vendor Portal...</p>
        </div>
      ) : (
        <>
          {/* TAB 1: ANALYTICS OVERVIEW */}
          {activeTab === "analytics" && (
            <div className="analyticsSection">
              <div className="statsCardsGrid">
                <div className="statCard revenueCard">
                  <div className="statCardIcon">💰</div>
                  <div className="statCardContent">
                    <span className="statLabel">Total Sales Revenue</span>
                    <strong className="statValue">₹{stats.totalRevenue}</strong>
                    <span className="statSub">Verified Store Earnings</span>
                  </div>
                </div>

                <div className="statCard ordersCard">
                  <div className="statCardIcon">📦</div>
                  <div className="statCardContent">
                    <span className="statLabel">Total Orders</span>
                    <strong className="statValue">{stats.totalOrders}</strong>
                    <span className="statSub">Customer Purchases</span>
                  </div>
                </div>

                <div className="statCard inventoryCard">
                  <div className="statCardIcon">🔑</div>
                  <div className="statCardContent">
                    <span className="statLabel">Active Products</span>
                    <strong className="statValue">{stats.totalProducts}</strong>
                    <span className="statSub">Live in Catalog</span>
                  </div>
                </div>

                <div className="statCard warningCard">
                  <div className="statCardIcon">⚠️</div>
                  <div className="statCardContent">
                    <span className="statLabel">Low Stock Alert</span>
                    <strong className="statValue">{stats.lowStockCount}</strong>
                    <span className="statSub">Items ≤ 5 stock</span>
                  </div>
                </div>
              </div>

              <div className="vendorTableCard">
                <div className="tableHeaderRow">
                  <h3>Recent Customer Orders</h3>
                  <span className="tableSubtitle">Latest purchases needing action</span>
                </div>
                {storeOrders.length === 0 ? (
                  <p className="noDataMsg">No customer orders placed yet.</p>
                ) : (
                  <div className="tableWrapper">
                    <table className="vendorTable">
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Customer</th>
                          <th>Date</th>
                          <th>Items</th>
                          <th>Total Amount</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {storeOrders.slice(0, 5).map((order) => (
                          <tr key={order._id || order.id}>
                            <td><code className="orderIdChip">{(order._id || order.id).slice(-8)}</code></td>
                            <td><strong>@{order.username}</strong></td>
                            <td>
                              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                month: "short",
                                day: "numeric"
                              })}
                            </td>
                            <td>{order.items?.length || 0} items</td>
                            <td><strong className="priceHighlight">₹{order.totalAmount}</strong></td>
                            <td>
                              <span className={`statusTag ${order.status?.toLowerCase() || "paid"}`}>
                                {order.status || "Paid"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCT MANAGEMENT */}
          {activeTab === "products" && (
            <div className="productsManagementSection">
              <div className="sectionActionBar">
                <div>
                  <h2>Product Catalog Management</h2>
                  <p>Add, edit, or remove keychains from the live store</p>
                </div>
                <button
                  type="button"
                  className="uploadNewProductBtn"
                  onClick={() => {
                    setEditingProductId(null);
                    setProductForm({
                      name: "",
                      description: "",
                      price: "",
                      image: "/images/shopping.webp",
                      stock: "10",
                      category: "General"
                    });
                    setShowProductModal(true);
                  }}
                >
                  + Upload New Product
                </button>
              </div>

              <div className="vendorProductGrid">
                {products.map((prod) => (
                  <div key={prod._id || prod.id} className="vendorProductCard">
                    <div className="vendorProdImgWrapper">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="vendorProdImg"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/images/shopping.webp";
                        }}
                      />
                      <span className="vendorCatBadge">{prod.category || "General"}</span>
                    </div>

                    <div className="vendorProdInfo">
                      <h4>{prod.name}</h4>
                      <p>{prod.description}</p>
                      <div className="vendorPriceRow">
                        <strong>₹{prod.price}</strong>
                        <span className={`stockIndicator ${prod.stock <= 5 ? "low" : ""}`}>
                          Stock: {prod.stock}
                        </span>
                      </div>
                      <div className="vendorProdActions">
                        <button
                          type="button"
                          className="editProdBtn"
                          onClick={() => openEditModal(prod)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="deleteProdBtn"
                          onClick={() => handleDeleteProduct(prod._id || prod.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: STORE ORDERS FULFILLMENT */}
          {activeTab === "orders" && (
            <div className="ordersManagementSection">
              <div className="sectionActionBar">
                <div>
                  <h2>Customer Order Fulfillment</h2>
                  <p>Update tracking stages for customer orders</p>
                </div>
              </div>

              <div className="vendorTableCard">
                {storeOrders.length === 0 ? (
                  <p className="noDataMsg">No orders available</p>
                ) : (
                  <div className="tableWrapper">
                    <table className="vendorTable">
                      <thead>
                        <tr>
                          <th>Order Details</th>
                          <th>Customer</th>
                          <th>Items List</th>
                          <th>Total Price</th>
                          <th>Current Status</th>
                          <th>Fulfillment Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {storeOrders.map((order) => (
                          <tr key={order._id || order.id}>
                            <td>
                              <div className="orderMetaCol">
                                <strong>ID: {(order._id || order.id).slice(-8)}</strong>
                                <span>
                                  {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit"
                                  })}
                                </span>
                              </div>
                            </td>
                            <td>
                              <strong>@{order.username}</strong>
                            </td>
                            <td>
                              <ul className="orderItemsMiniList">
                                {order.items?.map((item, idx) => (
                                  <li key={idx}>
                                    {item.name} × {item.quantity} (₹{item.price})
                                  </li>
                                ))}
                              </ul>
                            </td>
                            <td>
                              <strong className="orderTotalAmt">₹{order.totalAmount}</strong>
                            </td>
                            <td>
                              <span className={`statusTag ${order.status?.toLowerCase() || "paid"}`}>
                                {order.status || "Paid"}
                              </span>
                            </td>
                            <td>
                              <select
                                className="statusSelect"
                                value={order.status || "Paid"}
                                onChange={(e) =>
                                  handleUpdateOrderStatus(order._id || order.id, e.target.value)
                                }
                              >
                                <option value="Paid">Paid</option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* UPLOAD / EDIT PRODUCT MODAL */}
      {showProductModal && (
        <div className="modalOverlay" onClick={() => setShowProductModal(false)}>
          <div className="modalContent authModalCard productModalCard" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="authCloseBtn"
              onClick={() => setShowProductModal(false)}
            >
              ×
            </button>
            <div className="authModalHeader">
              <h2 className="authTitle">
                {editingProductId ? "Edit Product" : "Upload New Keychain"}
              </h2>
              <p className="authSubtitle">Publish product details into live shop catalog</p>
            </div>

            <form onSubmit={handleSaveProduct} className="authForm">
              <div className="formGroup">
                <label>Product Name</label>
                <input
                  type="text"
                  placeholder="e.g. Superhero Key Chain"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="formGroup">
                <label>Description</label>
                <input
                  type="text"
                  placeholder="e.g. Durable metal key chain"
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  required
                />
              </div>

              <div className="formRowGrid">
                <div className="formGroup">
                  <label>Price (₹)</label>
                  <input
                    type="number"
                    placeholder="199"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    required
                    min="0"
                  />
                </div>

                <div className="formGroup">
                  <label>Inventory Stock</label>
                  <input
                    type="number"
                    placeholder="20"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    required
                    min="0"
                  />
                </div>
              </div>

              <div className="formGroup">
                <label>Category</label>
                <select
                  value={productForm.category}
                  onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                >
                  <option value="Cartoon">Cartoon</option>
                  <option value="Customized">Customized</option>
                  <option value="Metal">Metal</option>
                  <option value="Premium">Premium</option>
                  <option value="Avengers">Avengers</option>
                  <option value="Leather">Leather</option>
                  <option value="General">General</option>
                </select>
              </div>

              {/* FILE IMAGE UPLOAD DROPZONE */}
              <div className="formGroup">
                <label>Product Image</label>
                <div className="imageUploadContainer">
                  {productForm.image && productForm.image !== "/images/shopping.webp" ? (
                    <div className="imagePreviewBox">
                      <img src={productForm.image} alt="Uploaded Preview" className="previewImg" />
                      <button
                        type="button"
                        className="removeImageBtn"
                        onClick={() => setProductForm({ ...productForm, image: "" })}
                      >
                        ✕ Remove Image
                      </button>
                    </div>
                  ) : (
                    <label htmlFor="productImageFileInput" className="uploadDropzoneLabel">
                      <div className="uploadCloudIcon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="17 8 12 3 7 8"/>
                          <line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                      </div>
                      <div className="uploadTextGroup">
                        <strong>Click to select image file from computer</strong>
                        <span>Supports JPG, PNG, WEBP (Max 5MB)</span>
                      </div>
                      <input
                        id="productImageFileInput"
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        style={{ display: "none" }}
                      />
                    </label>
                  )}
                </div>

                <div className="urlToggleContainer">
                  <button
                    type="button"
                    className="toggleUrlBtn"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                  >
                    {showUrlInput ? "Hide image URL option" : "Or use image path / URL"}
                  </button>
                </div>

                {showUrlInput && (
                  <input
                    type="text"
                    placeholder="/images/shopping.webp or image link..."
                    value={productForm.image}
                    onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                    className="urlInputSub"
                  />
                )}
              </div>

              <button type="submit" className="authSubmitBtn">
                {editingProductId ? "Update Product" : "Save & Publish Product"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default VendorDashboard;
