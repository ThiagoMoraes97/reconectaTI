import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/Badges";
import { EmptyState, TableLoading } from "@/components/common/States";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDonations } from "@/services/donationsService";
import { formatDate } from "@/lib/labels";
import type { DonationStatus } from "@/types";

export const Route = createFileRoute("/admin/doacoes/")({
  head: () => ({
    meta: [
      { title: "Doações | Painel ReConecta TI" },
      { name: "description", content: "Analise as intenções de doação recebidas pela escola." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminDonationsPage,
});

const tabs: { value: string; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "pending", label: "Pendentes" },
  { value: "reviewing", label: "Em análise" },
  { value: "approved", label: "Aprovadas" },
  { value: "awaiting_delivery", label: "Aguardando entrega" },
  { value: "completed", label: "Concluídas" },
  { value: "rejected", label: "Recusadas" },
];

function AdminDonationsPage() {
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const { data, isLoading } = useQuery({ queryKey: ["donations"], queryFn: getDonations });

  const donations = useMemo(() => {
    let list = data ?? [];
    if (tab !== "all")
      list = list.filter((donation) => donation.status === (tab as DonationStatus));
    if (search.trim()) {
      const term = search.trim().toLowerCase();
      list = list.filter(
        (donation) =>
          donation.protocol.toLowerCase().includes(term) ||
          donation.donor.name.toLowerCase().includes(term) ||
          donation.equipment.toLowerCase().includes(term),
      );
    }
    return list;
  }, [data, tab, search]);

  return (
    <AdminLayout>
      <PageHeader
        title="Doações"
        description="Acompanhe e analise as intenções de doação registradas pelos doadores."
      />

      <div className="mt-8 space-y-4">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
            {tabs.map((item) => (
              <TabsTrigger key={item.value} value={item.value}>
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="max-w-md">
          <Label htmlFor="busca-doacoes">Buscar</Label>
          <Input
            id="busca-doacoes"
            className="mt-1.5"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Protocolo, doador ou equipamento"
          />
        </div>
      </div>

      <div className="mt-6">
        {isLoading ? <TableLoading /> : null}

        {data && donations.length === 0 ? (
          <EmptyState
            title="Nenhuma doação encontrada"
            description="Ajuste os filtros ou aguarde novas intenções de doação."
          />
        ) : null}

        {donations.length > 0 ? (
          <>
            <div className="hidden overflow-x-auto rounded-xl border border-border bg-card lg:block">
              <table className="w-full text-sm">
                <caption className="sr-only">Intenções de doação recebidas</caption>
                <thead className="border-b border-border bg-muted/60 text-left">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-medium">
                      Protocolo
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium">
                      Doador
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium">
                      Equipamento
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium">
                      Qtd.
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium">
                      Recebida em
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium">
                      Status
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {donations.map((donation) => (
                    <tr key={donation.id}>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        {donation.protocol}
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">
                        {donation.donor.name}
                      </td>
                      <td className="px-4 py-3">{donation.equipment}</td>
                      <td className="px-4 py-3">{donation.quantity}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(donation.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={donation.status} />
                      </td>
                      <td className="px-4 py-3">
                        <Button asChild size="sm" variant="outline">
                          <Link to="/admin/doacoes/$id" params={{ id: donation.id }}>
                            Ver detalhes
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="grid gap-4 lg:hidden">
              {donations.map((donation) => (
                <li key={donation.id} className="rounded-xl border border-border bg-card p-5">
                  <p className="font-mono text-xs text-muted-foreground">{donation.protocol}</p>
                  <p className="mt-1 font-medium text-foreground">{donation.equipment}</p>
                  <p className="text-sm text-muted-foreground">
                    {donation.donor.name} • {donation.quantity} un. •{" "}
                    {formatDate(donation.createdAt)}
                  </p>
                  <div className="mt-3">
                    <StatusBadge status={donation.status} />
                  </div>
                  <Button asChild size="sm" variant="outline" className="mt-4">
                    <Link to="/admin/doacoes/$id" params={{ id: donation.id }}>
                      Ver detalhes
                    </Link>
                  </Button>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </div>
    </AdminLayout>
  );
}
