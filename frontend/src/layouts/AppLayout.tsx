import type { PropsWithChildren } from "react";
import { Shield, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function AppLayout({ children }: PropsWithChildren) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <nav
        className="sticky top-0 z-20 border-b border-rl-gold/15 bg-rl-navy shadow-[0_2px_12px_rgba(12,31,63,0.18)]"
        aria-label="Application navigation"
      >
        <div className="mx-auto flex h-14 w-full max-w-screen-2xl items-center gap-3 px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-rl-gold/20 ring-1 ring-rl-gold/40">
              <Shield className="size-4 text-rl-gold" aria-hidden />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-rl-gold">
                {user?.appName ?? "AI RESOLUTION"}
              </span>
              <span className="text-[10px] text-white/50 tracking-wide">
                Ticket Resolution
              </span>
            </div>
          </div>

          <div className="mx-3 h-5 w-px bg-white/15" />

          <span className="text-xs font-medium text-white/70">
            AI Resolution Assistant
          </span>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Welcome bar */}
          {user && (
            <div className="welcome-bar">
              <span className="welcome-bar-dot" />
              WELCOME, {user.welcomeTeam}!
            </div>
          )}

          {/* Logout */}
          {user && (
            <button
              onClick={logout}
              title="Sign out"
              className="ml-3 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-white/40 hover:bg-white/5 hover:text-rl-gold transition-colors"
            >
              <LogOut className="size-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          )}
        </div>
      </nav>

      <main className="mx-auto flex w-full max-w-screen-2xl flex-col px-6 py-6">
        {children}
      </main>
    </div>
  );
}