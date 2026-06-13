import { useCallback, useEffect, useState } from "react";

export interface HistoryEntry {
  /** Unique session ID (timestamp-based) */
  id: string;
  /** Incident number searched */
  incident_number: string;
  /** ISO timestamp when the search started */
  searched_at: string;
  /** Final workflow overall status */
  overall_status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "SKIPPED" | null;
}

const STORAGE_KEY = "incident_ai_history";
const MAX_ENTRIES = 50;

function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HistoryEntry[];
  } catch {
    return [];
  }
}

function saveHistory(entries: HistoryEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
  } catch {
    // Quota exceeded — silently ignore
  }
}

export function useHistory() {
  const [entries, setEntries] = useState<HistoryEntry[]>(() => loadHistory());

  // Keep localStorage in sync whenever entries change
  useEffect(() => {
    saveHistory(entries);
  }, [entries]);

  /** Add or update an entry. If id already exists, update it in place. */
  const upsertEntry = useCallback((entry: HistoryEntry) => {
    setEntries((prev) => {
      const idx = prev.findIndex((e) => e.id === entry.id);
      if (idx === -1) {
        // Newest first
        return [entry, ...prev];
      }
      const next = [...prev];
      next[idx] = entry;
      return next;
    });
  }, []);

  /** Remove a single entry by id. */
  const removeEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  /** Clear all history. */
  const clearHistory = useCallback(() => {
    setEntries([]);
  }, []);

  return { entries, upsertEntry, removeEntry, clearHistory };
}