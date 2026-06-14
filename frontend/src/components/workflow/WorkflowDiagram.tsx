import { cn } from "@/utils/cn";
import type { WorkflowAgentStatus, WorkflowStatus } from "@/types/workflow";

interface WorkflowDiagramProps {
  agentStatuses: WorkflowAgentStatus[];
  className?: string;
}

// Renamed agents — no "Agent" keyword anywhere
const AGENTS = [
  { key: "Agent 1", label: "DATA QUALITY\nCHECK",    short: "DQ"  },
  { key: "Agent 2", label: "KNOWLEDGE\nBASE",         short: "KB"  },
  { key: "Agent 3", label: "IMPACT\nANALYSIS",        short: "IA"  },
  { key: "Agent 4", label: "PROVIDE\nRESOLUTION",     short: "PR"  },
  { key: "Agent 5", label: "RESOLUTION",              short: "RS"  },
] as const;

// Status-driven colour tokens
const STATUS_COLORS: Record<WorkflowStatus, {
  ring: string; glow: string; bodyFill: string; screenFill: string;
  eyeFill: string; label: string; dot: string; connectorClass: string;
}> = {
  PENDING: {
    ring:           "rgba(255,255,255,0.08)",
    glow:           "none",
    bodyFill:       "#1A2F52",
    screenFill:     "#0C1F3F",
    eyeFill:        "#3A5070",
    label:          "#4A6080",
    dot:            "#3A5070",
    connectorClass: "connector-pending",
  },
  RUNNING: {
    ring:           "rgba(201,168,76,0.45)",
    glow:           "0 0 22px 4px rgba(201,168,76,0.35)",
    bodyFill:       "#1E2A18",
    screenFill:     "#0F1A0A",
    eyeFill:        "#C9A84C",
    label:          "#C9A84C",
    dot:            "#C9A84C",
    connectorClass: "connector-running",
  },
  COMPLETED: {
    ring:           "rgba(59,130,246,0.50)",
    glow:           "0 0 18px 3px rgba(59,130,246,0.28)",
    bodyFill:       "#0F1E38",
    screenFill:     "#07122A",
    eyeFill:        "#3B82F6",
    label:          "#93C5FD",
    dot:            "#3B82F6",
    connectorClass: "connector-completed",
  },
  FAILED: {
    ring:           "rgba(239,68,68,0.50)",
    glow:           "0 0 18px 3px rgba(239,68,68,0.25)",
    bodyFill:       "#2A0F0F",
    screenFill:     "#1A0707",
    eyeFill:        "#EF4444",
    label:          "#FCA5A5",
    dot:            "#EF4444",
    connectorClass: "connector-failed",
  },
  SKIPPED: {
    ring:           "rgba(245,158,11,0.30)",
    glow:           "none",
    bodyFill:       "#1A1A10",
    screenFill:     "#111108",
    eyeFill:        "#78716C",
    label:          "#78716C",
    dot:            "#F59E0B",
    connectorClass: "connector-pending",
  },
};

