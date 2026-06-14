import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const usernameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Trigger entrance animation
    const t = setTimeout(() => setMounted(true), 50);
    usernameRef.current?.focus();
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = async () => {
    if (!username || !password) {
      setError("Please enter your credentials.");
      return;
    }
    setIsLoading(true);
    setError("");
    // Slight delay for premium feel
    await new Promise((r) => setTimeout(r, 600));
    const ok = login(username, password);
    if (!ok) {
      setError("Invalid username or password.");
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="login-root">
      {/* Animated background orbs */}
      <div className="login-orb login-orb-1" />
      <div className="login-orb login-orb-2" />
      <div className="login-orb login-orb-3" />

      {/* Grid overlay texture */}
      <div className="login-grid" />

      {/* Main content */}
      <div
        className="login-content"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(28px)",
          transition: "opacity 0.7s cubic-bezier(0.22,1,0.36,1), transform 0.7s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        {/* Badge */}
        <div className="login-badge">
          <span className="login-badge-dot" />
          <span>TICKET RESOLUTION SYSTEM</span>
        </div>

        {/* Headline */}
        <h1 className="login-headline">
          <span className="login-headline-line1">Welcome to</span>
          <span className="login-headline-accent">Ticket Resolution</span>
          <span className="login-headline-line3">Assistant</span>
        </h1>

        <p className="login-sub">
          AI-powered incident management for enterprise operations.
        </p>

        {/* Card */}
        <div className="login-card">
          <div className="login-card-inner">
            {/* Card heading */}
            <div className="login-card-header">
              <div className="login-card-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="7" r="3.5" stroke="#C9A84C" strokeWidth="1.5" />
                  <path d="M3 17c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <span className="login-card-title">Sign in to continue</span>
            </div>

            {/* Fields */}
            <div className="login-fields">
              <div className="login-field-group">
                <label className="login-label" htmlFor="username">Username</label>
                <input
                  ref={usernameRef}
                  id="username"
                  className="login-input"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setError(""); }}
                  onKeyDown={handleKeyDown}
                  autoComplete="username"
                />
              </div>

              <div className="login-field-group">
                <label className="login-label" htmlFor="password">Password</label>
                <input
                  id="password"
                  className="login-input"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  onKeyDown={handleKeyDown}
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <div className="login-error" role="alert">
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
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p className="login-footer">Secured enterprise access · TCS Internal</p>
      </div>
    </div>
  );
}