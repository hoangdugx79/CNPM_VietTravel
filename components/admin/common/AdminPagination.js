function getPageNumbers(currentPage, totalPages) {
  const pages = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);

  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }

  return pages;
}

export default function AdminPagination({ pagination, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) return null;

  const { page, totalPages, total, limit } = pagination;
  const from = (page - 1) * limit + 1;
  const to = Math.min(total, page * limit);

  return (
    <div className="pagination">
      <div className="pagination-info">
        Hien thi {from}-{to} / {total}
      </div>
      <div className="pagination-btns">
        <button type="button" className="page-btn" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          <i className="fas fa-chevron-left" />
        </button>
        {getPageNumbers(page, totalPages).map((pageNumber) => (
          <button
            key={pageNumber}
            type="button"
            className={`page-btn ${pageNumber === page ? 'active' : ''}`}
            onClick={() => onPageChange(pageNumber)}
          >
            {pageNumber}
          </button>
        ))}
        <button type="button" className="page-btn" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          <i className="fas fa-chevron-right" />
        </button>
      </div>
    </div>
  );
}
