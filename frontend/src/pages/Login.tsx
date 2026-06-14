import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { Shield } from "lucide-react";

/* ── tiny hook: tracks mouse position as CSS vars on an element ── */
function useMouseSpotlight(ref: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const move = (e: MouseEvent) => {
      el.style.setProperty("--mx", `${e.clientX}px`);
      el.style.setProperty("--my", `${e.clientY}px`);
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [ref]);
}

/* ── floating node config (background particles) ── */
const NODES = [
  { x: 12, y: 18, delay: 0,    dur: 9  },
  { x: 78, y: 12, delay: 1.2,  dur: 11 },
  { x: 88, y: 72, delay: 0.4,  dur: 8  },
  { x: 6,  y: 75, delay: 2.1,  dur: 13 },
  { x: 50, y: 88, delay: 0.8,  dur: 10 },
  { x: 92, y: 38, delay: 1.7,  dur: 12 },
  { x: 22, y: 50, delay: 3.0,  dur: 9  },
  { x: 68, y: 92, delay: 0.3,  dur: 14 },
];

export function Login() {
  const { login } = useAuth();
  const [username, setUsername]   = useState("");
  const [password, setPassword]   = useState("");
  const [error, setError]         = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [phase, setPhase]         = useState(0); // 0=hidden 1=in 2=ready
  const [scanDone, setScanDone]   = useState(false);

  const rootRef     = useRef<HTMLDivElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);

  useMouseSpotlight(rootRef);

  useEffect(() => {
    // stagger: start entrance a tick after paint
    const t1 = setTimeout(() => setPhase(1), 80);
    const t2 = setTimeout(() => setPhase(2), 1200);
    const t3 = setTimeout(() => setScanDone(true), 1800);
    const t4 = setTimeout(() => usernameRef.current?.focus(), 900);
    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!username || !password) { setError("Please enter your credentials."); return; }
    setIsLoading(true);
    setError("");
    await new Promise(r => setTimeout(r, 700));
    const ok = login(username, password);
    if (!ok) { setError("Invalid username or password."); setIsLoading(false); }
  }, [username, password, login]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  // stagger helper
  const s = (i: number) => ({
    opacity:   phase >= 1 ? 1 : 0,
    transform: phase >= 1 ? "translateY(0) scale(1)" : "translateY(22px) scale(0.97)",
    transition: `opacity 0.65s cubic-bezier(0.22,1,0.36,1) ${i * 0.1}s,
                 transform 0.65s cubic-bezier(0.22,1,0.36,1) ${i * 0.1}s`,
  });

  return (
    <div className="login-root" ref={rootRef}>

      {/* Mouse-tracking spotlight */}
      <div className="login-spotlight" />

      {/* Ambient orbs */}
      <div className="login-orb login-orb-1" />
      <div className="login-orb login-orb-2" />
      <div className="login-orb login-orb-3" />

      {/* Dot-grid */}
      <div className="login-grid" />

      {/* Floating circuit nodes */}
      {NODES.map((n, i) => (
        <div
          key={i}
          className="login-node"
          style={{
            left: `${n.x}%`,
            top:  `${n.y}%`,
            animationDelay:    `${n.delay}s`,
            animationDuration: `${n.dur}s`,
          }}
        />
      ))}

      {/* Floating connector lines (SVG, decorative) */}
      <svg className="login-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
        <line x1="12" y1="18" x2="22" y2="50" className="login-line" style={{ animationDelay: "0.3s" }} />
        <line x1="22" y1="50" x2="50" y2="88" className="login-line" style={{ animationDelay: "0.7s" }} />
        <line x1="78" y1="12" x2="92" y2="38" className="login-line" style={{ animationDelay: "0.5s" }} />
        <line x1="92" y1="38" x2="88" y2="72" className="login-line" style={{ animationDelay: "1.0s" }} />
        <line x1="6"  y1="75" x2="22" y2="50" className="login-line" style={{ animationDelay: "1.4s" }} />
      </svg>

      {/* ── Main content ── */}
      <div className="login-content">

        {/* Wordmark */}
        <div className="login-wordmark" style={s(0)}>
          <div className="login-wordmark-icon">
            <Shield size={16} strokeWidth={1.5} />
          </div>
          <div className="login-wordmark-text">
            <span className="login-wordmark-primary">AI RESOLUTION</span>
            <span className="login-wordmark-secondary">Ticket Management</span>
          </div>
        </div>

        {/* Animated divider */}
        <div className="login-divider" style={s(1)}>
          <div className={`login-divider-beam${phase >= 1 ? " login-divider-beam--run" : ""}`} />
        </div>

        {/* Heading */}
        <div className="login-heading-block" style={s(2)}>
          <h1 className="login-heading">
            Sign in to{" "}
            <span className="login-heading-accent">continue</span>
          </h1>
          <p className="login-sub">
            AI-Powered Ticket Resolution
          </p>
        </div>

        {/* Card */}
        <div className="login-card" style={s(3)}>
          {/* Scan-line sweep on mount */}
          {!scanDone && <div className="login-scan" />}

          <div className="login-card-inner">
            {/* Status badge */}
            <div className="login-status-badge">
              <span className="login-status-dot" />
              <span>TICKET RESOLUTION SYSTEM</span>
            </div>

            {/* Fields */}
            <div className="login-fields">
              <div className="login-field-group">
                <label className="login-label" htmlFor="username">Username</label>
                <div className="login-input-wrap">
                  <input
                    ref={usernameRef}
                    id="username"
                    className="login-input"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={e => { setUsername(e.target.value); setError(""); }}
                    onKeyDown={handleKeyDown}
                    autoComplete="username"
                  />
                  <span className="login-input-line" />
                </div>
              </div>

              <div className="login-field-group">
                <label className="login-label" htmlFor="password">Password</label>
                <div className="login-input-wrap">
                  <input
                    id="password"
                    className="login-input"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(""); }}
                    onKeyDown={handleKeyDown}
                    autoComplete="current-password"
                  />
                  <span className="login-input-line" />
                </div>
              </div>

              {error && (
                <div className="login-error login-error--shake" role="alert">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                    <circle cx="7" cy="7" r="6" stroke="#F87171" strokeWidth="1.2" />
                    <path d="M7 4v4M7 9.5v.5" stroke="#F87171" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                  {error}
                </div>
              )}

              <button
                className={`login-btn${isLoading ? " login-btn-loading" : ""}`}
                onClick={handleSubmit}
                disabled={isLoading}
                type="button"
              >
                {isLoading ? (
                  <span className="login-spinner" aria-label="Signing in…" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <svg className="login-btn-arrow" width="15" height="15" viewBox="0 0 15 15" fill="none">
                      <path d="M3 7.5h9M8.5 4l3.5 3.5L8.5 11"
                        stroke="currentColor" strokeWidth="1.5"
                        strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="login-footer" style={s(4)}>
          SECURED ENTERPRISE ACCESS
        </p>
      </div>
    </div>
  );
}