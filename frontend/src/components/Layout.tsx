import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import styles from "./Layout.module.css";

export function Layout() {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const isHome = location.pathname === "/";
  const isTasks = location.pathname.startsWith("/tasks");

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link to="/" className={styles.brand}>
          TODO
        </Link>
        <nav className={styles.nav}>
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
            }
          >
            Home
          </NavLink>
          {isAuthenticated ? (
            <>
              <NavLink
                to="/tasks"
                className={({ isActive }) =>
                  isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
                }
              >
                Tasks
              </NavLink>
              <div className={styles.profile}>
                <span className={styles.username}>{user?.name}</span>
                <button type="button" className={styles.linkButton} onClick={logout}>
                  Sign out
                </button>
              </div>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
                }
              >
                Sign in
              </NavLink>
              <Link to="/register" className={styles.navCta}>
                Register
              </Link>
            </>
          )}
        </nav>
      </header>
      <main
        className={
          isHome ? styles.mainHome : isTasks ? styles.mainTasks : styles.main
        }
      >
        <Outlet />
      </main>
    </div>
  );
}
