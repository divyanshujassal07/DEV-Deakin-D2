import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./backend/Firebase";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleLogin(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { user } = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );

      const idToken = await user.getIdToken();

      const response = await fetch("http://localhost:3000/api/auth/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Backend verification failed.");
      }

      navigate("/");
    } catch (error) {
      console.error("Login failed:", error);

      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/user-not-found"
      ) {
        setError("Invalid email or password.");
      } else {
        setError(error.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-brand">
          <span>DEV@Deakin</span>
        </div>

        <div className="auth-heading">
          <span className="auth-label">MEMBER LOGIN</span>
          <h2>Welcome Back!</h2>
          <p>Continue your journey with the developer community.</p>
        </div>

        <form onSubmit={handleLogin}>
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />

          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            New to DEV@Deakin?
            <Link to="/signup"> Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
