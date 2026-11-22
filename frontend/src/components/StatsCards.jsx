import { Users, Sparkles, PhoneCall, CheckCircle2, XCircle } from "lucide-react";

const CARDS = [
  { key: "total", label: "Total Leads", note: "All captured contacts", tone: "total", icon: Users },
  { key: "new", label: "New Leads", note: "Waiting for first contact", tone: "new", icon: Sparkles },
  { key: "contacted", label: "Contacted Leads", note: "Conversation started", tone: "contacted", icon: PhoneCall },
  { key: "qualified", label: "Qualified Leads", note: "Ready for sales", tone: "qualified", icon: CheckCircle2 },
  { key: "lost", label: "Lost Leads", note: "Closed without a deal", tone: "lost", icon: XCircle },
];

export default function StatsCards({ stats, loading }) {
  return (
    <div className="stats-grid">
      {CARDS.map(({ key, label, note, tone, icon: Icon }) => (
        <article className="stat-card" key={key}>
          <div className="stat-head">
            <span>{label}</span>
            <div className={`stat-icon tone-${tone}`}>
              <Icon size={18} />
            </div>
          </div>
          <div className="stat-value">{loading ? <span className="skeleton" /> : stats[key]}</div>
          <div className="stat-note">{note}</div>
        </article>
      ))}
    </div>
  );
}
