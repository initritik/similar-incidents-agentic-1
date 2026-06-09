import * as React from "react";
import { cn } from "@/utils/cn";

type AlertProps = React.ComponentProps<"div"> & {
  variant?: "default" | "destructive";
};

function Alert({ className, variant = "default", ...props }: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        "relative grid w-full grid-cols-[auto_1fr] gap-x-3 rounded-lg border p-4 text-sm",
        variant === "destructive" && "border-destructive/50 text-destructive",
        className,
      )}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("col-start-2 mb-1 font-medium leading-none", className)} {...props} />;
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("col-start-2 text-sm opacity-90", className)} {...props} />;
}

export { Alert, AlertTitle, AlertDescription };
