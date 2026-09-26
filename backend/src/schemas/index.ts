import { z } from "zod";

const category = z.enum(["Computadores", "Periféricos", "Audiovisual", "Rede", "Outros"]);
export const publicNeedFilterSchema = z.object({
  category: category.optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  status: z.enum(["active", "fulfilled"]).optional(),
  search: z.string().trim().max(120).optional(),
  sort: z.enum(["name", "priority", "recent"]).optional(),
});
const optionalText = z.string().trim().max(500).optional().or(z.literal(""));

export const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });
export const needSchema = z.object({
  name: z.string().trim().min(2).max(120),
  category,
  description: z.string().trim().min(1).max(3000),
  reason: z.string().trim().min(1).max(3000),
  requestedQuantity: z.coerce.number().int().positive(),
  receivedQuantity: z.coerce.number().int().nonnegative(),
  priority: z.enum(["low", "medium", "high"]),
  status: z.enum(["draft", "active", "fulfilled", "archived"]),
  recommendedConditions: z.array(z.string().trim().min(1)).default([]),
});
export const donationSchema = z.object({
  needId: z.string().optional(),
  donor: z
    .object({
      name: z.string().trim().min(3).max(120),
      type: z.enum(["individual", "company"]),
      companyName: optionalText,
      email: z.string().trim().email().max(254),
      phone: z.string().trim().min(8).max(40),
    })
    .superRefine((donor, ctx) => {
      if (donor.type === "company" && (donor.companyName ?? "").trim().length < 2) {
        ctx.addIssue({ code: "custom", path: ["companyName"], message: "Informe a organização." });
      }
    }),
  equipment: z.string().trim().min(2).max(160),
  category,
  quantity: z.coerce.number().int().positive(),
  brand: optionalText,
  model: optionalText,
  approximateYear: z.string().trim().max(10).optional(),
  condition: z.enum(["new", "very_good", "good", "needs_repair", "unknown"]),
  workingStatus: z.enum(["yes", "partially", "no", "unknown"]),
  notes: z.string().trim().max(3000).optional(),
  deliveryPreference: z.enum(["deliver", "pickup", "talk_first"]),
  contactPeriod: z.enum(["morning", "afternoon", "any"]),
});
export const statusSchema = z.object({
  status: z.enum(["reviewing", "awaiting_delivery"]),
});
export const approveSchema = z.object({
  acceptedQuantity: z.coerce.number().int().positive(),
  internalNotes: z.string().max(3000).optional(),
});
export const rejectSchema = z.object({
  rejectionReason: z.string().trim().min(3).max(500),
  internalNotes: z.string().max(3000).optional(),
});
export const completeSchema = z.object({
  receivedQuantity: z.coerce.number().int().positive(),
  internalNotes: z.string().max(3000).optional(),
});
export const notesSchema = z.object({ internalNotes: z.string().max(3000) });

export type NeedInput = z.infer<typeof needSchema>;
export type DonationInput = z.infer<typeof donationSchema>;
