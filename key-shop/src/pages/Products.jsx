import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const FALLBACK_PRODUCTS = [
  {
    _id: "101",
    name: "Cartoon Key Chain",
    description: "Colorful, durable and super cute character design keychain.",
    price: 99,
    image: "/images/shopping.webp",
    category: "Cartoon",
    rating: 4.8,
    stock: 25
  },
  {
    _id: "102",
    name: "Name Key Chain",
    description: "Customized engraved acrylic keychain personalized with your name.",
    price: 149,
    image: "/images/name.webp",
    category: "Customized",
    rating: 4.9,
    stock: 15
  },
  {
    _id: "103",
    name: "Leather Key Chain",
    description: "Premium classy look made with handcrafted genuine leather.",
    price: 199,
    image: "/images/leather.jpg",
    category: "Premium",
    rating: 4.7,
    stock: 10
  },
  {
    _id: "104",
    name: "Avengers Key Chain",
    description: "Your favorite superhero metallic shield keychain.",
    price: 210,
    image: "/images/captain.webp",
    category: "Avengers",
    rating: 4.9,
    stock: 20
  },
  {
    _id: "105",
    name: "Metallic Spinner Key Chain",
    description: "Heavy duty zinc alloy rotating spinner keyring.",
    price: 249,
    image: "/images/shopping.webp",
    category: "Metal",
    rating: 4.6,
    stock: 12
  },
  {
    _id: "106",
    name: "Custom Photo Key Chain",
    description: "Double-sided acrylic personalized picture key charm.",
    price: 179,
    image: "/images/name.webp",
    category: "Customized",
    rating: 4.8,
    stock: 18
  }
];

function Products({ addToCart }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPrice, setSelectedPrice] = useState("All");
  const [sortBy, setSortBy] = useState("featured");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/products`);
        if (!res.ok) throw new Error("Could not load from API");
        const data = await res.json();
        if (data.products && data.products.length > 0) {
          setProducts(data.products);
        } else {
          setProducts(FALLBACK_PRODUCTS);
        }
      } catch (err) {
        console.warn("Falling back to default product list:", err.message);
        setProducts(FALLBACK_PRODUCTS);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Compute unique categories dynamically from products
  const categories = useMemo(() => {
    const set = new Set(["All"]);
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  const clearFilters = () => {
    setSelectedCategory("All");
    setSelectedPrice("All");
    setSearchText("");
    setSortBy("featured");
    toast.success("Filters cleared");
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        // Search query filter
        const query = searchText.toLowerCase().trim();
        const matchesSearch =
          !query ||
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          (product.category && product.category.toLowerCase().includes(query));

        // Category filter
        const matchesCategory =
          selectedCategory === "All" || product.category === selectedCategory;

        // Price range filter
        let matchesPrice = true;
        const price = Number(product.price);
        if (selectedPrice === "Below 150") {
          matchesPrice = price < 150;
        } else if (selectedPrice === "150 to 250") {
          matchesPrice = price >= 150 && price <= 250;
        } else if (selectedPrice === "Above 250") {
          matchesPrice = price > 250;
        }

        return matchesSearch && matchesCategory && matchesPrice;
      })
      .sort((a, b) => {
        if (sortBy === "price-low") return a.price - b.price;
        if (sortBy === "price-high") return b.price - a.price;
        if (sortBy === "name") return a.name.localeCompare(b.name);
        if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
        return 0; // featured / default
      });
  }, [products, searchText, selectedCategory, selectedPrice, sortBy]);

  return (
    <section className="productsPage">
      <div className="filterSection">
        <div className="filterControlsGrid">
          <div className="searchBox">
            <input
              type="text"
              placeholder="Search keychains by name or keyword..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="productSearch"
            />
            {searchText && (
              <button
                type="button"
                className="clearSearchBtn"
                onClick={() => setSearchText("")}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <div className="filterGroup">
            <label htmlFor="categoryFilter">Category</label>
            <select
              id="categoryFilter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "All" ? "All Categories" : cat}
                </option>
              ))}
            </select>
          </div>

          <div className="filterGroup">
            <label htmlFor="priceFilter">Price Range</label>
            <select
              id="priceFilter"
              value={selectedPrice}
              onChange={(e) => setSelectedPrice(e.target.value)}
            >
              <option value="All">All Prices</option>
              <option value="Below 150">Under ₹150</option>
              <option value="150 to 250">₹150 – ₹250</option>
              <option value="Above 250">Above ₹250</option>
            </select>
          </div>

          <div className="filterGroup">
            <label htmlFor="sortBy">Sort By</label>
            <select
              id="sortBy"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>

          <button type="button" className="clearFilterBtn" onClick={clearFilters}>
            Reset Filters
          </button>
        </div>

        {/* Quick Category Badges / Pills */}
        <div className="categoryPills">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`pill ${selectedCategory === cat ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="productResultsBar">
        <p>
          Showing <strong>{filteredProducts.length}</strong> of {products.length} products
        </p>
        {(selectedCategory !== "All" || selectedPrice !== "All" || searchText) && (
          <div className="activeFilterTags">
            {selectedCategory !== "All" && (
              <span className="tag">
                Category: {selectedCategory}
                <button type="button" onClick={() => setSelectedCategory("All")}>✕</button>
              </span>
            )}
            {selectedPrice !== "All" && (
              <span className="tag">
                Price: {selectedPrice}
                <button type="button" onClick={() => setSelectedPrice("All")}>✕</button>
              </span>
            )}
            {searchText && (
              <span className="tag">
                "{searchText}"
                <button type="button" onClick={() => setSearchText("")}>✕</button>
              </span>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <div className="productsLoading">
          <div className="spinner"></div>
          <p>Loading awesome keychains...</p>
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="productGrid">
          {filteredProducts.map((product) => (
            <div key={product._id || product.id} className="productCard">
              <div className="productImageContainer">
                <img
                  src={product.image}
                  alt={product.name}
                  className="productImg"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/images/shopping.webp";
                  }}
                />
                {product.category && (
                  <span className="categoryBadge">{product.category}</span>
                )}
                {product.stock <= 5 && product.stock > 0 && (
                  <span className="stockBadge warning">Only {product.stock} left</span>
                )}
              </div>

              <div className="productCardBody">
                <div className="productRatingRow">
                  <span className="starRating">★ {product.rating || 4.8}</span>
                  <span className="reviewsCount">(42 reviews)</span>
                </div>
                <h3 className="productTitle">{product.name}</h3>
                <p className="productDesc">{product.description}</p>

                <div className="productCardFooter">
                  <div className="priceContainer">
                    <span className="currency">₹</span>
                    <span className="priceValue">{product.price}</span>
                  </div>

                  <button
                    type="button"
                    className="addToCartBtn"
                    onClick={() => addToCart(product)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="9" cy="21" r="1"/>
                      <circle cx="20" cy="21" r="1"/>
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                    </svg>
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="noProductsFound">
          <h3>No products found</h3>
          <p>No key chains match your current search and filter criteria.</p>
          <button type="button" className="resetBtn" onClick={clearFilters}>
            Clear All Filters
          </button>
        </div>
      )}
    </section>
  );
}

export default Products;