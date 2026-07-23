import { useState } from "react";
import toast from "react-hot-toast";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "General Inquiry",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success("Thank you! Your message has been sent successfully.");
    setSubmitted(true);
  };

  return (
    <div className="contactPage">
      <div className="contactHeader">
        <h1>Contact Us & Custom Orders</h1>
        <p>Have a question or want to request custom engraved keychains in bulk? Get in touch with our team.</p>
      </div>

      <div className="contactLayout">
        <div className="contactInfoCard">
          <h2>Get In Touch</h2>
          <p>We're here to help you with order inquiries, bulk corporate orders, or custom keychain designs.</p>

          <div className="contactDetailsList">
            <div className="contactDetailItem">
              <div className="detailIcon">📧</div>
              <div>
                <strong>Email Address</strong>
                <span>gagandeepsethi.lpu@gmail.com</span>
              </div>
            </div>

            <div className="contactDetailItem">
              <div className="detailIcon">📞</div>
              <div>
                <strong>Phone Support</strong>
                <span>+91 98765 43210 (Mon - Sat, 9am - 7pm)</span>
              </div>
            </div>

            <div className="contactDetailItem">
              <div className="detailIcon">📍</div>
              <div>
                <strong>Workshop Location</strong>
                <span>Lovely Professional University, Phagwara, Punjab, India</span>
              </div>
            </div>

            <div className="contactDetailItem">
              <div className="detailIcon">🚀</div>
              <div>
                <strong>Bulk & Custom Orders</strong>
                <span>We handle corporate gifts & custom name bulk orders!</span>
              </div>
            </div>
          </div>
        </div>

        <div className="contactFormCard">
          <h2>Send Us a Message</h2>
          {submitted ? (
            <div className="contactSuccessBox">
              <div className="successIcon">✓</div>
              <h3>Message Received!</h3>
              <p>Thank you for reaching out. Our customer support team will reply within 24 hours.</p>
              <button
                type="button"
                className="resetContactBtn"
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: "", email: "", subject: "General Inquiry", message: "" });
                }}
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="contactForm">
              <div className="formGroup">
                <label htmlFor="contactName">Your Name</label>
                <input
                  id="contactName"
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="formGroup">
                <label htmlFor="contactEmail">Email Address</label>
                <input
                  id="contactEmail"
                  type="email"
                  placeholder="rahul@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="formGroup">
                <label htmlFor="contactSubject">Inquiry Subject</label>
                <select
                  id="contactSubject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                >
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Custom Keychain Order">Custom Keychain Order</option>
                  <option value="Order Support & Tracking">Order Support & Tracking</option>
                  <option value="Bulk Corporate Order">Bulk Corporate Order</option>
                </select>
              </div>

              <div className="formGroup">
                <label htmlFor="contactMessage">Your Message</label>
                <textarea
                  id="contactMessage"
                  rows="4"
                  placeholder="Describe your query or custom keychain requirements..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                ></textarea>
              </div>

              <button type="submit" className="contactSubmitBtn">
                Send Message →
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Contact;