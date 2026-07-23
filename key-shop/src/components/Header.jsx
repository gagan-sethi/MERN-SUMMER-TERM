import { Link, useNavigate, useLocation } from "react-router-dom";

function Header({ cartCount, session, onOpenAuthModal, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isVendor = session?.role === "vendor";

  const isActive = (path) => location.pathname === path;

  return (
    <header className="mainHeader">
      <div className="headerContainer">
        <Link to="/" className="brandLogo">
          <div className="brandIcon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 2l-2 2m-2-2l2 2M3 11a7 7 0 1 0 14 0 7 7 0 1 0-14 0z"/>
              <path d="M15.5 15.5L20 20"/>
              <path d="M7 11a2 2 0 1 1 4 0 2 2 0 0 1-4 0z"/>
            </svg>
          </div>
          <span className="brandName">Key Shop</span>
        </Link>

        <nav className="headerNav">
          <ul>
            <li>
              <Link to="/" className={isActive("/") ? "activeNav" : ""}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/products" className={isActive("/products") ? "activeNav" : ""}>
                Products
              </Link>
            </li>
            <li>
              <Link to="/about" className={isActive("/about") ? "activeNav" : ""}>
                About Us
              </Link>
            </li>
            <li>
              <Link to="/contact-us" className={isActive("/contact-us") ? "activeNav" : ""}>
                Contact
              </Link>
            </li>
          </ul>
        </nav>

        <div className="headerActions">
          <Link to="/cart" className="cartBadgeLink" aria-label="Shopping Cart">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            <span className="cartLabel">Cart</span>
            {cartCount > 0 && <span className="cartBadge">{cartCount}</span>}
          </Link>

          {session ? (
            <div className="userNavMenu">
              <button
                type="button"
                className="userProfileBtn"
                onClick={() => navigate(isVendor ? "/vendor-dashboard" : "/dashboard")}
                title={isVendor ? "View Vendor Panel" : "View Dashboard & Orders"}
              >
                <span className={`userAvatar ${isVendor ? "vendorAvatar" : ""}`}>
                  {session.name ? session.name[0].toUpperCase() : session.username[0].toUpperCase()}
                </span>
                <span className="userNameText">
                  {session.name || session.username}
                </span>
              </button>

              <button
                type="button"
                className="navDashboardBtn"
                onClick={() => navigate(isVendor ? "/vendor-dashboard" : "/dashboard")}
              >
                {isVendor ? "Vendor Panel" : "Orders"}
              </button>

              <button type="button" className="navLogoutBtn" onClick={onLogout} title="Sign Out">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="loginTriggerBtn"
              onClick={() => onOpenAuthModal("login")}
            >
              Sign In / Register
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;