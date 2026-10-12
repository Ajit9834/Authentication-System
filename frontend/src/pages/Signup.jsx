import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function passwordScore(pw) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(s, 5);
}

const LABELS = ["Too short", "Weak", "Fair", "Good", "Strong", "Excellent"];

function Signup() {
  const { signup, loading } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next") || "/dashboard";

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");

  const score = passwordScore(form.password);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signup(form.name.trim(), form.email.trim(), form.password);
      navigate(next, { replace: true });
    } catch (err) {
      setError(err.message || "Unable to create your account.");
    }
  };

  return (
    <main className="page-grid">
      <div className="brand-panel">
        <span className="pill">Step 10 · Sign-up page</span>
        <h2>
          Secure auth,
          <br />
          beautifully simple.
        </h2>
        <p>
          Signup validates input, hashes with bcrypt, stores in PostgreSQL and sets an
          HttpOnly JWT cookie.
        </p>
        <div className="flow-list">
          <div className="flow-item">
            <span className="flow-n">1</span>
            <div>
              <p className="mono">POST /api/auth/signup</p>
              <p className="muted-sm">Validate → hash → store → cookie</p>
            </div>
          </div>
          <div className="flow-item">
            <span className="flow-n">2</span>
            <div>
              <p className="mono">POST /api/auth/login</p>
              <p className="muted-sm">Find → bcrypt.compare → JWT cookie</p>
            </div>
          </div>
          <div className="flow-item">
            <span className="flow-n">3</span>
            <div>
              <p className="mono">GET /api/auth/me</p>
              <p className="muted-sm">Verify JWT → load user → guard UI</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h1>Create Account</h1>
        <p className="muted">Sign up to get started.</p>
        <form onSubmit={handleSubmit} className="form">
          {error && <p className="error-box">{error}</p>}

          <label className="field">
            <span>Full Name</span>
            <input
              name="name"
              type="text"
              placeholder="Ada Lovelace"
              autoComplete="name"
              value={form.name}
              onChange={handleChange}
              required
              maxLength={100}
            />
          </label>

          <label className="field">
            <span>Email Address</span>
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>

          <label className="field">
            <span>Password (8–72 characters)</span>
            <input
              name="password"
              type={show ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="new-password"
              minLength={8}
              maxLength={72}
              value={form.password}
              onChange={handleChange}
              required
            />
          </label>

          <div className="strength-row">
            <div className="bars">
              {[0, 1, 2, 3, 4].map((i) => (
                <span key={i} className={`bar${i < score ? " bar-on" : ""}`} />
              ))}
            </div>
            <span className="muted-sm">{form.password ? LABELS[score] : "—"}</span>
            <button type="button" className="chip" onClick={() => setShow((v) => !v)}>
              {show ? "Hide" : "Show"}
            </button>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "Creating Account…" : "Sign Up"}
          </button>
          <p className="mono-center">POST /api/auth/signup · withCredentials: true</p>
        </form>
        <div className="card-foot">
          <p>
            Already have an account? <Link to="/login">Log In</Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default Signup;
