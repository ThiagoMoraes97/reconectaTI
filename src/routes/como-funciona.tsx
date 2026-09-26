import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Cpu, Keyboard, Projector, Router, Wrench } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/como-funciona")({
  head: () => ({
    meta: [
      { title: "Como funciona | ReConecta TI" },
      {
        name: "description",
        content:
          "Entenda o caminho entre a intenção de doação e a chegada do equipamento à Escola Municipal Francisco Costa.",
      },
      { property: "og:title", content: "Como funciona | ReConecta TI" },
      {
        property: "og:description",
        content: "Passo a passo para doadores e para a escola dentro da plataforma.",
      },
    ],
  }),
  component: HowItWorksPage,
});

const donorSteps = [
  "Consulte as necessidades",
  "Escolha um equipamento",
  "Preencha o formulário",
  "Aguarde a análise",
  "Combine a entrega",
];

const schoolSteps = [
  "Identifica uma necessidade",
  "Publica na plataforma",
  "Recebe intenções",
  "Avalia os equipamentos",
  "Aprova ou recusa",
  "Atualiza a necessidade",
];

const categories = [
  { icon: Cpu, title: "Computadores", text: "Desktops e notebooks completos ou funcionais." },
  {
    icon: Keyboard,
    title: "Periféricos",
    text: "Monitores, teclados, mouses, headsets e acessórios.",
  },
  { icon: Projector, title: "Audiovisual", text: "Projetores, caixas de som e câmeras." },
  { icon: Router, title: "Rede", text: "Roteadores, switches e cabos de rede." },
  { icon: Wrench, title: "Outros", text: "Impressoras, estabilizadores, cabos e adaptadores." },
];

const checklist = [
  "Remova arquivos e dados pessoais",
  "Informe corretamente o estado do equipamento",
  "Inclua acessórios quando disponíveis",
  "Não descarte materiais perigosos junto aos equipamentos",
  "Aguarde a confirmação antes de realizar a entrega",
];

function StepList({ title, steps }: { title: string; steps: string[] }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <ol className="mt-5 space-y-3">
        {steps.map((step, index) => (
          <li key={step} className="flex items-start gap-3">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-primary/8 text-xs font-bold text-primary">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="pt-1 text-sm text-foreground">{step}</span>
            {index < steps.length - 1 ? (
              <ArrowRight
                className="ml-auto mt-1.5 hidden h-4 w-4 text-muted-foreground sm:block"
                aria-hidden="true"
              />
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}

function HowItWorksPage() {
  return (
    <PublicLayout>
      <div className="surface-warm border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <PageHeader
            eyebrow="Processo"
            title="Do equipamento parado ao impacto real."
            description="A plataforma organiza o caminho entre quem tem um equipamento disponível e a escola que precisa dele."
          />
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <StepList title="Para quem deseja doar" steps={donorSteps} />
          <StepList title="Para a escola" steps={schoolSteps} />
        </div>

        <section className="mt-14">
          <h2 className="text-2xl font-bold text-foreground">O que pode ser doado?</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <div key={category.title} className="rounded-xl border border-border bg-card p-6">
                <span className="grid h-11 w-11 place-items-center rounded-lg bg-secondary/10 text-secondary">
                  <category.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-base font-semibold text-foreground">{category.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{category.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14 rounded-xl border border-border bg-card p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-foreground">Antes de doar</h2>
          <ul className="mt-5 space-y-3">
            {checklist.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                <span
                  className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-secondary"
                  aria-hidden="true"
                />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-12 text-center">
          <Button asChild size="lg">
            <Link to="/necessidades">Ver necessidades da escola</Link>
          </Button>
        </div>
      </div>
    </PublicLayout>
  );
}
