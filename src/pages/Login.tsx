import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/ui/Spinner";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        "Invalid email or password. Please try again.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      {/* Left brand panel */}
      <div className="auth-brand-panel">
        <div className="auth-brand-content">
          <div className="brand brand-invert">
            <span className="brand-mark">P</span>
            <span className="brand-name">Perkd</span>
          </div>
          <h2 className="auth-brand-tagline">Welcome back, partner.</h2>
          <blockquote className="auth-brand-quote">
            "Perkd has connected us with hundreds of new customers we never
            would have reached on our own. It's the smartest thing we did for
            our business this year."
            <cite>— Merchant Partner, Toronto</cite>
          </blockquote>
        </div>
      </div>

      {/* Right form panel */}
      <div className="auth-form-panel">
        <div className="auth-form-inner">
          <h1 className="auth-form-title">Sign in to your account</h1>
          <p className="auth-form-sub">
            Manage your offers and track your performance.
          </p>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: "1.25rem" }}>
              <span className="alert-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="you@yourbusiness.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={isLoading}
            >
              {isLoading ? <Spinner size="sm" /> : "Sign in"}
            </button>
          </form>

          <p className="auth-form-footer">
            New merchant?{" "}
            <Link to="/register" className="link">
              Apply to join →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
