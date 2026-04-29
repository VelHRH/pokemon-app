import type { HTMLAttributes } from "react";
import { cn } from "@lib/cn";

export type PageTitleProps = HTMLAttributes<HTMLHeadingElement>;

export function PageTitle({ className, ...props }: PageTitleProps) {
  return <h1 className={cn("text-2xl font-bold", className)} {...props} />;
}
