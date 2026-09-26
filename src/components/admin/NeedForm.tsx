import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NEED_CATEGORIES } from "@/types";
import type { NeedInput } from "@/types";

const schema = z.object({
  name: z.string().min(3, "Informe o nome do equipamento."),
  category: z.enum(["Computadores", "Periféricos", "Audiovisual", "Rede", "Outros"]),
  description: z.string().min(10, "Descreva a necessidade com pelo menos 10 caracteres."),
  reason: z.string().min(10, "Explique por que o equipamento é necessário."),
  requestedQuantity: z.coerce.number().int().min(1, "A quantidade deve ser no mínimo 1."),
  receivedQuantity: z.coerce.number().int().min(0, "Valor inválido."),
  priority: z.enum(["low", "medium", "high"]),
  status: z.enum(["draft", "active", "fulfilled", "archived"]),
  recommendedConditions: z.string().optional(),
});

export type NeedFormValues = z.infer<typeof schema>;

interface NeedFormProps {
  defaultValues?: Partial<NeedFormValues>;
  submitLabel: string;
  submitting?: boolean;
  onSubmit: (values: NeedInput) => void;
  footer?: React.ReactNode;
}

export function NeedForm({
  defaultValues,
  submitLabel,
  submitting,
  onSubmit,
  footer,
}: NeedFormProps) {
  const form = useForm<NeedFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      category: "Computadores",
      description: "",
      reason: "",
      requestedQuantity: 1,
      receivedQuantity: 0,
      priority: "medium",
      status: "active",
      recommendedConditions: "",
      ...defaultValues,
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = form;

  function submit(values: NeedFormValues) {
    onSubmit({
      name: values.name,
      category: values.category,
      description: values.description,
      reason: values.reason,
      requestedQuantity: values.requestedQuantity,
      receivedQuantity: values.receivedQuantity,
      priority: values.priority,
      status: values.status,
      recommendedConditions: (values.recommendedConditions ?? "")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
    });
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-6" noValidate>
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="name">Nome do equipamento</Label>
            <Input id="name" className="mt-1.5" {...register("name")} />
            {errors.name ? (
              <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>
            ) : null}
          </div>

          <div>
            <Label htmlFor="category">Categoria</Label>
            <Select
              value={watch("category")}
              onValueChange={(value) =>
                setValue("category", value as NeedFormValues["category"], {
                  shouldValidate: true,
                })
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

          <div>
            <Label htmlFor="priority">Prioridade</Label>
            <Select
              value={watch("priority")}
              onValueChange={(value) =>
                setValue("priority", value as NeedFormValues["priority"], {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger id="priority" className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="low">Baixa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="requestedQuantity">Quantidade solicitada</Label>
            <Input
              id="requestedQuantity"
              type="number"
              min={1}
              className="mt-1.5"
              {...register("requestedQuantity")}
            />
            {errors.requestedQuantity ? (
              <p className="mt-1 text-sm text-destructive">{errors.requestedQuantity.message}</p>
            ) : null}
          </div>

          <div>
            <Label htmlFor="receivedQuantity">Quantidade já recebida</Label>
            <Input
              id="receivedQuantity"
              type="number"
              min={0}
              className="mt-1.5"
              {...register("receivedQuantity")}
            />
            {errors.receivedQuantity ? (
              <p className="mt-1 text-sm text-destructive">{errors.receivedQuantity.message}</p>
            ) : null}
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" rows={3} className="mt-1.5" {...register("description")} />
            {errors.description ? (
              <p className="mt-1 text-sm text-destructive">{errors.description.message}</p>
            ) : null}
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="reason">Por que este equipamento é necessário?</Label>
            <Textarea id="reason" rows={3} className="mt-1.5" {...register("reason")} />
            {errors.reason ? (
              <p className="mt-1 text-sm text-destructive">{errors.reason.message}</p>
            ) : null}
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="recommendedConditions">Condições recomendadas</Label>
            <Textarea
              id="recommendedConditions"
              rows={4}
              className="mt-1.5"
              placeholder={"Uma condição por linha"}
              {...register("recommendedConditions")}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Escreva uma condição por linha. Elas aparecem na página pública da necessidade.
            </p>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={watch("status")}
              onValueChange={(value) =>
                setValue("status", value as NeedFormValues["status"], { shouldValidate: true })
              }
            >
              <SelectTrigger id="status" className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="active">Ativa</SelectItem>
                <SelectItem value="fulfilled">Atendida</SelectItem>
                <SelectItem value="archived">Arquivada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Salvando…" : submitLabel}
        </Button>
        {footer}
      </div>
    </form>
  );
}
