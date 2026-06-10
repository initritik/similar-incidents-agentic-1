import { cn } from "@/utils/cn";

interface CodeBlockProps {
  code: string;
  className?: string;
}

export function CodeBlock({ code, className }: CodeBlockProps) {
  return (
    <pre
      className={cn(
        "overflow-x-auto rounded-md border bg-muted/50 px-4 py-3 font-mono text-xs leading-relaxed text-foreground",
        className,
      )}
    >
      <code>{code}</code>
    </pre>
  );
}