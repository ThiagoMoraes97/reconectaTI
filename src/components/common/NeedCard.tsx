import { Link } from "@tanstack/react-router";
import { Cpu, HardDrive, Keyboard, Projector, Router, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/common/ProgressBar";
import { NeedStatusBadge, PriorityBadge } from "@/components/common/Badges";
import type { Need, NeedCategory } from "@/types";

const categoryIcon: Record<NeedCategory, typeof Cpu> = {
  Computadores: Cpu,
  Periféricos: Keyboard,
  Audiovisual: Projector,
  Rede: Router,
  Outros: Wrench,
};

export function NeedCard({ need, compact }: { need: Need; compact?: boolean }) {
  const Icon = categoryIcon[need.category] ?? HardDrive;
  const remaining = Math.max(0, need.requestedQuantity - need.receivedQuantity);

  return (
    <article className="flex h-full flex-col rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-soft)]">
      <div className="flex items-start justify-between gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-primary/8 text-primary">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <PriorityBadge priority={need.priority} />
      </div>

      <h3 className="mt-4 text-lg font-semibold text-foreground">{need.name}</h3>
      <p className="mt-1 text-xs font-medium uppercase tracking-wide text-secondary">
        {need.category}
      </p>

      {!compact ? (
        <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{need.description}</p>
      ) : null}

      <div className="mt-4">
        <ProgressBar received={need.receivedQuantity} requested={need.requestedQuantity} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <NeedStatusBadge status={need.status} />
        {remaining > 0 ? (
          <span className="text-xs text-muted-foreground">Faltam {remaining} itens</span>
        ) : (
          <span className="text-xs text-success">Necessidade atendida</span>
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-2 pt-1">
        <Button asChild variant="outline" className="flex-1">
          <Link to="/necessidades/$id" params={{ id: need.id }}>
            Ver detalhes
          </Link>
        </Button>
        {remaining > 0 ? (
          <Button asChild className="flex-1">
            <Link to="/doar" search={{ need: need.id }}>
              Quero ajudar
            </Link>
          </Button>
        ) : null}
      </div>
    </article>
  );
}
