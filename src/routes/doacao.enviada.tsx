import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { readLastDonation } from "@/lib/lastDonation";
import { useEffect, useState } from "react";
import type { DonationReceipt } from "@/services/donationsService";

export const Route = createFileRoute("/doacao/enviada")({
  head: () => ({
    meta: [
      { title: "Intenção de doação registrada | ReConecta TI" },
      {
        name: "description",
        content: "Sua intenção de doação foi registrada e será analisada pela escola.",
      },
      { property: "og:title", content: "Intenção de doação registrada | ReConecta TI" },
      {
        property: "og:description",
        content: "Acompanhe o andamento da sua doação pelo número de protocolo.",
      },
    ],
  }),
  component: DonationSentPage,
});

function DonationSentPage() {
  const [donation, setDonation] = useState<DonationReceipt | null>(null);

  useEffect(() => {
    setDonation(readLastDonation());
  }, []);

  return (
    <PublicLayout>
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <div className="rounded-2xl border border-border bg-card p-8 text-center sm:p-10">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-success/10 text-success">
            <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
          </span>
          <h1 className="mt-5 text-2xl font-bold text-foreground sm:text-3xl">
            Obrigado por querer fazer a diferença.
          </h1>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            Sua intenção de doação foi registrada para análise.
          </p>

          <dl className="mt-8 grid gap-4 rounded-xl border border-border bg-muted p-5 text-left sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted-foreground">Protocolo</dt>
              <dd className="font-display text-lg font-bold text-primary">
                {donation?.protocol ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Equipamento</dt>
              <dd className="font-medium text-foreground">{donation?.equipment ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Quantidade</dt>
              <dd className="font-medium text-foreground">{donation?.quantity ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Status</dt>
              <dd className="font-medium text-foreground">Aguardando análise</dd>
            </div>
          </dl>

          <div className="mt-8 text-left">
            <h2 className="text-base font-semibold text-foreground">Próximos passos</h2>
            <ol className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>1. A equipe responsável avaliará as informações.</li>
              <li>2. Caso necessário, entrará em contato.</li>
              <li>3. A entrega será combinada após a aprovação.</li>
            </ol>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild>
              <Link to="/">Voltar para o início</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/necessidades">Ver outras necessidades</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link to="/acompanhar">Acompanhar doação</Link>
            </Button>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
