import { Pencil, Trash2, Inbox, SearchX, AlertCircle, UserPlus } from "lucide-react";
import StatusBadge from "./StatusBadge.jsx";
import { formatDate, getInitials } from "../utils/format.js";

export default function LeadsTable({ leads, loading, error, hasFilters, onEdit, onDelete, onAdd, onClearFilters, onRetry }) {
  if (error) {
    return (
      <div className="state-box">
        <div className="state-icon state-icon-error"><AlertCircle size={24} /></div>
        <strong>Could not load leads</strong>
        <span>{error}</span>
        <button className="btn btn-outline" onClick={onRetry}>Try again</button>
      </div>
    );
  }

  if (loading && leads.length === 0) {
    return (
      <div className="state-box" role="status">
        <div className="spinner" aria-hidden="true" />
        <strong>Loading leads...</strong>
      </div>
    );
  }

  if (leads.length === 0) {
    return hasFilters ? (
      <div className="state-box">
        <div className="state-icon"><SearchX size={24} /></div>
        <strong>No matching leads</strong>
        <span>Try a different name or status filter.</span>
        <button className="btn btn-outline" onClick={onClearFilters}>Clear filters</button>
      </div>
    ) : (
      <div className="state-box">
        <div className="state-icon"><Inbox size={24} /></div>
        <strong>No leads yet</strong>
        <span>Add your first lead to start tracking your pipeline.</span>
        <button className="btn btn-primary" onClick={onAdd}><UserPlus size={16} /> Add Lead</button>
      </div>
    );
  }

  return (
    <div className={`table-wrap ${loading ? "is-loading" : ""}`}>
      <table className="leads-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Company</th>
            <th>Source</th>
            <th>Status</th>
            <th>Created Date</th>
            <th className="col-actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id}>
              <td data-label="Name">
                <div className="name-cell">
                  <span className="avatar avatar-sm">{getInitials(lead.name)}</span>
                  <strong>{lead.name}</strong>
                </div>
              </td>
              <td data-label="Email">{lead.email}</td>
              <td data-label="Phone">{lead.phone}</td>
              <td data-label="Company">{lead.company}</td>
              <td data-label="Source">{lead.source}</td>
              <td data-label="Status"><StatusBadge status={lead.status} /></td>
              <td data-label="Created">{formatDate(lead.created_at)}</td>
              <td data-label="Actions" className="col-actions">
                <div className="row-actions">
                  <button className="icon-btn" title="Edit lead" aria-label={`Edit ${lead.name}`} onClick={() => onEdit(lead)}>
                    <Pencil size={16} />
                  </button>
                  <button className="icon-btn icon-btn-danger" title="Delete lead" aria-label={`Delete ${lead.name}`} onClick={() => onDelete(lead)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
