import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/Dashboard.jsx";

function Home() {
  return (
    <main className="dash">
      <div className="welcome">
        <div className="welcome-main">
          <p className="kicker">Authentication System · React + Express + PostgreSQL</p>
          <h1>
            Login &amp; Sign-Up <span className="grad">Authentication System</span>
          </h1>
          <p>
            Create an account, log in securely, access a protected dashboard and log out.
            Passwords are hashed with bcrypt, sessions are JWTs in HttpOnly cookies.
          </p>
          <div className="welcome-actions">
            <a className="btn btn-primary" href="/signup">
              Create account →
            </a>
            <a className="btn btn-ghost" href="/login">
              Log in
            </a>
            <a className="btn btn-ghost" href="/dashboard">
              Open dashboard
            </a>
          </div>
        </div>
      </div>

      <div className="two-col">
        <div className="panel">
          <h3>Sign-up flow</h3>
          <ol className="steps">
            <li>User enters name, email, password</li>
            <li>POST /api/auth/signup</li>
            <li>Validate + check existing email</li>
            <li>Hash with bcrypt (12 rounds)</li>
            <li>Save user in PostgreSQL</li>
            <li>JWT → HttpOnly cookie → 201</li>
          </ol>
        </div>
        <div className="panel">
          <h3>Login flow</h3>
          <ol className="steps">
            <li>User enters email + password</li>
            <li>POST /api/auth/login</li>
            <li>Find user in PostgreSQL</li>
            <li>bcrypt.compare(password, hash)</li>
            <li>Verify credentials</li>
            <li>JWT → cookie → open dashboard</li>
          </ol>
        </div>
      </div>

      <div className="panel">
        <h3>Endpoints</h3>
        <div className="endpoints">
          <div>
            <span className="method m-green">POST</span> <code>/api/auth/signup</code>
            <span className="muted-sm"> — Register a user</span>
          </div>
          <div>
            <span className="method m-indigo">POST</span> <code>/api/auth/login</code>
            <span className="muted-sm"> — Log in</span>
          </div>
          <div>
            <span className="method m-amber">POST</span> <code>/api/auth/logout</code>
            <span className="muted-sm"> — Log out (clears cookie)</span>
          </div>
          <div>
            <span className="method m-cyan">GET</span> <code>/api/auth/me</code>
            <span className="muted-sm"> — Get authenticated user</span>
          </div>
        </div>
      </div>
    </main>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      <footer className="footer">
        AuthVault · React + Express + PostgreSQL · bcrypt · JWT in HttpOnly cookies
      </footer>
    </BrowserRouter>
  );
}

export default App;
