import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getPublicNeeds } from "@/services/needsService";
import { createDonation } from "@/services/donationsService";
import { saveLastDonation } from "@/lib/lastDonation";
import { conditionLabel, deliveryLabel, workingStatusLabel } from "@/lib/labels";
import { NEED_CATEGORIES } from "@/types";
import type { NeedCategory } from "@/types";

const schema = z
  .object({
    name: z.string().min(3, "Informe seu nome completo."),
    email: z.string().email("Informe um e-mail válido."),
    phone: z.string().min(8, "Informe um telefone ou WhatsApp válido."),
    donorType: z.enum(["individual", "company"]),
    companyName: z.string().optional(),
    needId: z.string(),
    equipment: z.string().min(2, "Informe o equipamento."),
    category: z.enum(["Computadores", "Periféricos", "Audiovisual", "Rede", "Outros"]),
    quantity: z.coerce.number().int().min(1, "Informe ao menos 1 item."),
    brand: z.string().optional(),
    model: z.string().optional(),
    approximateYear: z.string().optional(),
    condition: z.enum(["new", "very_good", "good", "needs_repair", "unknown"]),
    workingStatus: z.enum(["yes", "partially", "no", "unknown"]),
    notes: z.string().optional(),
    deliveryPreference: z.enum(["deliver", "pickup", "talk_first"]),
    contactPeriod: z.enum(["morning", "afternoon", "any"]),
    confirmTruth: z.literal(true, {
      errorMap: () => ({ message: "É necessário confirmar as informações." }),
    }),
    acknowledgeAnalysis: z.boolean(),
  })
  .refine((data) => data.donorType !== "company" || (data.companyName ?? "").trim().length > 1, {
    path: ["companyName"],
    message: "Informe o nome da empresa ou organização.",
  });

type FormValues = z.infer<typeof schema>;

export const Route = createFileRoute("/doar")({
  validateSearch: (search: Record<string, unknown>): { need?: string } =>
    typeof search["need"] === "string" ? { need: search["need"] } : {},
  head: () => ({
    meta: [
      { title: "Quero doar | ReConecta TI" },
      {
        name: "description",
        content:
          "Registre sua intenção de doação de equipamentos de tecnologia para a Escola Municipal Francisco Costa.",
      },
      { property: "og:title", content: "Quero doar | ReConecta TI" },
      {
        property: "og:description",
        content: "Preencha o formulário e a escola analisará sua intenção de doação.",
      },
    ],
  }),
  component: DonatePage,
});

const stepFields: Record<number, (keyof FormValues)[]> = {
  1: ["name", "email", "phone", "donorType", "companyName"],
  2: ["equipment", "category", "quantity", "condition", "workingStatus"],
  3: ["deliveryPreference", "contactPeriod", "confirmTruth"],
};

