import type { ButtonHTMLAttributes } from "react";
import { cn } from "@lib/cn";
import { ButtonVariant } from "./buttonVariants";

const buttonBase =
  "rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer";

const variants: Record<ButtonVariant, string> = {
  [ButtonVariant.PRIMARY]: "bg-black text-white hover:bg-neutral-800",
  [ButtonVariant.SECONDARY]:
    "border border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50",
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export function Button({
  variant = ButtonVariant.PRIMARY,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonBase, variants[variant], className)}
      {...props}
    />
  );
}