/** 3-D style bot SVG — unique per index for subtle variety */
function BotIcon({
  status,
  index,
  isRunning,
}: {
  status: WorkflowStatus;
  index: number;
  isRunning: boolean;
}) {
  const c = STATUS_COLORS[status];
  const id = `bot-${index}`;

  // Slight hue rotation on body gradient per bot so they're not identical
  const bodyHue = [220, 210, 225, 215, 205][index] ?? 220;

  return (
    <svg
      viewBox="0 0 72 88"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      style={{
        filter: c.glow !== "none" ? `drop-shadow(0 0 10px ${c.eyeFill}88)` : undefined,
        animation: isRunning ? "float 2.4s ease-in-out infinite" : undefined,
      }}
      aria-hidden
    >
      <defs>
        {/* Body gradient — gives the 3-D sphere-like feel */}
        <radialGradient id={`${id}-body`} cx="35%" cy="30%" r="65%">
          <stop offset="0%"  stopColor={lighten(c.bodyFill, 0.28)} />
          <stop offset="55%" stopColor={c.bodyFill} />
          <stop offset="100%" stopColor={darken(c.bodyFill, 0.22)} />
        </radialGradient>
        {/* Head gradient */}
        <radialGradient id={`${id}-head`} cx="38%" cy="28%" r="62%">
          <stop offset="0%"  stopColor={lighten(c.bodyFill, 0.35)} />
          <stop offset="60%" stopColor={c.bodyFill} />
          <stop offset="100%" stopColor={darken(c.bodyFill, 0.25)} />
        </radialGradient>
        {/* Screen glow gradient */}
        <radialGradient id={`${id}-screen`} cx="50%" cy="45%" r="55%">
          <stop offset="0%"  stopColor={lighten(c.screenFill, 0.4)} />
          <stop offset="100%" stopColor={c.screenFill} />
        </radialGradient>
        {/* Eye glow */}
        <radialGradient id={`${id}-eye`} cx="35%" cy="35%" r="60%">
          <stop offset="0%"  stopColor={lighten(c.eyeFill, 0.5)} stopOpacity="1" />
          <stop offset="100%" stopColor={c.eyeFill} stopOpacity="0.9" />
        </radialGradient>
        {/* Specular highlight */}
        <radialGradient id={`${id}-spec`} cx="30%" cy="20%" r="50%">
          <stop offset="0%"  stopColor="rgba(255,255,255,0.22)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
        {/* Ring glow filter */}
        <filter id={`${id}-glow`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* ── Neck ── */}
      <rect x="30" y="52" width="12" height="7" rx="3"
        fill={`url(#${id}-body)`} />

      {/* ── Body ── */}
      <rect x="10" y="57" width="52" height="26" rx="9"
        fill={`url(#${id}-body)`} />
      {/* Body specular */}
      <rect x="10" y="57" width="52" height="12" rx="9"
        fill={`url(#${id}-spec)`} opacity="0.6" />

      {/* Body panel lines */}
      <rect x="18" y="65" width="36" height="1.5" rx="0.75"
        fill="rgba(255,255,255,0.06)" />
      <rect x="18" y="69" width="24" height="1.5" rx="0.75"
        fill="rgba(255,255,255,0.04)" />

      {/* Side ports */}
      <circle cx="13" cy="68" r="2.5" fill={darken(c.bodyFill, 0.15)}
        stroke={c.eyeFill} strokeWidth="0.8" strokeOpacity="0.4" />
      <circle cx="59" cy="68" r="2.5" fill={darken(c.bodyFill, 0.15)}
        stroke={c.eyeFill} strokeWidth="0.8" strokeOpacity="0.4" />

      {/* Shoulder accent dots */}
      {[22, 28, 34].map((x, i) => (
        <circle key={i} cx={x} cy="78" r="1.6"
          fill={c.eyeFill} opacity={0.25 + i * 0.12} />
      ))}

      {/* ── Head ── */}
      <rect x="12" y="16" width="48" height="38" rx="12"
        fill={`url(#${id}-head)`} />
      {/* Head specular */}
      <rect x="12" y="16" width="48" height="20" rx="12"
        fill={`url(#${id}-spec)`} opacity="0.55" />

      {/* Antenna */}
      <line x1="36" y1="16" x2="36" y2="6" stroke={c.eyeFill}
        strokeWidth="2" strokeOpacity="0.7" strokeLinecap="round" />
      <circle cx="36" cy="4.5" r="3"
        fill={c.eyeFill} opacity={isRunning ? 1 : 0.6}
        style={isRunning ? {
          animation: "gold-pulse 1.8s ease-in-out infinite",
          filter: `drop-shadow(0 0 4px ${c.eyeFill})`,
        } : undefined}
      />

      {/* Face / screen bezel */}
      <rect x="18" y="22" width="36" height="26" rx="7"
        fill={`url(#${id}-screen)`}
        stroke={c.eyeFill} strokeWidth="0.8" strokeOpacity="0.35" />

      {/* Eyes */}
      <circle cx="28" cy="34" r="5.5" fill={`url(#${id}-eye)`}
        filter={`url(#${id}-glow)`} />
      <circle cx="44" cy="34" r="5.5" fill={`url(#${id}-eye)`}
        filter={`url(#${id}-glow)`} />
      {/* Eye specular */}
      <circle cx="26.5" cy="32.5" r="1.8" fill="rgba(255,255,255,0.55)" />
      <circle cx="42.5" cy="32.5" r="1.8" fill="rgba(255,255,255,0.55)" />
      {/* Pupils */}
      <circle cx="28" cy="34" r="2.2" fill={darken(c.eyeFill, 0.35)} />
      <circle cx="44" cy="34" r="2.2" fill={darken(c.eyeFill, 0.35)} />

      {/* Mouth / status bar */}
      <rect x="24" y="42" width="24" height="3" rx="1.5"
        fill={c.eyeFill} opacity={status === "PENDING" ? 0.18 : 0.55} />
      {status === "RUNNING" && (
        <rect x="24" y="42" width="10" height="3" rx="1.5"
          fill={c.eyeFill} opacity="0.95"
          style={{ animation: "flow-yellow 1.4s linear infinite" }}
        />
      )}
      {status === "COMPLETED" && (
        // Smile arc via path
        <path d="M 26 42 Q 36 47 46 42" stroke={c.eyeFill}
          strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.8" />
      )}

      {/* Outer ring glow when active */}
      {(status === "RUNNING" || status === "COMPLETED") && (
        <rect x="11" y="15" width="50" height="40" rx="13"
          fill="none"
          stroke={c.eyeFill}
          strokeWidth="1.2"
          strokeOpacity={status === "RUNNING" ? 0.7 : 0.35}
          style={status === "RUNNING" ? {
            animation: "gold-pulse 1.8s ease-in-out infinite",
          } : undefined}
        />
      )}
    </svg>
  );
}

