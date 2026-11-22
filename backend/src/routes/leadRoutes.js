import { Router } from "express";
import validateLead from "../middleware/validateLead.js";
import { listLeads, getLead, createLead, updateLead, deleteLead } from "../controllers/leadController.js";

const router = Router();

router.get("/", listLeads);
router.get("/:id", getLead);
router.post("/", validateLead(), createLead);
router.put("/:id", validateLead({ isUpdate: true }), updateLead);
router.delete("/:id", deleteLead);

export default router;
