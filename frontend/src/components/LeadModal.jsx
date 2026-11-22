import { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { EMPTY_FORM, SOURCES, STATUSES } from "../utils/constants.js";
import { validateLeadForm } from "../utils/validation.js";

// `lead` is null when adding a new lead, or the lead object when editing.
export default function LeadModal({ lead, onClose, onSave }) {
  const isEdit = Boolean(lead);
  const [form, setForm] = useState(
    lead
      ? { name: lead.name, email: lead.email, phone: lead.phone, company: lead.company, source: lead.source, status: lead.status }
      : EMPTY_FORM
  );
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === "Escape" && !saving) onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose, saving]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
    setFormError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validationErrors = validateLeadForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return; // prevents empty / invalid submission
    }

    setSaving(true);
    setFormError("");
    try {
      await onSave({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        company: form.company.trim(),
        source: form.source,
        status: form.status,
      });
    } catch (error) {
      setErrors(error.errors || {});
      setFormError(error.message);
      setSaving(false);
    }
  }

  const field = (name) => ({
    id: `lead-${name}`,
    name,
    value: form[name],
    onChange: handleChange,
    "aria-invalid": Boolean(errors[name]),
    className: errors[name] ? "input-error" : "",
  });

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && !saving && onClose()}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="lead-modal-title">
        <div className="modal-head">
          <div>
            <h2 id="lead-modal-title">{isEdit ? "Edit lead" : "Add new lead"}</h2>
            <p>{isEdit ? "Update the details or change the lead status." : "Enter the contact details of the new lead."}</p>
          </div>
          <button className="icon-btn" onClick={onClose} disabled={saving} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="lead-form">
          {formError && !Object.values(errors).some(Boolean) && <div className="form-alert">{formError}</div>}

          <div className="form-row">
            <label htmlFor="lead-name">Full Name *</label>
            <input {...field("name")} type="text" placeholder="e.g. Aditi Sharma" autoFocus />
            {errors.name && <small className="field-error">{errors.name}</small>}
          </div>

          <div className="form-grid">
            <div className="form-row">
              <label htmlFor="lead-email">Email *</label>
              <input {...field("email")} type="email" placeholder="aditi@company.com" />
              {errors.email && <small className="field-error">{errors.email}</small>}
            </div>
            <div className="form-row">
              <label htmlFor="lead-phone">Phone Number *</label>
              <input {...field("phone")} type="tel" placeholder="+91 98765 43210" />
              {errors.phone && <small className="field-error">{errors.phone}</small>}
            </div>
          </div>

          <div className="form-row">
            <label htmlFor="lead-company">Company Name *</label>
            <input {...field("company")} type="text" placeholder="e.g. Acme Solutions" />
            {errors.company && <small className="field-error">{errors.company}</small>}
          </div>

          <div className="form-grid">
            <div className="form-row">
              <label htmlFor="lead-source">Source *</label>
              <select {...field("source")}>
                {SOURCES.map((source) => (
                  <option key={source} value={source}>{source}</option>
                ))}
              </select>
              {errors.source && <small className="field-error">{errors.source}</small>}
            </div>
            <div className="form-row">
              <label htmlFor="lead-status">Status *</label>
              <select {...field("status")}>
                {STATUSES.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              {errors.status && <small className="field-error">{errors.status}</small>}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-light" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving && <Loader2 size={16} className="spin" />}
              {saving ? "Saving..." : isEdit ? "Save Changes" : "Save Lead"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
