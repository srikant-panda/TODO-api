import { useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { getAuthErrorMessage } from "@/services/authService";
import styles from "./AuthPages.module.css";

type LocationState = { registered?: boolean };

export function LoginPage() {
  const { signIn, isAuthenticated } = useAuth();
  const location = useLocation();
  const registered = (location.state as LocationState | null)?.registered;

  if (isAuthenticated) {
    return <Navigate to="/tasks" replace />;
  }
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signIn({ email, password });
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.card}>
      <h1 className={styles.title}>Sign in</h1>
      <p className={styles.subtitle}>Use your TODO-API credentials.</p>
      {registered ? (
        <p className={styles.success}>Account created. You can sign in now.</p>
      ) : null}
      <form className={styles.form} onSubmit={onSubmit}>
        <label className={styles.label}>
          Email
          <input
            className={styles.input}
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className={styles.label}>
          Password
          <input
            className={styles.input}
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error ? <p className={styles.error}>{error}</p> : null}
        <button className={styles.primary} type="submit" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className={styles.footer}>
        No account? <Link to="/register">Create one</Link>
      </p>
    </div>
  );
}
