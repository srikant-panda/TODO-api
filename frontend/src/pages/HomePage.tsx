import gsap from "gsap";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { resolveApiUrl } from "@/services/authConfig";
import styles from "./HomePage.module.css";

export function HomePage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuth();
  const [health, setHealth] = useState<"checking" | "ok" | "error">("checking");

  useEffect(() => {
    const url = resolveApiUrl("/api/health");
    fetch(url)
      .then((r) => (r.ok ? setHealth("ok") : setHealth("error")))
      .catch(() => setHealth("error"));
  }, []);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from("[data-hero-line]", {
        yPercent: 40,
        opacity: 0,
        duration: 0.9,
        stagger: 0.07,
      })
        .from(
          "[data-hero-sub]",
          { y: 28, opacity: 0, duration: 0.65 },
          "-=0.45",
        )
        .from(
          "[data-hero-badge]",
          { scale: 0.92, opacity: 0, duration: 0.45 },
          "-=0.35",
        )
        .from(
          "[data-hero-cta] > *",
          { y: 22, opacity: 0, duration: 0.5, stagger: 0.09 },
          "-=0.25",
        )
        .from(
          "[data-stat]",
          { y: 20, opacity: 0, duration: 0.5, stagger: 0.1 },
          "-=0.35",
        )
        .from(
          "[data-panel]",
          { y: 36, opacity: 0, duration: 0.55, stagger: 0.12 },
          "-=0.2",
        );

      gsap.to("[data-orb]", {
        y: "random(-18, 18)",
        x: "random(-12, 12)",
        duration: "random(3.5, 5.5)",
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: { each: 0.6, from: "random" },
      });

      gsap.to("[data-glow]", {
        opacity: 0.55,
        duration: 2.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className={styles.page}>
      <div className={styles.pageBackdrop} aria-hidden>
        <div className={styles.bgMesh} />
        <div className={styles.orbA} data-orb />
        <div className={styles.orbB} data-orb />
        <div className={styles.orbC} data-orb />
        <div className={styles.glow} data-glow />
      </div>

      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.badge} data-hero-badge>
            <span
              className={
                health === "ok"
                  ? styles.dotOk
                  : health === "error"
                    ? styles.dotErr
                    : styles.dotIdle
              }
            />
            {health === "checking"
              ? "Connecting to TODO-API…"
              : health === "ok"
                ? "TODO-API online"
                : "API unreachable — start the backend"}
          </div>

          <h1 className={styles.title}>
            <span className={styles.titleLine} data-hero-line>
              Focus.
            </span>
            <span className={styles.titleLine} data-hero-line>
              Ship.
            </span>
            <span className={`${styles.titleLine} ${styles.titleAccent}`} data-hero-line>
              Repeat.
            </span>
          </h1>

          <p className={styles.sub} data-hero-sub>
            A calm, fast workspace for your tasks — JWT auth today, refresh-ready
            tomorrow. Built for the API you already run.
          </p>

          <div className={styles.cta} data-hero-cta>
            {isAuthenticated ? (
              <Link className={styles.primary} to="/tasks">
                Open your tasks
              </Link>
            ) : (
              <>
                <Link className={styles.primary} to="/register">
                  Get started
                </Link>
                <Link className={styles.secondary} to="/login">
                  Sign in
                </Link>
              </>
            )}
          </div>

          <div className={styles.stats}>
            <div className={styles.stat} data-stat>
              <span className={styles.statLabel}>Client</span>
              <span className={styles.statValue}>Vite · React</span>
            </div>
            <div className={styles.stat} data-stat>
              <span className={styles.statLabel}>API</span>
              <span className={styles.statValue}>FastAPI · JWT</span>
            </div>
            <div className={styles.stat} data-stat>
              <span className={styles.statLabel}>Motion</span>
              <span className={styles.statValue}>GSAP</span>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.panelSection}>
        <div className={styles.panels}>
          <article className={styles.panel} data-panel>
            <h2 className={styles.panelTitle}>Centralized auth</h2>
            <p className={styles.panelText}>
              Tokens stay in one layer. When your backend adds refresh, the client
              retries 401s without touching your pages.
            </p>
          </article>
          <article className={styles.panel} data-panel>
            <h2 className={styles.panelTitle}>Tasks that stay yours</h2>
            <p className={styles.panelText}>
              Create, filter, and update todos against your existing TODO-API routes
              — same Bearer flow as curl or Postman.
            </p>
          </article>
          <article className={styles.panel} data-panel>
            <h2 className={styles.panelTitle}>Dev-friendly wiring</h2>
            <p className={styles.panelText}>
              Vite proxies <code className={styles.code}>/api</code> to port 8000, or
              set <code className={styles.code}>VITE_API_BASE_URL</code> with CORS
              enabled on the server.
            </p>
          </article>
        </div>
      </section>
    </div>
  );
}
