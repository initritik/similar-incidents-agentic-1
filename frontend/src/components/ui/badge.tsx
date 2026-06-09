import * as React from "react";
import { cn } from "@/utils/cn";

type BadgeProps = React.ComponentProps<"span"> & {
  variant?: "default" | "secondary" | "destructive" | "outline";
};

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold transition-colors",
        variant === "default" && "border-transparent bg-primary text-primary-foreground",
        variant === "secondary" && "border-transparent bg-secondary text-secondary-foreground",
        variant === "destructive" && "border-transparent bg-destructive text-white",
        variant === "outline" && "text-foreground",
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
