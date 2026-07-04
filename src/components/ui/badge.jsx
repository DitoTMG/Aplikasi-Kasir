import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-[10px] font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-indigo-600 text-white shadow hover:bg-indigo-500",
        secondary:
          "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700",
        destructive:
          "border-rose-500/30 bg-rose-500/20 text-rose-400 hover:bg-rose-500/30",
        outline: "border-slate-700 text-slate-300",
        success:
          "border-emerald-500/30 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30",
        warning:
          "border-amber-500/30 bg-amber-500/20 text-amber-400 hover:bg-amber-500/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
