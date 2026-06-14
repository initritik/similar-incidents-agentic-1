import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Shield } from "lucide-react";

export function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const usernameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
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
      {/* Subtle ambient orbs — toned down to match nav's dark navy */}
      <div className="login-orb login-orb-1" />
      <div className="login-orb login-orb-2" />
      <div className="login-orb login-orb-3" />

      {/* Grid texture */}
      <div className="login-grid" />

      {/* Main panel */}
      <div
        className="login-content"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(20px)",
          transition:
            "opacity 0.6s cubic-bezier(0.22,1,0.36,1), transform 0.6s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        {/* Top wordmark — mirrors the nav bar branding */}
        <div className="login-wordmark">
          <div className="login-wordmark-icon">
            <Shield size={16} strokeWidth={1.5} />
          </div>
          <div className="login-wordmark-text">
            <span className="login-wordmark-primary">AI RESOLUTION</span>
            <span className="login-wordmark-secondary">Ticket Management </span>
          </div>
        </div>

        {/* Divider */}
        <div className="login-divider" />

        {/* Heading — compact and proportional */}
        <div className="login-heading-block">
          <h1 className="login-heading">Sign in to continue</h1>
          <p className="login-sub">
            AI-powered Ticket Resolution
          </p>
        </div>

        {/* Card */}
        <div className="login-card">
          <div className="login-card-inner">
            {/* Status badge */}
            <div className="login-status-badge">
              <span className="login-status-dot" />
              <span>TICKET RESOLUTION SYSTEM</span>
            </div>

            {/* Fields */}
            <div className="login-fields">
              <div className="login-field-group">
                <label className="login-label" htmlFor="username">
                  Username
                </label>
                <input
                  ref={usernameRef}
                  id="username"
                  className="login-input"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError("");
                  }}
                  onKeyDown={handleKeyDown}
                  autoComplete="username"
                />
              </div>

              <div className="login-field-group">
                <label className="login-label" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  className="login-input"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  onKeyDown={handleKeyDown}
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <div className="login-error" role="alert">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    style={{ flexShrink: 0 }}
                  >
                    <circle
                      cx="7"
                      cy="7"
                      r="6"
                      stroke="#F87171"
                      strokeWidth="1.2"
                    />
                    <path
                      d="M7 4v4M7 9.5v.5"
                      stroke="#F87171"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
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
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                      <path
                        d="M3 7.5h9M8.5 4l3.5 3.5L8.5 11"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="login-footer">SECURED ENTERPRISE ACCESS</p>
      </div>
    </div>
  );
}