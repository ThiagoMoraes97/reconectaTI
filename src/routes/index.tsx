import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, GraduationCap, Recycle, Users } from "lucide-react";
import escola from "@/assets/escola.png";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { NeedCard } from "@/components/common/NeedCard";
import { LoadingState, ErrorState } from "@/components/common/States";
import { getPublicMetrics, getPublicNeeds } from "@/services/needsService";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ReConecta TI | Tecnologia que circula, educação que transforma" },
      {
        name: "description",
        content:
          "Veja os equipamentos de tecnologia que a Escola Municipal Francisco Costa precisa e registre sua intenção de doação.",
      },
      {
        property: "og:title",
        content: "ReConecta TI | Tecnologia que circula, educação que transforma",
      },
      {
        property: "og:description",
        content:
          "Economia circular para aproximar a Escola Municipal Francisco Costa de quem pode doar equipamentos de tecnologia.",
      },
    ],
  }),
  component: HomePage,
});

const steps = [
  { number: "01", title: "Veja as necessidades", text: "Consulte o que a escola precisa agora." },
  { number: "02", title: "Escolha como ajudar", text: "Selecione o equipamento que você tem." },
  {
    number: "03",
    title: "Envie sua intenção de doação",
    text: "Preencha o formulário com as informações do item.",
  },
  {
    number: "04",
    title: "A escola analisa e entra em contato",
    text: "A equipe avalia e combina os próximos passos.",
  },
];

const benefits = [
  {
    icon: Recycle,
    title: "Equipamentos ganham uma nova vida",
    text: "Evita descarte prematuro de tecnologia que ainda pode ser utilizada.",
  },
  {
    icon: GraduationCap,
    title: "A escola amplia seus recursos",
    text: "A instituição recebe ferramentas que apoiam atividades educacionais.",
  },
  {
    icon: Users,
    title: "Mais alunos têm acesso à tecnologia",
    text: "A reutilização contribui para reduzir desigualdades de acesso digital.",
  },
];

const sdgs = [
  { number: "04", title: "Educação de qualidade" },
  { number: "10", title: "Redução das desigualdades" },
  { number: "12", title: "Consumo e produção responsáveis" },
];

function HomePage() {
  const metrics = useQuery({ queryKey: ["public-metrics"], queryFn: getPublicMetrics });
  const needs = useQuery({ queryKey: ["public-needs"], queryFn: getPublicNeeds });

  const priorityNeeds = (needs.data ?? [])
    .filter((need) => need.status === "active")
    .sort((a, b) => (a.priority === "high" ? -1 : 0) - (b.priority === "high" ? -1 : 0))
    .slice(0, 4);

  return (
    <PublicLayout>
      <section className="surface-warm border-b border-border">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:py-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-secondary">
              Economia circular • Educação • Tecnologia
            </p>
            <h1 className="mt-4 text-3xl leading-tight text-foreground sm:text-4xl lg:text-5xl">
              Um equipamento parado pode abrir novas possibilidades.
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
              O ReConecta TI aproxima a Escola Municipal Francisco Costa de pessoas dispostas a dar
              uma nova utilidade a equipamentos de tecnologia.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link to="/necessidades">Ver equipamentos necessários</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/doar">Quero fazer uma doação</Link>
              </Button>
            </div>
          </div>

          <div className="relative">
            <img
              src={escola}
              alt="Fachada da Escola Municipal Francisco Costa, em Miguel Pereira, RJ"
              className="aspect-[4/3] w-full rounded-2xl object-cover shadow-[var(--shadow-soft)]"
              loading="eager"
            />
            <div className="absolute -bottom-5 left-4 right-4 rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-soft)] sm:left-6 sm:right-auto sm:max-w-xs">
              <p className="text-sm font-semibold text-foreground">
                Escola Municipal Francisco Costa
              </p>
              <p className="text-xs text-muted-foreground">Miguel Pereira • RJ</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6" aria-label="Números do projeto">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { value: metrics.data?.neededEquipments, label: "Equipamentos necessários" },
            { value: metrics.data?.donationsReceived, label: "Doações recebidas" },
            { value: metrics.data?.fulfilledNeeds, label: "Necessidades atendidas" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-border bg-card p-6 text-center"
            >
              <p className="font-display text-4xl font-bold text-primary">{item.value ?? "—"}</p>
              <p className="mt-1 text-sm text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>
        {needs.data?.some((need) => need.demoData) ? (
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Os itens e números atuais são demonstrativos e não representam dados oficiais da escola.
          </p>
        ) : null}
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6">
        <div className="grid gap-3 sm:flex sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
              O que a escola precisa agora
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Necessidades prioritárias cadastradas pela equipe da escola.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/necessidades">
              Ver todas as necessidades
              <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>

        <div className="mt-8">
          {needs.isLoading ? <LoadingState rows={4} className="lg:grid-cols-4" /> : null}
          {needs.isError ? <ErrorState onRetry={() => needs.refetch()} /> : null}
          {needs.data ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {priorityNeeds.map((need) => (
                <NeedCard key={need.id} need={need} compact />
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="surface-warm border-y border-border">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Como sua doação ajuda</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="rounded-xl border border-border bg-card p-6">
                <span className="grid h-11 w-11 place-items-center rounded-lg bg-secondary/10 text-secondary">
                  <benefit.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-foreground">{benefit.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{benefit.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Como funciona</h2>
        <ol className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <li key={step.number} className="rounded-xl border border-border bg-card p-6">
              <span className="font-display text-sm font-bold text-accent">{step.number}</span>
              <h3 className="mt-2 text-base font-semibold text-foreground">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.text}</p>
            </li>
          ))}
        </ol>
        <p className="mt-6 rounded-lg border border-border bg-muted p-4 text-sm text-muted-foreground">
          O envio do formulário representa uma intenção de doação. A equipe responsável pela escola
          realizará a análise antes da confirmação.
        </p>
      </section>

      <section className="border-y border-border bg-primary text-primary-foreground">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-14 sm:px-6 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">Antes de descartar, reconecte.</h2>
            <p className="mt-4 text-primary-foreground/85">
              Equipamentos de informática costumam sair de uso muito antes do fim da sua vida útil.
              Um computador guardado há anos pode voltar a funcionar em uma sala de aula, apoiar
              pesquisas escolares e ampliar o contato dos estudantes com a tecnologia.
            </p>
            <p className="mt-4 text-primary-foreground/85">
              Reaproveitar é também reduzir resíduos eletrônicos e prolongar o ciclo de uso daquilo
              que já foi produzido.
            </p>
          </div>
          <div className="flex justify-center">
            <div className="grid h-44 w-44 place-items-center rounded-full border-4 border-dashed border-white/25">
              <Recycle className="h-16 w-16 text-white/80" aria-hidden="true" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
          Uma iniciativa conectada aos Objetivos de Desenvolvimento Sustentável
        </h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {sdgs.map((sdg) => (
            <div key={sdg.number} className="rounded-xl border border-border bg-card p-6">
              <p className="font-display text-4xl font-bold text-secondary">{sdg.number}</p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                ODS {Number(sdg.number)}
              </p>
              <h3 className="mt-1 text-lg font-semibold text-foreground">{sdg.title}</h3>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-6 sm:px-6">
        <div className="surface-warm rounded-2xl border border-border p-8 text-center sm:p-12">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
            Tem um equipamento que pode ganhar uma nova utilidade?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Conheça as necessidades atuais da escola e registre sua intenção de doação.
          </p>
          <Button asChild size="lg" className="mt-6">
            <Link to="/doar">Quero doar</Link>
          </Button>
        </div>
      </section>
    </PublicLayout>
  );
}
