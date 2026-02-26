import { cn } from "@/lib/utils";

interface OrnateDividerProps {
  className?: string;
  variant?: "default" | "bright";
}

const VARIANTS = {
  default: { line: "bg-patina", gradientLine: "to-patina", diamond: "border-brass" },
  bright: { line: "bg-amber", gradientLine: "to-amber", diamond: "border-gold" },
};

export function OrnateDivider({ className = "", variant = "default" }: OrnateDividerProps) {
  const v = VARIANTS[variant];
  return (
    <div className={cn("flex items-center justify-center gap-4", className)}>
      <div className={cn("w-16 h-px bg-gradient-to-r from-transparent", v.gradientLine)} />
      <div className={cn("w-3 h-3 rotate-45 border", v.diamond)} />
      <div className={cn("w-32 h-px", v.line)} />
      <div className={cn("w-3 h-3 rotate-45 border", v.diamond)} />
      <div className={cn("w-16 h-px bg-gradient-to-l from-transparent", v.gradientLine)} />
    </div>
  );
}
