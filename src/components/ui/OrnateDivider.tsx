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
    <div className={`flex items-center justify-center gap-4 ${className}`}>
      <div className={`w-16 h-px bg-gradient-to-r from-transparent ${v.gradientLine}`} />
      <div className={`w-3 h-3 rotate-45 border ${v.diamond}`} />
      <div className={`w-32 h-px ${v.line}`} />
      <div className={`w-3 h-3 rotate-45 border ${v.diamond}`} />
      <div className={`w-16 h-px bg-gradient-to-l from-transparent ${v.gradientLine}`} />
    </div>
  );
}