/** Zig-zag SVG connector between two bot nodes */
function ZigZagConnector({
  status,
  index,
}: {
  status: WorkflowStatus;
  index: number; // 0–3 for the 4 gaps between 5 bots
}) {
  const c = STATUS_COLORS[status];
  // Alternate zig direction: even = down-then-up, odd = up-then-down
  const isZigDown = index % 2 === 0;
  const W = 56; // total connector width
  const H = 28; // amplitude of the zig
  const midY = H / 2;
  const amplitude = isZigDown ? 12 : -12;

  // Path: start center-left, arc to mid with offset, arc back center-right
  const d = `M 0 ${midY} C ${W * 0.3} ${midY} ${W * 0.3} ${midY + amplitude} ${W * 0.5} ${midY + amplitude} S ${W * 0.7} ${midY} ${W} ${midY}`;

  const isActive = status === "RUNNING" || status === "COMPLETED";

  return (
    <div
      className="relative shrink-0 flex items-center justify-center"
      style={{ width: W, height: H }}
      aria-hidden
    >
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="overflow-visible">
        <defs>
          <linearGradient id={`conn-grad-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor={c.eyeFill} stopOpacity="0.25" />
            <stop offset="50%"  stopColor={c.eyeFill} stopOpacity={isActive ? 0.9 : 0.3} />
            <stop offset="100%" stopColor={c.eyeFill} stopOpacity="0.25" />
          </linearGradient>
          {status === "RUNNING" && (
            <filter id={`conn-glow-${index}`}>
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          )}
        </defs>

        {/* Track (dim bg path) */}
        <path d={d} fill="none"
          stroke="rgba(255,255,255,0.06)" strokeWidth="2"
          strokeLinecap="round" />

        {/* Active path */}
        <path d={d} fill="none"
          stroke={`url(#conn-grad-${index})`}
          strokeWidth={isActive ? 2.2 : 1.5}
          strokeLinecap="round"
          strokeDasharray={status === "RUNNING" ? "4 3" : undefined}
          filter={status === "RUNNING" ? `url(#conn-glow-${index})` : undefined}
          style={status === "RUNNING" ? {
            animation: "flow-yellow 1.2s linear infinite",
          } : undefined}
        />

        {/* Midpoint dot */}
        <circle
          cx={W / 2}
          cy={midY + amplitude}
          r="2.8"
          fill={c.eyeFill}
          opacity={isActive ? 0.85 : 0.2}
          style={status === "RUNNING" ? {
            animation: "gold-pulse 1.8s ease-in-out infinite",
          } : undefined}
        />
      </svg>
    </div>
  );
}

// ── Tiny colour helpers ────────────────────────────────────────────────────────
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}
function toHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
}
function lighten(hex: string, amt: number): string {
  const [r, g, b] = hexToRgb(hex);
  return toHex(r + 255 * amt, g + 255 * amt, b + 255 * amt);
}
function darken(hex: string, amt: number): string {
  const [r, g, b] = hexToRgb(hex);
  return toHex(r - 255 * amt, g - 255 * amt, b - 255 * amt);
}

