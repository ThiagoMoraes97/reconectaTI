import { Router } from "express";
import rateLimit from "express-rate-limit";
import { requireAdmin } from "../middlewares/auth.js";
import {
  approveSchema,
  completeSchema,
  donationSchema,
  loginSchema,
  needSchema,
  notesSchema,
  rejectSchema,
  statusSchema,
} from "../schemas/index.js";
import * as c from "../controllers/index.js";

const validateBody =
  (schema: { parse: (data: unknown) => unknown }) =>
  (
    req: import("express").Request,
    _res: import("express").Response,
    next: import("express").NextFunction,
  ) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
const limitPublic = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});
export const router = Router();
const auth = Router();
auth.post(
  "/login",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  }),
  validateBody(loginSchema),
  c.login,
);
auth.get("/me", requireAdmin, c.me);
router.use("/auth", auth);
router.get("/health", c.health);
router.get("/metrics", c.publicMetrics);
router.get("/needs", c.publicNeeds);
router.get("/needs/:id", c.getNeed);
router.post("/donations", limitPublic, validateBody(donationSchema), c.createDonation);
router.get("/donations/protocol/:protocol", limitPublic, c.publicDonation);

const admin = Router();
admin.use(requireAdmin);
admin.get("/needs", c.adminNeeds);
admin.post("/needs", validateBody(needSchema), c.createNeed);
admin.get("/needs/:id", c.getNeed);
admin.put("/needs/:id", validateBody(needSchema), c.updateNeed);
admin.patch("/needs/:id", validateBody(needSchema), c.updateNeed);
admin.post("/needs/:id/archive", c.archiveNeed);
admin.get("/donations", c.adminDonations);
admin.get("/donations/:id", c.getDonation);
admin.patch("/donations/:id/status", validateBody(statusSchema), c.statusDonation);
admin.post("/donations/:id/approve", validateBody(approveSchema), c.approveDonation);
admin.post("/donations/:id/reject", validateBody(rejectSchema), c.rejectDonation);
admin.post("/donations/:id/complete", validateBody(completeSchema), c.completeDonation);
admin.patch("/donations/:id/notes", validateBody(notesSchema), c.saveDonationNotes);
admin.get("/dashboard", c.dashboard);
admin.get("/reports", c.reports);
router.use("/admin", admin);
