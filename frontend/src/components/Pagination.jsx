export default function Pagination({ pagination, shown, onPageChange }) {
  const { page, limit, total, totalPages } = pagination;
  const from = shown ? (page - 1) * limit + 1 : 0;
  const to = shown ? (page - 1) * limit + shown : 0;

  return (
    <div className="table-footer">
      <span>
        Showing <strong>{from}-{to}</strong> of <strong>{total}</strong> leads
      </span>
      <div className="pagination">
        <button className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button className="btn btn-outline btn-sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          Next
        </button>
      </div>
    </div>
  );
}
