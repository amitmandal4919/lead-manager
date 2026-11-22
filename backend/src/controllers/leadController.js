import * as Lead from "../models/leadModel.js";
import { STATUSES } from "../config/constants.js";

function parseId(raw) {
  return /^\d+$/.test(String(raw)) && Number.isSafeInteger(Number(raw)) && Number(raw) > 0 ? Number(raw) : null;
}

const invalidId = (res) => res.status(400).json({ success: false, message: "Invalid lead id. It must be a positive number." });
const notFound = (res) => res.status(404).json({ success: false, message: "Lead not found" });

// GET /api/leads?search=&status=&page=1&limit=10
export function listLeads(req, res) {
  const search = String(req.query.search ?? "").trim().slice(0, 100);
  const status = String(req.query.status ?? "").trim();

  if (status && !STATUSES.includes(status)) {
    return res.status(400).json({ success: false, message: `Invalid status filter. Use one of: ${STATUSES.join(", ")}` });
  }

  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 10));

  const { rows, total } = Lead.findAll({ search, status, page, limit });
  res.json({
    success: true,
    data: rows,
    pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  });
}

// GET /api/leads/:id
export function getLead(req, res) {
  const id = parseId(req.params.id);
  if (!id) return invalidId(res);
  const lead = Lead.findById(id);
  if (!lead) return notFound(res);
  res.json({ success: true, data: lead });
}

// POST /api/leads  (body already validated by middleware)
export function createLead(req, res) {
  const lead = Lead.create(req.validatedLead);
  res.status(201).json({ success: true, message: "Lead created successfully", data: lead });
}

// PUT /api/leads/:id
export function updateLead(req, res) {
  const id = parseId(req.params.id);
  if (!id) return invalidId(res);
  const lead = Lead.update(id, req.validatedLead);
  if (!lead) return notFound(res);
  res.json({ success: true, message: "Lead updated successfully", data: lead });
}

// DELETE /api/leads/:id
export function deleteLead(req, res) {
  const id = parseId(req.params.id);
  if (!id) return invalidId(res);
  if (!Lead.remove(id)) return notFound(res);
  res.json({ success: true, message: "Lead deleted successfully" });
}