// ── Status legend ──────────────────────────────────────────────────────────────
const LEGEND: [WorkflowStatus, string][] = [
  ["PENDING",   "Pending"],
  ["RUNNING",   "Running"],
  ["COMPLETED", "Completed"],
  ["FAILED",    "Failed"],
  ["SKIPPED",   "Skipped"],
];

// ── Main component ─────────────────────────────────────────────────────────────
export function WorkflowDiagram({ agentStatuses, className }: WorkflowDiagramProps) {
  const statusMap = Object.fromEntries(
    agentStatuses.map((a) => [a.agent_name, a.status as WorkflowStatus])
  );

  return (
    <section
      className={cn(
        "rounded-xl border border-rl-gold/12 shadow-sm overflow-hidden",
        "bg-gradient-to-b from-[#0E1E3A] to-[#091629]",
        className
      )}
      aria-label="Workflow progress diagram"
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 px-6 pt-5 pb-4 border-b border-white/5">
        <div className="h-3 w-0.5 rounded-full bg-rl-gold" />
        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-rl-gold/70">
          Pipeline Status
        </span>
      </div>

      {/* Bot row */}
      <div
        className="flex items-center justify-between px-4 py-6 overflow-x-auto"
        style={{ minWidth: 0 }}
      >
        {AGENTS.map((agent, idx) => {
          const status: WorkflowStatus = statusMap[agent.key] ?? "PENDING";
          const c = STATUS_COLORS[status];
          const isRunning = status === "RUNNING";
          const isLast = idx === AGENTS.length - 1;
          const labelLines = agent.label.split("\n");

          return (
            <div key={agent.key} className="flex items-center">
              {/* Bot node */}
              <div className="flex flex-col items-center gap-2 select-none">
                {/* Bot avatar with ring */}
                <div
                  className="relative rounded-full transition-all duration-500"
                  style={{
                    width: 68,
                    height: 68,
                    boxShadow: `0 0 0 2px ${c.ring}, ${c.glow !== "none" ? c.glow : "none"}`,
                    background: `radial-gradient(circle at 40% 35%, ${lighten(c.bodyFill, 0.08)}, ${darken(c.bodyFill, 0.1)})`,
                    padding: 4,
                  }}
                >
                  <BotIcon status={status} index={idx} isRunning={isRunning} />

                  {/* Status dot badge */}
                  <span
                    className="absolute bottom-0.5 right-0.5 size-3 rounded-full border-2 border-[#091629] transition-colors duration-300"
                    style={{ background: c.dot }}
                    aria-hidden
                  />
                </div>

                {/* Label */}
                <div className="text-center">
                  {labelLines.map((line, li) => (
                    <p
                      key={li}
                      className="text-[9.5px] font-bold tracking-[0.12em] leading-snug transition-colors duration-300"
                      style={{ color: c.label }}
                    >
                      {line}
                    </p>
                  ))}
                </div>

                {/* Subtle step number */}
                <span
                  className="text-[8px] font-semibold tabular-nums"
                  style={{ color: `${c.dot}55` }}
                >
                  {String(idx + 1).padStart(2, "0")}
                </span>
              </div>

              {/* Zig-zag connector (not after last) */}
              {!isLast && (
                <ZigZagConnector status={status} index={idx} />
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-5 gap-y-2 px-6 pb-4 pt-1 border-t border-white/5">
        {LEGEND.map(([s, label]) => (
          <div key={s} className="flex items-center gap-1.5">
            <span
              className="size-2 rounded-full transition-colors duration-300"
              style={{ background: STATUS_COLORS[s].dot }}
              aria-hidden
            />
            <span className="text-[10px] text-white/35 font-medium">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}