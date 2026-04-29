import type { HTMLAttributes } from "react";
import { cn } from "@lib/cn";

export type SectionTitleProps = HTMLAttributes<HTMLHeadingElement>;

export function SectionTitle({ className, ...props }: SectionTitleProps) {
  return (
    <h2
      className={cn("text-lg font-semibold text-neutral-900", className)}
      {...props}
    />
  );
}
