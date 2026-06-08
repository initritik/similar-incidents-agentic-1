export function AgentTabs() {
  return (
    <section className="rounded-lg border bg-card p-6 text-card-foreground">
      <h2 className="text-lg font-semibold">Agent Workbench</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {["Overview", "Investigation", "Recommendation"].map((tab) => (
          <button
            key={tab}
            className="rounded-md border px-3 py-2 text-sm text-muted-foreground"
            type="button"
            disabled
          >
            {tab}
          </button>
        ))}
      </div>
    </section>
  );
}

