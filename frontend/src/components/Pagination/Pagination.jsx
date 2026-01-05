import './Pagination.css';

const Pagination = ({
  currentPage,
  totalPages,
  totalCount,
  onPageChange,
  pageSize = 10,
  loading = false,
}) => {
  if (totalPages <= 1) return null;

  const handlePageClick = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage && !loading) {
      onPageChange(page);
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push('...');
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }

    return pages.map((page, index) => (
      <button
        key={index}
        onClick={() => handlePageClick(page)}
        disabled={loading || page === '...'}
        className={`page-btn ${page === currentPage ? 'active' : ''} ${
          page === '...' ? 'ellipsis' : ''
        }`}
        aria-label={page === '...' ? 'Больше страниц' : `Перейти на страницу ${page}`}
        aria-current={page === currentPage ? 'page' : undefined}
      >
        {page}
      </button>
    ));
  };

  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        Показаны записи <strong>{startRecord}</strong>–<strong>{endRecord}</strong> из{' '}
        <strong>{totalCount}</strong>
      </div>

      <div className="pagination-controls">
        <button
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={currentPage === 1 || loading}
          className="nav-btn prev-btn"
          aria-label="Предыдущая страница"
        >
          ← Назад
        </button>

        <div className="page-numbers">{renderPageNumbers()}</div>

        <button
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={currentPage === totalPages || loading}
          className="nav-btn next-btn"
          aria-label="Следующая страница"
        >
          Вперед →
        </button>
      </div>

      <div className="pagination-summary">
        Страница <strong>{currentPage}</strong> из <strong>{totalPages}</strong>
      </div>
    </div>
  );
};

export default Pagination;