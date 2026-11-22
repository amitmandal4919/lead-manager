import { useState } from "react";
import { LayoutDashboard, Users, UserPlus, X } from "lucide-react";

export default function Sidebar({ open, total, onClose, onAddLead }) {
  const [active, setActive] = useState("dashboard");

  function goTo(sectionId) {
    setActive(sectionId);
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    onClose();
  }

  return (
    <>
      {open && <div className="sidebar-overlay" onClick={onClose} aria-hidden="true" />}
      <aside className={`sidebar ${open ? "sidebar-open" : ""}`} aria-label="Main navigation">
        <div className="sidebar-top">
          <div className="brand">
            <span className="brand-mark">L</span>
            <span className="brand-name">LeadFlow</span>
          </div>
          <button className="icon-btn sidebar-close" onClick={onClose} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <p className="nav-label">Workspace</p>
        <nav className="nav">
          <button className={`nav-item ${active === "dashboard" ? "active" : ""}`} onClick={() => goTo("dashboard")}>
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button className={`nav-item ${active === "leads" ? "active" : ""}`} onClick={() => goTo("leads")}>
            <Users size={18} /> Leads <span className="nav-count">{total}</span>
          </button>
          <button
            className="nav-item"
            onClick={() => {
              onClose();
              onAddLead();
            }}
          >
            <UserPlus size={18} /> Add Lead
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="avatar">AD</div>
          <div>
            <strong>Admin User</strong>
            <span>Sales workspace</span>
          </div>
        </div>
      </aside>
    </>
  );
}
