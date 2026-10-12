import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function Navbar() {
  const { user, logout, initializing } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const linkCls = (href) =>
    `nav-link${location.pathname === href ? " nav-link-active" : ""}`;

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand">
          <span className="brand-badge">🛡️</span>
          <span className="brand-text">
            <span className="brand-title">AuthVault</span>
            <span className="brand-sub">MERN-STYLE AUTH</span>
          </span>
        </Link>

        <nav className="nav-pills">
          <Link to="/" className={linkCls("/")}>
            Overview
          </Link>
          {!user && (
            <>
              <Link to="/login" className={linkCls("/login")}>
                Login
              </Link>
              <Link to="/signup" className={linkCls("/signup")}>
                Sign up
              </Link>
            </>
          )}
          {user && (
            <Link to="/dashboard" className={linkCls("/dashboard")}>
              Dashboard
            </Link>
          )}
        </nav>

        <div className="nav-actions">
          {initializing ? (
            <span className="skeleton" />
          ) : user ? (
            <>
              <span className="user-email">{user.email}</span>
              <button className="btn btn-light" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="link-muted">
                Log in
              </Link>
              <Link to="/signup" className="btn btn-primary">
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
