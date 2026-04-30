export enum ButtonVariant {
  PRIMARY = "PRIMARY",
  SECONDARY = "SECONDARY",
}
export const buttonVariants: Record<ButtonVariant, string> = {
  [ButtonVariant.PRIMARY]: "bg-black text-white hover:bg-neutral-800",
  [ButtonVariant.SECONDARY]:
    "border border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50",
};
