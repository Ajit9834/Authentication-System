import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { signupUser } from "../services/authService.js";
import { useAuth } from "../context/AuthContext.jsx";

function Login() {
  const { login, loading, refresh } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next") || "/dashboard";

  const [form, setForm] = useState({ email: "", password: "" });
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [demoLoading, setDemoLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(form.email.trim(), form.password);
      navigate(next, { replace: true });
    } catch (err) {
      setError(err.message || "Unable to log in.");
    }
  };

  const handleDemo = async () => {
    setDemoLoading(true);
    setError("");
    try {
      const email = `demo-${Date.now().toString(36)}@example.com`;
      await signupUser({ name: "Demo User", email, password: "DemoPass123!" });
      await refresh();
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Could not create demo account.");
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <main className="page-grid">
      <div className="brand-panel">
        <span className="pill">Step 11 · Login page</span>
        <h2>
          Welcome back.
          <br />
          Log in securely.
        </h2>
        <p>
          Login finds the user in PostgreSQL, compares with bcrypt and sets an HttpOnly
          JWT cookie the browser JS can never read.
        </p>
        <div className="flow-list">
          <div className="flow-item">
            <span className="flow-n">1</span>
            <div>
              <p className="mono">POST /api/auth/login</p>
              <p className="muted-sm">Find user → bcrypt.compare</p>
            </div>
          </div>
          <div className="flow-item">
            <span className="flow-n">2</span>
            <div>
              <p className="mono">Set-Cookie: token=JWT</p>
              <p className="muted-sm">HttpOnly · SameSite=Lax · 1 day</p>
            </div>
          </div>
          <div className="flow-item">
            <span className="flow-n">3</span>
            <div>
              <p className="mono">Open /dashboard</p>
              <p className="muted-sm">ProtectedRoute + server verify</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h1>Welcome Back</h1>
        <p className="muted">Log in to your account.</p>
        <form onSubmit={handleSubmit} className="form">
          {params.get("next") && (
            <p className="warn-box">
              Please log in to access <span className="mono">{params.get("next")}</span>
            </p>
          )}
          {error && <p className="error-box">{error}</p>}

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
            <span>Password</span>
            <input
              name="password"
              type={show ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </label>

          <div className="row-end">
            <button type="button" className="chip" onClick={() => setShow((v) => !v)}>
              {show ? "Hide password" : "Show password"}
            </button>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "Logging In…" : "Log In"}
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-block"
            onClick={handleDemo}
            disabled={demoLoading || loading}
          >
            {demoLoading ? "Creating demo session…" : "✨ Try one-click demo account"}
          </button>
          <p className="mono-center">POST /api/auth/login · bcrypt.compare · JWT → cookie</p>
        </form>
        <div className="card-foot">
          <p>
            Don&apos;t have an account? <Link to="/signup">Sign Up</Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default Login;
