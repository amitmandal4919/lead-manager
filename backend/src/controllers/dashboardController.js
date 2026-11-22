import * as Lead from "../models/leadModel.js";

// GET /api/dashboard/stats
export function getStats(req, res) {
  const data = { total: 0, new: 0, contacted: 0, qualified: 0, lost: 0 };
  for (const { status, count } of Lead.countByStatus()) {
    data[status.toLowerCase()] = count;
    data.total += count;
  }
  res.json({ success: true, data });
}
