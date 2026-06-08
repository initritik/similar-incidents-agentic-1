import { AgentTabs } from "@/components/AgentTabs";
import { IncidentSearchForm } from "@/components/IncidentSearchForm";
import { WorkflowDiagram } from "@/components/WorkflowDiagram";

export function Home() {
  return (
    <div className="flex flex-1 flex-col gap-8">
      <header className="border-b pb-6">
        <p className="text-sm font-medium text-muted-foreground">
          Incident Resolution Assistant
        </p>
        <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-normal text-foreground">
          AI-powered incident triage foundation
        </h1>
      </header>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <WorkflowDiagram />
        <IncidentSearchForm />
      </section>

      <AgentTabs />
    </div>
  );
}

