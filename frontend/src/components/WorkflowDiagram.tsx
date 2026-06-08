export function WorkflowDiagram() {
  return (
    <section className="rounded-lg border bg-card p-6 text-card-foreground">
      <h2 className="text-lg font-semibold">Workflow</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {["Intake", "Analysis", "Resolution"].map((step) => (
          <div key={step} className="rounded-md border bg-background p-4">
            <p className="text-sm font-medium">{step}</p>
            <p className="mt-2 text-sm text-muted-foreground">Placeholder</p>
          </div>
        ))}
      </div>
    </section>
  );
}

