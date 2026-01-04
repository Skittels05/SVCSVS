import { useState } from 'react';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  totalCount, 
  onPageChange, 
  pageSize = 10,
  loading = false 
}) => {
  const [hoveredPage, setHoveredPage] = useState(null);

  if (totalPages <= 1) return null;

  const handlePageClick = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) pages.push('...');
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }

    return pages.map((page, index) => (
      <button
        key={index}
        onClick={() => handlePageClick(page)}
        style={{
          padding: '10px 15px',
          margin: '0 2px',
          background: page === currentPage ? '#3498db' : 
                     (page === hoveredPage || (typeof page === 'number' && page === hoveredPage)) ? '#ecf0f1' : 'white',
          color: page === currentPage ? 'white' : '#2c3e50',
          border: '1px solid #bdc3c7',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1,
          fontSize: '14px',
          fontWeight: page === currentPage ? 'bold' : 'normal'
        }}
        onMouseEnter={() => setHoveredPage(page)}
        onMouseLeave={() => setHoveredPage(null)}
        disabled={loading || page === '...'}
      >
        {page}
      </button>
    ));
  };

  return (
    <div style={{ 
      marginTop: '30px', 
      textAlign: 'center', 
      padding: '20px 0',
      borderTop: '1px solid #dee2e6'
    }}>
      <div style={{ marginBottom: '15px', fontSize: '16px', color: '#6c757d' }}>
        Показаны записи {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalCount)} 
        из {totalCount}
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: '5px' }}>
        <button
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={currentPage === 1 || loading}
          style={{
            padding: '10px 15px',
            background: currentPage === 1 ? '#ecf0f1' : '#3498db',
            color: currentPage === 1 ? '#6c757d' : 'white',
            border: '1px solid #bdc3c7',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            fontSize: '16px',
            marginRight: '10px'
          }}
        >
          ← Назад
        </button>

        {renderPageNumbers()}

        <button
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={currentPage === totalPages || loading}
          style={{
            padding: '10px 15px',
            background: currentPage === totalPages ? '#ecf0f1' : '#3498db',
            color: currentPage === totalPages ? '#6c757d' : 'white',
            border: '1px solid #bdc3c7',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            fontSize: '16px',
            marginLeft: '10px'
          }}
        >
          Вперед →
        </button>
      </div>

      <div style={{ marginTop: '10px', fontSize: '14px', color: '#6c757d' }}>
        Страница <strong>{currentPage}</strong> из <strong>{totalPages}</strong>
      </div>
    </div>
  );
};

export default Pagination;