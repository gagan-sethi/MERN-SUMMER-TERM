import { useNavigate } from "react-router-dom";

function About() {
  const navigate = useNavigate();

  return (
    <div className="aboutPage">
      <section className="aboutHero">
        <div className="aboutHeroContent">
          <span className="aboutBadge">Our Story & Craftsmanship</span>
          <h1>Crafting Keychains with Passion & Precision</h1>
          <p>
            At Key Shop, we believe keychains are more than everyday tools—they are personal expressions, cherished gifts, and daily reminders of what matters most.
          </p>
        </div>
      </section>

      <section className="aboutMainSection">
        <div className="aboutGrid">
          <div className="aboutCard">
            <div className="aboutIcon">🎨</div>
            <h3>Precision Laser Engraving</h3>
            <p>
              Every custom acrylic keychain is crafted with state-of-the-art CO2 lasers for crisp, everlasting names, dates, and portraits.
            </p>
          </div>

          <div className="aboutCard">
            <div className="aboutIcon">🛋️</div>
            <h3>Handcrafted Genuine Leather</h3>
            <p>
              Sourced from skilled Indian artisans, our leather key rings age gracefully with a beautiful natural patina.
            </p>
          </div>

          <div className="aboutCard">
            <div className="aboutIcon">⚡</div>
            <h3>Durable Metallic Alloys</h3>
            <p>
              Heavy-duty zinc alloys and stainless key rings engineered for daily pocket wear, water resistance, and longevity.
            </p>
          </div>
        </div>

        <div className="aboutMissionCard">
          <h2>Our Mission</h2>
          <p>
            We aim to offer India's finest selection of personalized and trendsetting keychains, providing effortless online ordering, transparent tracking, and 100% satisfaction guarantee.
          </p>
          <button
            type="button"
            className="aboutCtaBtn"
            onClick={() => navigate("/products")}
          >
            Explore Our Catalog →
          </button>
        </div>
      </section>
    </div>
  );
}

export default About;