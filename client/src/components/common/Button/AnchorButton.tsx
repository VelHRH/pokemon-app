import type { AnchorHTMLAttributes } from "react";
import { ButtonVariant, buttonVariants } from "./buttonVariants";
import { cn } from "@lib/cn";
import { buttonBaseClasses } from "./classes";

export type AnchorButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: ButtonVariant;
};

export function AnchorButton({
  variant = ButtonVariant.SECONDARY,
  className,
  ...props
}: AnchorButtonProps) {
  return (
    <a
      className={cn(buttonBaseClasses, buttonVariants[variant], className)}
      {...props}
    />
  );
}
