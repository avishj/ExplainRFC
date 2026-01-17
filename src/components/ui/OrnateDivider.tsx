interface OrnateDividerProps {
  className?: string;
}

export function OrnateDivider({ className = "" }: OrnateDividerProps) {
  return (
    <div className={`flex items-center justify-center gap-4 ${className}`}>
      <div className="w-16 h-px bg-gradient-to-r from-transparent to-patina" />
      <div className="w-3 h-3 rotate-45 border border-brass" />
      <div className="w-32 h-px bg-patina" />
      <div className="w-3 h-3 rotate-45 border border-brass" />
      <div className="w-16 h-px bg-gradient-to-l from-transparent to-patina" />
    </div>
  );
}