function DonatePage() {
  const { need: needParam } = Route.useSearch();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const needs = useQuery({ queryKey: ["public-needs"], queryFn: getPublicNeeds });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      donorType: "individual",
      companyName: "",
      needId: needParam ?? "none",
      equipment: "",
      category: "Computadores",
      quantity: 1,
      brand: "",
      model: "",
      approximateYear: "",
      condition: "good",
      workingStatus: "yes",
      notes: "",
      deliveryPreference: "deliver",
      contactPeriod: "any",
      confirmTruth: false as unknown as true,
      acknowledgeAnalysis: false,
    },
  });

  const values = form.watch();
  const selectedNeed = (needs.data ?? []).find((item) => item.id === values.needId);

  if (needParam && values.needId === needParam && !values.equipment && selectedNeed) {
    form.setValue("equipment", selectedNeed.name);
    form.setValue("category", selectedNeed.category);
  }

  async function goNext() {
    const valid = await form.trigger(stepFields[step]);
    if (!valid) return;
    setStep((current) => Math.min(4, current + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goBack() {
    setStep((current) => Math.max(1, current - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function onSubmit(data: FormValues) {
    setSubmitting(true);
    try {
      const donation = await createDonation({
        ...(data.needId !== "none" ? { needId: data.needId } : {}),
        donor: {
          name: data.name,
          type: data.donorType,
          ...(data.donorType === "company" && data.companyName
            ? { companyName: data.companyName }
            : {}),
          email: data.email,
          phone: data.phone,
        },
        equipment: data.equipment,
        category: data.category as NeedCategory,
        quantity: data.quantity,
        brand: data.brand,
        model: data.model,
        approximateYear: data.approximateYear,
        condition: data.condition,
        workingStatus: data.workingStatus,
        notes: data.notes,
        deliveryPreference: data.deliveryPreference,
        contactPeriod: data.contactPeriod,
      });
      saveLastDonation(donation);
      toast.success("Intenção de doação registrada.");
      navigate({ to: "/doacao/enviada" });
    } catch {
      toast.error("Não foi possível enviar sua intenção. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  const steps = ["Sobre você", "Sobre a doação", "Entrega e contato", "Resumo"];

  return (
    <PublicLayout>
      <div className="surface-warm border-b border-border">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <PageHeader
            eyebrow="Intenção de doação"
            title="Transforme um equipamento parado em oportunidade"
            description="Preencha os dados abaixo para registrar sua intenção de doação. A escola analisará as informações antes da confirmação."
          />
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <ol className="mb-8 grid grid-cols-4 gap-2" aria-label="Etapas do formulário">
          {steps.map((label, index) => {
            const number = index + 1;
            const done = step > number;
            const active = step === number;
            return (
              <li key={label} className="flex flex-col gap-2">
                <div
                  className={`h-1.5 rounded-full ${done || active ? "bg-secondary" : "bg-muted"}`}
                />
                <span
                  className={`text-xs ${active ? "font-semibold text-foreground" : "text-muted-foreground"}`}
                  aria-current={active ? "step" : undefined}
                >
                  {done ? <Check className="mr-1 inline h-3 w-3" aria-hidden="true" /> : null}
                  {label}
                </span>
              </li>
            );
          })}
        </ol>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="rounded-xl border border-border bg-card p-6 sm:p-8"
          noValidate
        >
          {step === 1 ? (
            <fieldset className="space-y-5">
              <legend className="text-lg font-semibold text-foreground">Sobre você</legend>

              <Field id="name" label="Nome completo *" error={form.formState.errors.name?.message}>
                <Input id="name" autoComplete="name" {...form.register("name")} />
              </Field>

              <Field id="email" label="E-mail *" error={form.formState.errors.email?.message}>
                <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
              </Field>

              <Field
                id="phone"
                label="Telefone / WhatsApp *"
                error={form.formState.errors.phone?.message}
              >
                <Input id="phone" autoComplete="tel" {...form.register("phone")} />
              </Field>

              <div>
                <span className="text-sm font-medium text-foreground">Tipo de doador *</span>
                <RadioGroup
                  className="mt-2 grid gap-2 sm:grid-cols-2"
                  value={values.donorType}
                  onValueChange={(value) =>
                    form.setValue("donorType", value as FormValues["donorType"])
                  }
                >
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 text-sm">
                    <RadioGroupItem value="individual" id="donor-individual" />
                    Pessoa física
                  </label>
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 text-sm">
                    <RadioGroupItem value="company" id="donor-company" />
                    Empresa / organização
                  </label>
                </RadioGroup>
              </div>

              {values.donorType === "company" ? (
                <Field
                  id="companyName"
                  label="Nome da empresa *"
                  error={form.formState.errors.companyName?.message}
                >
                  <Input id="companyName" {...form.register("companyName")} />
                </Field>
              ) : null}
            </fieldset>
          ) : null}

          {step === 2 ? (
            <fieldset className="space-y-5">
              <legend className="text-lg font-semibold text-foreground">Sobre a doação</legend>

              <div>
                <Label htmlFor="needId">Você está respondendo a uma necessidade cadastrada?</Label>
                <Select
                  value={values.needId}
                  onValueChange={(value) => form.setValue("needId", value)}
                >
                  <SelectTrigger id="needId" className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Não, é uma doação espontânea</SelectItem>
                    {(needs.data ?? [])
                      .filter((need) => need.status === "active")
                      .map((need) => (
                        <SelectItem key={need.id} value={need.id}>
                          {need.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <Field
                id="equipment"
                label="Equipamento *"
                error={form.formState.errors.equipment?.message}
              >
                <Input id="equipment" {...form.register("equipment")} />
              </Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <Label htmlFor="category">Categoria *</Label>
                  <Select
                    value={values.category}
                    onValueChange={(value) =>
                      form.setValue("category", value as FormValues["category"])
                    }
                  >
                    <SelectTrigger id="category" className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {NEED_CATEGORIES.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Field
                  id="quantity"
                  label="Quantidade *"
                  error={form.formState.errors.quantity?.message}
                >
                  <Input id="quantity" type="number" min={1} {...form.register("quantity")} />
                </Field>
              </div>

              <div className="grid gap-5 sm:grid-cols-3">
                <Field id="brand" label="Marca">
                  <Input id="brand" {...form.register("brand")} />
                </Field>
                <Field id="model" label="Modelo">
                  <Input id="model" {...form.register("model")} />
                </Field>
                <Field id="approximateYear" label="Ano aproximado">
                  <Input id="approximateYear" {...form.register("approximateYear")} />
                </Field>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <Label htmlFor="condition">Estado de conservação *</Label>
                  <Select
                    value={values.condition}
                    onValueChange={(value) =>
                      form.setValue("condition", value as FormValues["condition"])
                    }
                  >
                    <SelectTrigger id="condition" className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(["new", "very_good", "good", "needs_repair", "unknown"] as const).map(
                        (value) => (
                          <SelectItem key={value} value={value}>
                            {conditionLabel(value)}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="workingStatus">O equipamento funciona atualmente? *</Label>
                  <Select
                    value={values.workingStatus}
                    onValueChange={(value) =>
                      form.setValue("workingStatus", value as FormValues["workingStatus"])
                    }
                  >
                    <SelectTrigger id="workingStatus" className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(["yes", "partially", "no", "unknown"] as const).map((value) => (
                        <SelectItem key={value} value={value}>
                          {workingStatusLabel(value)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Field id="notes" label="Descrição / observações">
                <Textarea id="notes" rows={4} {...form.register("notes")} />
              </Field>
            </fieldset>
          ) : null}

          {step === 3 ? (
            <fieldset className="space-y-6">
              <legend className="text-lg font-semibold text-foreground">Entrega e contato</legend>

              <div>
                <span className="text-sm font-medium text-foreground">
                  Como prefere combinar a entrega? *
                </span>
                <RadioGroup
                  className="mt-2 grid gap-2"
                  value={values.deliveryPreference}
                  onValueChange={(value) =>
                    form.setValue("deliveryPreference", value as FormValues["deliveryPreference"])
                  }
                >
                  {(["deliver", "pickup", "talk_first"] as const).map((value) => (
                    <label
                      key={value}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 text-sm"
                    >
                      <RadioGroupItem value={value} id={`delivery-${value}`} />
                      {deliveryLabel(value)}
                    </label>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <span className="text-sm font-medium text-foreground">
                  Melhor período para contato *
                </span>
                <RadioGroup
                  className="mt-2 grid gap-2 sm:grid-cols-3"
                  value={values.contactPeriod}
                  onValueChange={(value) =>
                    form.setValue("contactPeriod", value as FormValues["contactPeriod"])
                  }
                >
                  {(
                    [
                      ["morning", "Manhã"],
                      ["afternoon", "Tarde"],
                      ["any", "Indiferente"],
                    ] as const
                  ).map(([value, label]) => (
                    <label
                      key={value}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 text-sm"
                    >
                      <RadioGroupItem value={value} id={`period-${value}`} />
                      {label}
                    </label>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <label className="flex items-start gap-3 text-sm text-foreground">
                  <Checkbox
                    id="confirmTruth"
                    checked={Boolean(values.confirmTruth)}
                    onCheckedChange={(checked) =>
                      form.setValue("confirmTruth", Boolean(checked) as true, {
                        shouldValidate: true,
                      })
                    }
                  />
                  <span>
                    Confirmo que as informações fornecidas são verdadeiras e autorizo o contato da
                    instituição sobre esta intenção de doação. *
                  </span>
                </label>
                {form.formState.errors.confirmTruth ? (
                  <p role="alert" className="text-sm text-destructive">
                    {form.formState.errors.confirmTruth.message}
                  </p>
                ) : null}

                <label className="flex items-start gap-3 text-sm text-foreground">
                  <Checkbox
                    id="acknowledgeAnalysis"
                    checked={values.acknowledgeAnalysis}
                    onCheckedChange={(checked) =>
                      form.setValue("acknowledgeAnalysis", Boolean(checked))
                    }
                  />
                  <span>
                    Estou ciente de que o preenchimento deste formulário não significa aceitação
                    automática da doação.
                  </span>
                </label>
              </div>
            </fieldset>
          ) : null}

          {step === 4 ? (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-foreground">Resumo da sua intenção</h2>
              <dl className="grid gap-3 rounded-lg border border-border bg-muted p-5 text-sm sm:grid-cols-2">
                <Summary label="Nome" value={values.name} />
                <Summary
                  label="Tipo"
                  value={values.donorType === "company" ? "Empresa / organização" : "Pessoa física"}
                />
                {values.donorType === "company" ? (
                  <Summary label="Empresa" value={values.companyName ?? "—"} />
                ) : null}
                <Summary label="E-mail" value={values.email} />
                <Summary label="Telefone" value={values.phone} />
                <Summary label="Equipamento" value={values.equipment} />
                <Summary label="Categoria" value={values.category} />
                <Summary label="Quantidade" value={String(values.quantity)} />
                <Summary label="Estado" value={conditionLabel(values.condition)} />
                <Summary label="Funcionamento" value={workingStatusLabel(values.workingStatus)} />
                <Summary label="Entrega" value={deliveryLabel(values.deliveryPreference)} />
                <Summary
                  label="Necessidade relacionada"
                  value={selectedNeed?.name ?? "Doação espontânea"}
                />
              </dl>
              <p className="text-sm text-muted-foreground">
                Ao enviar, sua intenção ficará registrada com status “Aguardando análise”.
              </p>
            </div>
          ) : null}

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={goBack}
              disabled={step === 1}
              className="sm:w-auto"
            >
              <ChevronLeft className="mr-1 h-4 w-4" aria-hidden="true" />
              Voltar
            </Button>

            {step < 4 ? (
              <Button type="button" onClick={goNext}>
                Continuar
                <ChevronRight className="ml-1 h-4 w-4" aria-hidden="true" />
              </Button>
            ) : (
              <Button type="submit" disabled={submitting}>
                {submitting ? "Enviando…" : "Enviar intenção de doação"}
              </Button>
            )}
          </div>
        </form>
      </div>
    </PublicLayout>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="mt-1.5">{children}</div>
      {error ? (
        <p role="alert" className="mt-1.5 text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">{value || "—"}</dd>
    </div>
  );
}
