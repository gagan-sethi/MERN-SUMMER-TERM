import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const FALLBACK_POPULAR = [
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
  }
];

const CATEGORIES_SHOWCASE = [
  {
    name: "Customized",
    tagline: "Personalized Engravings & Names",
    image: "/images/name.webp",
    count: "15+ Designs"
  },
  {
    name: "Cartoon",
    tagline: "Cute Characters & Anime Styles",
    image: "/images/shopping.webp",
    count: "20+ Designs"
  },
  {
    name: "Premium",
    tagline: "Genuine Handcrafted Leather",
    image: "/images/leather.jpg",
    count: "10+ Designs"
  },
  {
    name: "Avengers",
    tagline: "Metallic Superhero Shields",
    image: "/images/captain.webp",
    count: "8+ Designs"
  }
];

function Home({ addToCart }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/products`);
        if (!response.ok) {
          throw new Error("Unable to fetch products");
        }
        const data = await response.json();
        if (data.products && data.products.length > 0) {
          setProducts(data.products.slice(0, 4));
        } else {
          setProducts(FALLBACK_POPULAR);
        }
      } catch (err) {
        console.error("Product API error", err);
        setProducts(FALLBACK_POPULAR);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="homePage">
      {/* Hero Section */}
      <section className="hero">
        <div className="heroContainer">
          <div className="heroContent">
            <span className="heroBadge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              Handcrafted & Custom Key Chains
            </span>
            <h1 className="heroTitle">
              Carry Style & Memories <span className="heroGradientText">Everywhere You Go</span>
            </h1>
            <p className="heroDescription">
              Explore custom engraved acrylics, genuine leather crafts, and trending anime & superhero keychains built to last a lifetime.
            </p>
            <div className="heroActions">
              <button
                type="button"
                className="primaryHeroBtn"
                onClick={() => navigate("/products")}
              >
                <span>Browse Collection</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
              <button
                type="button"
                className="secondaryHeroBtn"
                onClick={() => navigate("/contact-us")}
              >
                Request Custom Order
              </button>
            </div>

            <div className="heroStats">
              <div className="statItem">
                <strong>4.9 ★</strong>
                <span>Customer Rating</span>
              </div>
              <div className="statDivider"></div>
              <div className="statItem">
                <strong>5,000+</strong>
                <span>Orders Delivered</span>
              </div>
              <div className="statDivider"></div>
              <div className="statItem">
                <strong>100%</strong>
                <span>Handcrafted Quality</span>
              </div>
            </div>
          </div>

          <div className="heroVisualWrapper">
            <div className="heroImageCard">
              <img
                src="/images/keychainimage.webp"
                alt="Featured Key Chains"
                className="heroImg"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/images/shopping.webp";
                }}
              />
              <div className="heroFloatingBadge">
                <div className="badgeIcon">🔑</div>
                <div>
                  <strong>Premium Quality</strong>
                  <span>Scratch-resistant finish</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sleek Trust Ribbon (No Cheesy AI Cards) */}
      <section className="trustRibbonSection">
        <div className="trustRibbonContainer">
          <div className="trustItem">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="3" width="15" height="13" rx="2"/>
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
              <circle cx="5.5" cy="18.5" r="2.5"/>
              <circle cx="18.5" cy="18.5" r="2.5"/>
            </svg>
            <div>
              <strong>Fast Pan-India Shipping</strong>
              <span>Free delivery on orders over ₹299</span>
            </div>
          </div>

          <div className="trustItem">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <div>
              <strong>Genuine Craftsmanship</strong>
              <span>Durable acrylics, metals & leather</span>
            </div>
          </div>

          <div className="trustItem">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            <div>
              <strong>Custom Engraving</strong>
              <span>Personalize names, dates & photos</span>
            </div>
          </div>

          <div className="trustItem">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
              <line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
            <div>
              <strong>100% Safe Payments</strong>
              <span>Razorpay UPI, Cards & Netbanking</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Collections Showcase */}
      <section className="collectionsSection">
        <div className="sectionHeader">
          <h2>Shop By Category</h2>
          <p>Explore specialized keychain designs crafted for your unique personality</p>
        </div>

        <div className="categoryGrid">
          {CATEGORIES_SHOWCASE.map((cat) => (
            <div
              key={cat.name}
              className="categoryCard"
              onClick={() => navigate(`/products`)}
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="categoryCardImg"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/images/shopping.webp";
                }}
              />
              <div className="categoryOverlay">
                <span className="categoryCount">{cat.count}</span>
                <h3>{cat.name}</h3>
                <p>{cat.tagline}</p>
                <span className="exploreLink">Explore Category →</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Products Section */}
      <section className="homeProductsSection">
        <div className="sectionHeader">
          <h2>Popular Key Chains</h2>
          <p>Handpicked favorites loved by key-collectors across the country</p>
        </div>

        {loading ? (
          <div className="productsLoading">
            <div className="spinner"></div>
            <p>Loading popular items...</p>
          </div>
        ) : (
          <>
            <div className="productGrid">
              {products.map((product) => (
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

            <div className="viewAllContainer">
              <Link to="/products" className="viewAllBtn">
                <span>View Full Catalog</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
            </div>
          </>
        )}
      </section>

      {/* Authentic Customization Banner (Replaces extra AI cards) */}
      <section className="customBannerSection">
        <div className="customBannerCard">
          <div className="customBannerContent">
            <span className="bannerTag">Special Customizations</span>
            <h2>Want Your Name or Photo on a Key Chain?</h2>
            <p>
              We craft high-precision laser-engraved acrylic and leather keychains personalized with your initials, quotes, or favorite memories.
            </p>
            <button
              type="button"
              className="customBannerBtn"
              onClick={() => navigate("/contact-us")}
            >
              Order Custom Keychain →
            </button>
          </div>
          <div className="customBannerImgWrapper">
            <img src="/images/name.webp" alt="Custom Engraved Keychain" className="customBannerImg" />
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;