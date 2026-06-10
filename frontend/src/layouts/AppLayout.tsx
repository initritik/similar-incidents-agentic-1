import type { PropsWithChildren } from "react";
import { Bot } from "lucide-react";

export function AppLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-background">
      {/* Top navigation bar */}
      <nav
        className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        aria-label="Application navigation"
      >
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center gap-3 px-6">
          <Bot className="size-5 text-foreground" aria-hidden />
          <span className="text-sm font-semibold text-foreground">
            Incident Resolution Assistant
          </span>
          <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            POC
          </span>
        </div>
      </nav>

      {/* Page content */}
      <main className="mx-auto flex w-full max-w-7xl flex-col px-6 py-8">
        {children}
      </main>
    </div>
  );
}