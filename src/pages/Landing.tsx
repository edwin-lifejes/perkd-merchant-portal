import React from "react";
import { useNavigate } from "react-router-dom";

const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="landing">
      {/* Nav */}
      <header className="landing-nav">
        <div className="landing-nav-inner">
          <div className="brand">
            <span className="brand-mark">P</span>
            <span className="brand-name">Perkd</span>
          </div>
          <div className="landing-nav-actions">
            <button className="btn btn-ghost" onClick={() => navigate("/login")}>
              Sign in
            </button>
            <button className="btn btn-primary" onClick={() => navigate("/register")}>
              Get started
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="hero-section">
        <div className="hero-inner">
          <span className="eyebrow">For Merchants</span>
          <h1 className="hero-headline">
            Grow your business<br />with exclusive offers
          </h1>
          <p className="hero-sub">
            Reach thousands of lifestyle-focused customers across Canada. Perkd
            connects your business with members who are actively looking for
            experiences, dining, wellness, and more.
          </p>
          <div className="hero-ctas">
            <button className="btn btn-primary btn-lg" onClick={() => navigate("/register")}>
              Join as a Partner
            </button>
            <button className="btn btn-outline btn-lg" onClick={() => navigate("/login")}>
              Sign in
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="section-inner">
          <h2 className="section-title">Why merchants choose Perkd</h2>
          <div className="features-grid">
            <div className="feature-card">
              <span className="feature-icon">🎯</span>
              <h3>Reach new customers</h3>
              <p>
                Get discovered by engaged, spending-ready members who are
                actively exploring offers in your category.
              </p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">💚</span>
              <h3>Zero upfront cost</h3>
              <p>
                No setup fees, no monthly subscriptions. You only invest when
                you run an offer — keeping your risk at zero.
              </p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">✨</span>
              <h3>Simple offer creation</h3>
              <p>
                Choose from 10 proven offer templates and go live in minutes.
                No marketing expertise required.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="how-section">
        <div className="section-inner">
          <h2 className="section-title">How it works</h2>
          <div className="steps-row">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Register your business</h3>
              <p>
                Complete a quick 5-step application. Our team reviews and
                approves you within 24 hours.
              </p>
            </div>
            <div className="step-divider" aria-hidden="true">→</div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Create your offer</h3>
              <p>
                Pick a template, fill in the details, set your dates, and
                publish — it takes under 5 minutes.
              </p>
            </div>
            <div className="step-divider" aria-hidden="true">→</div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Customers discover you</h3>
              <p>
                Perkd members see your offer and visit your business, bringing
                real foot traffic and revenue.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="cta-section">
        <div className="cta-inner">
          <h2>Ready to partner with Perkd?</h2>
          <p>
            Join hundreds of Canadian businesses already growing with us.
          </p>
          <button className="btn btn-primary btn-lg" onClick={() => navigate("/register")}>
            Get Started — it's free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="brand">
            <span className="brand-mark">P</span>
            <span className="brand-name">Perkd</span>
          </div>
          <p className="footer-copy">© 2025 Perkd. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
