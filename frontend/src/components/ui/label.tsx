import * as React from "react";
import { cn } from "@/utils/cn";

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return <label className={cn("text-sm font-medium leading-none", className)} {...props} />;
}

export { Label };
