interface MacroBarProps {
  label: string;
  current: number;
  goal: number;
  unit?: string;
  colorClass: string;
  bgClass: string;
  sectionId?: string;
}

export function MacroBar({
  label,
  current,
  goal,
  unit = "g",
  colorClass,
  bgClass,
  sectionId,
}: MacroBarProps) {
  const percentage = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
  const isOver = current > goal;

  return (
    <div data-ocid={sectionId} className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
        <span className="text-xs text-muted-foreground">
          <span
            className={`font-semibold ${isOver ? "text-destructive" : "text-foreground"}`}
          >
            {Math.round(current)}
          </span>
          <span className="text-muted-foreground">
            {" "}
            / {Math.round(goal)}
            {unit}
          </span>
        </span>
      </div>
      <div className={`h-1.5 rounded-full ${bgClass} overflow-hidden`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${isOver ? "bg-destructive" : colorClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
