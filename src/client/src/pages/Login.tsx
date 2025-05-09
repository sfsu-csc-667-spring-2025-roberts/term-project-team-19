import { useAuth } from "../contexts/auth";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError("Failed to login. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">Welcome to UNO</h1>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading} className="login-button">
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="register-link">
          Don't have an account? <Link to="/register">Register here</Link>
        </div>
      </div>

      <style>{`
        .login-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #121212;
        }

        .login-box {
          background-color: #1e1e1e;
          padding: 2rem;
          border-radius: 8px;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .login-title {
          color: #ff4400;
          text-align: center;
          margin-bottom: 1.5rem;
          font-size: 1.5rem;
          font-weight: bold;
        }

        .error-message {
          background-color: #ff4444;
          color: white;
          padding: 0.75rem;
          border-radius: 4px;
          margin-bottom: 1rem;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          color: #ffffff;
        }

        .form-group input {
          padding: 0.75rem;
          border: 1px solid #333;
          border-radius: 4px;
          background-color: #2a2a2a;
          color: white;
        }

        .login-button {
          background-color: #ff4400;
          color: white;
          padding: 0.75rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1rem;
          margin-top: 1rem;
        }

        .login-button:disabled {
          background-color: #666;
          cursor: not-allowed;
        }

        .register-link {
          text-align: center;
          margin-top: 1.5rem;
          color: #888;
        }

        .register-link a {
          color: #ff4400;
          text-decoration: none;
          font-weight: bold;
        }

        .register-link a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
