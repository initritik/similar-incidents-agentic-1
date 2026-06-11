import type { PropsWithChildren } from "react";
import { Shield, Zap } from "lucide-react";

export function AppLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-background">
      {/* ── Top navigation ──────────────────────────────────────── */}
      <nav
        className="nav-glass sticky top-0 z-20"
        aria-label="Application navigation"
      >
        <div className="mx-auto flex h-16 w-full max-w-screen-2xl items-center gap-4 px-6">
          {/* Logo mark */}
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-rl-gold/20 to-rl-gold/5 ring-1 ring-rl-gold/40 shadow-lg shadow-rl-gold/10">
              <Shield className="size-5 text-rl-gold" aria-hidden />
              <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-rl-gold/80 ring-2 ring-background" />
            </div>
            <div className="flex flex-col leading-tight">
              <span
                className="text-[13px] font-semibold tracking-[0.2em] text-rl-gold uppercase"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Royal London
              </span>
              <span className="text-[10px] text-white/40 tracking-widest uppercase">
                Incident Resolution
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="mx-2 h-6 w-px bg-rl-gold/15" />

          {/* App name */}
          <div className="flex items-center gap-2">
            <Zap className="size-3.5 text-rl-gold/60" />
            <span className="text-xs font-medium text-white/50 tracking-wide">
              AI Resolution Assistant
            </span>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Status chip */}
          <div className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
            <span className="text-[10px] text-emerald-400/80 font-medium tracking-wider uppercase">
              Live
            </span>
          </div>

          <div className="mx-2 h-4 w-px bg-white/10" />

          {/* POC badge */}
          <span className="rounded-full border border-rl-gold/30 bg-rl-gold/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-rl-gold">
            POC
          </span>
        </div>
      </nav>

      {/* ── Page content ────────────────────────────────────────── */}
      <main className="mx-auto flex w-full max-w-screen-2xl flex-col px-6 py-6">
        {children}
      </main>
    </div>
  );
}