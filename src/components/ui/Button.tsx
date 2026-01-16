import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}

const variants = {
  primary: "bg-cyan text-void hover:bg-cyan/90 glow-cyan",
  secondary: "bg-violet text-white hover:bg-violet/90 glow-violet",
  ghost: "bg-transparent text-text-primary hover:bg-white/5",
  outline: "bg-transparent border border-cyan text-cyan hover:bg-cyan/10",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium rounded-lg",
        "transition-all duration-200 ease-out",
        "focus:outline-none focus:ring-2 focus:ring-cyan/50 focus:ring-offset-2 focus:ring-offset-void",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
