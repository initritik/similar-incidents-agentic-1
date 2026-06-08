import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export function IncidentSearchForm() {
  return (
    <aside className="rounded-lg border bg-card p-6 text-card-foreground">
      <h2 className="text-lg font-semibold">Incident Search</h2>
      <div className="mt-5 space-y-4">
        <input
          className="h-10 w-full rounded-md border bg-background px-3 text-sm"
          placeholder="Search incidents"
          type="search"
          disabled
        />
        <Button className="w-full" type="button" disabled>
          <Search aria-hidden="true" />
          Search
        </Button>
      </div>
    </aside>
  );
}

