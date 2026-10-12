import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getCurrentUser } from "../services/authService.js";

function Dashboard() {
  const { user, logout, refresh } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [ok, setOk] = useState(null);

  const handleLogout = async () => {
    setBusy(true);
    try {
      await logout();
    } finally {
      navigate("/login", { replace: true });
    }
  };

  const checkSession = async () => {
    setResult("Checking GET /api/auth/me …");
    setOk(null);
    try {
      const data = await getCurrentUser();
      setOk(true);
      setResult(`✅ Authenticated as ${data.user.name} <${data.user.email}>`);
      await refresh();
    } catch (e) {
      setOk(false);
      setResult(`❌ ${e?.response?.data?.message || e.message || "Session check failed"}`);
    }
  };

  if (!user) return null;
  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  return (
    <main className="dash">
      <div className="welcome">
        <span className="avatar">{user.name.charAt(0).toUpperCase()}</span>
        <div className="welcome-main">
          <p className="kicker">Protected dashboard · Step 12</p>
          <h1>Welcome, {user.name}!</h1>
          <p>
            {user.email} · member since {memberSince}
          </p>
        </div>
        <span className="status">● Logged in successfully</span>
        <div className="welcome-actions">
          <button className="btn btn-light" onClick={checkSession}>
            ↻ Re-check session
          </button>
          <button className="btn btn-dark" onClick={handleLogout} disabled={busy}>
            {busy ? "Logging out…" : "Logout"}
          </button>
        </div>
        {result && <p className={`result${ok ? " result-ok" : ok === false ? " result-bad" : ""}`}>{result}</p>}
      </div>

      <div className="stats">
        <div className="stat">
          <div className="stat-icon">🆔</div>
          <p className="stat-label">User ID</p>
          <p className="stat-value" title={user.id}>
            {String(user.id).slice(0, 8)}…
          </p>
          <p className="muted-sm">UUID primary key</p>
        </div>
        <div className="stat">
          <div className="stat-icon">📧</div>
          <p className="stat-label">Email</p>
          <p className="stat-value">{user.email}</p>
          <p className="muted-sm">Unique index, lowercased</p>
        </div>
        <div className="stat">
          <div className="stat-icon">🔑</div>
          <p className="stat-label">Session</p>
          <p className="stat-value">HttpOnly JWT · 1d</p>
          <p className="muted-sm">Secure · SameSite=Lax</p>
        </div>
      </div>

      <div className="two-col">
        <div className="panel">
          <h3>Your profile</h3>
          <p className="muted-sm">Loaded from GET /api/auth/me, not localStorage</p>
          <dl className="kv">
            <div>
              <dt>Full name</dt>
              <dd>{user.name}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{user.email}</dd>
            </div>
            <div>
              <dt>Account ID</dt>
              <dd className="mono-sm">{user.id}</dd>
            </div>
            <div>
              <dt>Created</dt>
              <dd>{user.createdAt ? new Date(user.createdAt).toLocaleString() : "—"}</dd>
            </div>
          </dl>
          <p className="code">
            protect(req) → verify JWT → SELECT user WHERE id = decoded.sub
          </p>
        </div>
        <div className="panel">
          <h3>Live security checklist</h3>
          <p className="muted-sm">What this dashboard proves</p>
          <ul className="check">
            <li>Dashboard required a valid JWT cookie</li>
            <li>Password stored as bcrypt hash, never plain text</li>
            <li>User loaded from PostgreSQL, not localStorage</li>
            <li>Logout clears the HttpOnly cookie</li>
            <li>Refresh re-validates via GET /api/auth/me</li>
          </ul>
          <div className="two-btns">
            <Link to="/" className="btn btn-ghost">
              ← Overview
            </Link>
            <button className="btn btn-primary" onClick={handleLogout}>
              Logout now
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Dashboard;
