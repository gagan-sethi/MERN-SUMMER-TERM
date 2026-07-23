import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="mainFooter">
      <div className="footerContainer">
        <div className="footerBrandCol">
          <div className="footerLogo">
            <span className="brandName">Key Shop</span>
          </div>
          <p className="footerDescription">
            India's premier destination for custom engraved, leather, cartoon, and pop-culture keychains. Crafted with love and built for everyday adventure.
          </p>
          <div className="footerTrustBadges">
            <span className="badgeChip">🔒 100% Secure Checkout</span>
            <span className="badgeChip">🚚 Tracked Delivery</span>
          </div>
        </div>

        <div className="footerLinksCol">
          <h4>Quick Navigation</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/products">All Products</Link></li>
            <li><Link to="/about">About Craftsmanship</Link></li>
            <li><Link to="/contact-us">Custom Orders & Contact</Link></li>
          </ul>
        </div>

        <div className="footerLinksCol">
          <h4>Categories</h4>
          <ul>
            <li><Link to="/products">Custom Name Keychains</Link></li>
            <li><Link to="/products">Cartoon & Anime Styles</Link></li>
            <li><Link to="/products">Handcrafted Leather</Link></li>
            <li><Link to="/products">Superhero Shields</Link></li>
          </ul>
        </div>

        <div className="footerContactCol">
          <h4>Customer Care</h4>
          <p>Have questions about your order or custom design?</p>
          <ul className="contactInfoList">
            <li>
              <span>📧</span> gagandeepsethi.lpu@gmail.com
            </li>
            <li>
              <span>📞</span> +91 98765 43210
            </li>
            <li>
              <span>📍</span> Punjab, India
            </li>
          </ul>
        </div>
      </div>

      <div className="footerBottomBar">
        <div className="footerBottomContainer">
          <p>&copy; {new Date().getFullYear()} Key Shop Inc. All rights reserved.</p>
          <div className="footerPaymentLogos">
            <span>UPI</span>
            <span>Razorpay</span>
            <span>Cards</span>
            <span>NetBanking</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;