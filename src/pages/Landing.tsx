import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const benefits = [
  {
    icon: "🎯",
    title: "Reach ready-to-spend members",
    body: "Perkd members open the app specifically to find places to go. Your offer meets demand at the exact moment of intent.",
  },
  {
    icon: "💸",
    title: "Zero risk, performance-based",
    body: "There is no fee to join and no monthly cost. You only ever share value when a paying customer walks through your door.",
  },
  {
    icon: "📲",
    title: "Effortless redemption",
    body: "Members redeem in-app in seconds, with no paper coupons or codes to manage. Track every visit from your partner dashboard.",
  },
  {
    icon: "📣",
    title: "Marketing on the house",
    body: "Featured placements, social shout-outs and seasonal campaigns put your brand in front of a growing, engaged audience.",
  },
  {
    icon: "🔁",
    title: "Turn visits into regulars",
    body: "Discovery is just the start. Great first impressions plus repeat-friendly offers build a loyal customer base.",
  },
  {
    icon: "🧭",
    title: "You stay in control",
    body: "Set your own offer, availability, blackout dates and redemption caps. Adjust anytime from your dashboard.",
  },
];

const howSteps = [
  {
    number: "01",
    title: "Apply in minutes",
    body: "Tell us about your business and your first offer. Save your place and finish anytime.",
  },
  {
    number: "02",
    title: "We verify and set you up",
    body: "Our partnerships team confirms your details, polishes your listing and agrees a go-live date with you.",
  },
  {
    number: "03",
    title: "Go live and grow",
    body: "Your deal appears to members across your city. Watch new customers arrive and track every redemption.",
  },
];

const Landing: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const reveal = () => {
      const viewportHeight = window.innerHeight || 800;
      document.querySelectorAll<HTMLElement>(".reveal:not(.in)").forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < viewportHeight * 0.92 && rect.bottom > 0) {
          el.classList.add("in");
        }
      });
    };

    reveal();
    window.addEventListener("scroll", reveal, { passive: true });
    window.addEventListener("resize", reveal);
    const fallback = window.setTimeout(() => {
      document.querySelectorAll<HTMLElement>(".reveal").forEach((el) => el.classList.add("in"));
    }, 2400);

    return () => {
      window.removeEventListener("scroll", reveal);
      window.removeEventListener("resize", reveal);
      window.clearTimeout(fallback);
    };
  }, []);

  return (
    <div className="landing">
      <div className="mesh" aria-hidden="true">
        <div className="blob b1" />
        <div className="blob b2" />
      </div>
      <div className="grain" aria-hidden="true" />

      <nav className="nav">
        <div className="wrap nav-in">
          <a className="logo" href="#top" aria-label="Perkd for Merchants">
            <span className="mark">P</span>
            Perkd
            <span className="tag">for Merchants</span>
          </a>
          <div className="nav-links">
            <a href="#why">Why partner</a>
            <a href="#how">How it works</a>
            <a href="#apply">Apply</a>
          </div>
          <div className="nav-actions">
            <button className="btn btn-ghost nav-signin" onClick={() => navigate("/login")}>
              Sign in
            </button>
            <button className="btn btn-primary" onClick={() => navigate("/register")}>
              Become a partner
            </button>
          </div>
        </div>
      </nav>

      <header className="hero" id="top">
        <div className="wrap hero-grid">
          <div className="reveal in">
            <span className="pill hero-pill">
              <span className="gdot" />
              Now onboarding Canadian partners
            </span>
            <h1>
              Fill tables.
              <br />
              Fill seats. <span className="serif-it accent">Grow.</span>
            </h1>
            <p className="deck">
              List your business on Perkd and put your offer in front of thousands of members actively looking for
              somewhere new to spend. No upfront cost, you only share when a member redeems.
            </p>
            <div className="hero-cta">
              <button className="btn btn-primary" onClick={() => navigate("/register")}>
                Start your application →
              </button>
              <a href="#why" className="btn btn-ghost">
                Why partner with us
              </a>
            </div>
            <div className="hero-trust">
              <span>★★★★★</span>
              <span>Trusted by 400+ partners in launch markets</span>
            </div>
          </div>

          <div className="hcards reveal in">
            <div className="hcard dark">
              <div className="row">
                <div>
                  <div className="big">+38%</div>
                  <div className="lbl stat-label-top">Average new-customer lift</div>
                  <div className="sub">In a partner's first 90 days</div>
                </div>
                <div className="ic">📈</div>
              </div>
            </div>
            <div className="hcard">
              <div className="row">
                <div>
                  <div className="lbl">$0 to list</div>
                  <div className="sub">Pay only on successful redemptions</div>
                </div>
                <div className="ic">🏷️</div>
              </div>
            </div>
            <div className="hcard">
              <div className="row">
                <div>
                  <div className="lbl">Live in days</div>
                  <div className="sub">Apply today, get featured this week</div>
                </div>
                <div className="ic">⚡</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="sec" id="why">
        <div className="wrap">
          <div className="reveal">
            <span className="eyebrow">
              <span className="gdot" />
              Why partner
            </span>
            <h2 className="sec-title">
              More covers, more bookings, <span className="serif-it accent">more loyal regulars.</span>
            </h2>
            <p className="sec-lead">
              Perkd is the simplest way to bring new customers through your door and keep them coming back.
            </p>
          </div>
          <div className="benefits">
            {benefits.map((benefit, index) => (
              <div className="benefit reveal" key={benefit.title} style={{ transitionDelay: `${(index % 3) * 0.07}s` }}>
                <div className="bic">{benefit.icon}</div>
                <h3>{benefit.title}</h3>
                <p>{benefit.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec" id="how">
        <div className="wrap">
          <div className="howband reveal">
            <span className="eyebrow">
              <span className="gdot" />
              How it works
            </span>
            <h2 className="sec-title">
              From application to live <span className="serif-it">in under a week.</span>
            </h2>
            <div className="hsteps">
              {howSteps.map((step) => (
                <div className="hstep" key={step.number}>
                  <div className="n">{step.number}</div>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="ob-sec" id="apply">
        <div className="wrap">
          <div className="ob-head reveal">
            <span className="eyebrow centered">
              <span className="gdot" />
              Partner application
            </span>
            <h2 className="sec-title">Join Perkd</h2>
            <p className="sec-lead">
              Five short steps. Everything we need to get your business live, with a dedicated partner flow already
              connected to your merchant account.
            </p>
          </div>
          <div className="application-card reveal">
            <div>
              <span className="pill">
                <span className="gdot" />
                Merchant partner onboarding
              </span>
              <h3>Start your application</h3>
              <p>
                Create your merchant account, add your business details, and submit your first offer idea through the
                existing portal registration flow.
              </p>
            </div>
            <button className="btn btn-primary" onClick={() => navigate("/register")}>
              Continue to application →
            </button>
          </div>
        </div>
      </section>

      <footer className="foot">
        <div className="wrap foot-in">
          <span>© 2026 Perkd Canada · <i>partner program</i></span>
          <div className="links">
            <a href="#why">Why partner</a>
            <a href="#how">How it works</a>
            <a href="#apply">Apply</a>
            <Link to="/login">Sign in</Link>
            <a href="#top">Back to top ↑</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
