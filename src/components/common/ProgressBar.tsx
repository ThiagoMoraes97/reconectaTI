import { cn } from "@/lib/utils";
import { progressOf } from "@/lib/labels";

interface ProgressBarProps {
  received: number;
  requested: number;
  className?: string;
  showLabel?: boolean;
}

export function ProgressBar({
  received,
  requested,
  className,
  showLabel = true,
}: ProgressBarProps) {
  const percent = progressOf(received, requested);
  return (
    <div className={cn("space-y-1.5", className)}>
      {showLabel ? (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {received} de {requested} recebidos
          </span>
          <span className="font-medium text-foreground">{percent}% atendido</span>
        </div>
      ) : null}
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${percent}% da necessidade atendida`}
      >
        <div
          className="h-full rounded-full bg-secondary transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
