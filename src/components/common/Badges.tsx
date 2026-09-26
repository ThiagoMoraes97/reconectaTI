import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  PackageCheck,
  Search,
  Truck,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { donationStatusLabel, needStatusLabel, priorityLabel } from "@/lib/labels";
import type { DonationStatus, NeedPriority, NeedStatus } from "@/types";

const base = "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium";

export function StatusBadge({ status }: { status: DonationStatus }) {
  const config: Record<DonationStatus, { icon: typeof Clock; className: string }> = {
    pending: { icon: Clock, className: "border-warning/40 bg-warning/10 text-warning-foreground" },
    reviewing: { icon: Search, className: "border-primary/30 bg-primary/10 text-primary" },
    approved: { icon: CheckCircle2, className: "border-success/40 bg-success/10 text-success" },
    awaiting_delivery: {
      icon: Truck,
      className: "border-accent/40 bg-accent/10 text-accent",
    },
    completed: { icon: PackageCheck, className: "border-success/50 bg-success/15 text-success" },
    rejected: {
      icon: XCircle,
      className: "border-destructive/40 bg-destructive/10 text-destructive",
    },
  };
  const { icon: Icon, className } = config[status];
  return (
    <span className={cn(base, className)}>
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      {donationStatusLabel(status)}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: NeedPriority }) {
  const config: Record<NeedPriority, string> = {
    high: "border-accent/40 bg-accent/10 text-accent",
    medium: "border-warning/40 bg-warning/10 text-warning-foreground",
    low: "border-border bg-muted text-muted-foreground",
  };
  return (
    <span className={cn(base, config[priority])}>
      {priority === "high" ? (
        <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      ) : null}
      {priorityLabel(priority)}
    </span>
  );
}

export function NeedStatusBadge({ status }: { status: NeedStatus }) {
  const config: Record<NeedStatus, string> = {
    draft: "border-border bg-muted text-muted-foreground",
    active: "border-primary/30 bg-primary/10 text-primary",
    fulfilled: "border-success/40 bg-success/10 text-success",
    archived: "border-border bg-muted text-muted-foreground",
  };
  return <span className={cn(base, config[status])}>{needStatusLabel(status)}</span>;
}
