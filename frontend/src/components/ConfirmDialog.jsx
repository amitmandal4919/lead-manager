import { useEffect } from "react";
import { Trash2, Loader2 } from "lucide-react";

export default function ConfirmDialog({ lead, busy, onCancel, onConfirm }) {
  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === "Escape" && !busy) onCancel();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onCancel, busy]);

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && !busy && onCancel()}>
      <section className="modal modal-small" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title">
        <div className="confirm-icon"><Trash2 size={22} /></div>
        <h2 id="confirm-title">Delete this lead?</h2>
        <p>
          <strong>{lead.name}</strong> ({lead.company}) will be permanently deleted. This action cannot be undone.
        </p>
        <div className="modal-actions modal-actions-center">
          <button className="btn btn-light" onClick={onCancel} disabled={busy}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={busy}>
            {busy && <Loader2 size={16} className="spin" />}
            {busy ? "Deleting..." : "Yes, delete"}
          </button>
        </div>
      </section>
    </div>
  );
}
