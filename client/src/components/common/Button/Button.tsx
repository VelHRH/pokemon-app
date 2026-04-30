import type { ButtonHTMLAttributes } from "react";
import { cn } from "@lib/cn";
import { ButtonVariant, buttonVariants } from "./buttonVariants";
import { buttonBaseClasses } from "./classes";

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
      className={cn(buttonBaseClasses, buttonVariants[variant], className)}
      {...props}
    />
  );
}
