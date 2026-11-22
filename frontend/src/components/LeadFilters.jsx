import { Search, X } from "lucide-react";
import { STATUSES } from "../utils/constants.js";

export default function LeadFilters({ searchInput, onSearchChange, statusFilter, onStatusChange, hasFilters, onClear }) {
  return (
    <div className="toolbar">
      <div className="search-box">
        <Search size={17} />
        <input
          type="search"
          value={searchInput}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search leads by name..."
          aria-label="Search leads by name"
        />
        {searchInput && (
          <button className="clear-btn" onClick={() => onSearchChange("")} aria-label="Clear search">
            <X size={15} />
          </button>
        )}
      </div>

      <select
        className="filter-select"
        value={statusFilter}
        onChange={(event) => onStatusChange(event.target.value)}
        aria-label="Filter by status"
      >
        <option value="">All statuses</option>
        {STATUSES.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>

      {hasFilters && (
        <button className="btn btn-ghost" onClick={onClear}>
          Clear filters
        </button>
      )}
    </div>
  );
}
