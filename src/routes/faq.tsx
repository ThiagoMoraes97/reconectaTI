import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { PageHeader } from "@/components/common/PageHeader";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Perguntas frequentes | ReConecta TI" },
      {
        name: "description",
        content:
          "Dúvidas comuns sobre doação de equipamentos de tecnologia para a Escola Municipal Francisco Costa.",
      },
      { property: "og:title", content: "Perguntas frequentes | ReConecta TI" },
      {
        property: "og:description",
        content: "Quem pode doar, o que pode ser doado e como funciona a análise da escola.",
      },
    ],
  }),
  component: FaqPage,
});

const faq = [
  {
    q: "O que é o ReConecta TI?",
    a: "É uma plataforma que reúne as necessidades de equipamentos de tecnologia da Escola Municipal Francisco Costa e permite que pessoas e organizações registrem intenções de doação.",
  },
  {
    q: "Quem pode doar?",
    a: "Qualquer pessoa física ou empresa que possua equipamentos de informática disponíveis e queira destiná-los ao uso educacional.",
  },
  {
    q: "Quais equipamentos podem ser doados?",
    a: "Computadores, notebooks, monitores, teclados, mouses, impressoras, projetores, headsets, roteadores, cabos e periféricos em geral.",
  },
  {
    q: "O equipamento precisa ser novo?",
    a: "Não. O equipamento pode ser usado, desde que esteja funcional ou possa ser recuperado com manutenção simples.",
  },
  {
    q: "Posso doar um equipamento que precisa de reparo?",
    a: "Sim, mas informe essa condição no formulário. A escola avaliará se consegue realizar o reparo antes de confirmar o recebimento.",
  },
  {
    q: "O preenchimento do formulário garante que a escola aceitará o equipamento?",
    a: "Não. O formulário registra uma intenção de doação. A equipe da escola faz uma análise antes de aprovar ou recusar.",
  },
  {
    q: "Como a entrega é realizada?",
    a: "A entrega é combinada diretamente com a escola após a aprovação. No formulário você indica se prefere levar o item, combinar retirada ou conversar antes.",
  },
  {
    q: "Posso doar mais de um equipamento?",
    a: "Sim. Informe a quantidade no formulário ou registre intenções separadas para equipamentos diferentes.",
  },
  {
    q: "Como acompanho minha intenção de doação?",
    a: "Ao enviar o formulário você recebe um número de protocolo. Use-o na página Acompanhar doação para ver o andamento.",
  },
  {
    q: "Posso cancelar uma intenção de doação?",
    a: "Sim. Basta informar à escola no contato realizado durante a análise que você não deseja seguir com a doação.",
  },
  {
    q: "A plataforma realiza pagamentos?",
    a: "Não. Não existe compra, venda, pagamento ou cobrança de qualquer natureza.",
  },
  {
    q: "A escola vende os equipamentos recebidos?",
    a: "Não. Os equipamentos recebidos são destinados ao uso pedagógico e administrativo da instituição.",
  },
];

function FaqPage() {
  return (
    <PublicLayout>
      <div className="surface-warm border-b border-border">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <PageHeader
            eyebrow="FAQ"
            title="Perguntas frequentes"
            description="Reunimos as dúvidas mais comuns sobre o funcionamento das doações."
          />
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <Accordion type="single" collapsible className="w-full">
          {faq.map((item, index) => (
            <AccordionItem key={item.q} value={`item-${index}`}>
              <AccordionTrigger className="text-left text-base font-medium">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-12 rounded-xl border border-border bg-card p-8 text-center">
          <h2 className="text-xl font-semibold text-foreground">Pronto para ajudar?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Veja as necessidades atuais ou registre sua intenção de doação agora.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild>
              <Link to="/doar">Quero doar</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/necessidades">Ver necessidades</Link>
            </Button>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
