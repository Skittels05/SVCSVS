import React, { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table';
import './EditableTable.css';

const EditableTable = ({
  data,
  columns,
  onEditCell,
  emptyMessage = 'Нет данных',
  pageSize = 10,
  totalCount = 0,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  loading = false,
  projects = [],
  onFilterChange,
  filters = {
    status: '',
    project: ''
  }
}) => {
  const [editingCell, setEditingCell] = useState(null);

  const tableColumns = useMemo(() => {
    const baseColumns = columns.map((col) => ({
      accessorKey: col.key,
      header: col.header,
      cell: (info) => {
        if (col.key === 'status' && editingCell?.rowId === info.row.id && editingCell?.columnId === col.key) {
          return (
            <select
              className="status-edit-select"
              value={info.getValue() || ''}
              onChange={(e) => {
                onEditCell(info.row.original.id, col.key, e.target.value);
                setEditingCell(null);
              }}
              onBlur={() => setEditingCell(null)}
              autoFocus
            >
              <option value="backlog">Бэклог</option>
              <option value="todo">To Do</option>
              <option value="in_progress">В работе</option>
              <option value="review">На проверке</option>
              <option value="done">Готово</option>
            </select>
          );
        }

        if (col.render) {
          return col.render(info.row.original);
        }

        if (col.key.includes('.')) {
          const keys = col.key.split('.');
          let value = info.row.original;
          for (const key of keys) {
            value = value?.[key];
            if (value === undefined) break;
          }
          return value || '—';
        }

        return info.getValue() || '—';
      },
      meta: col.meta || {},
    }));

    if (onEditCell) {
      baseColumns.forEach(col => {
        if (col.accessorKey === 'status') {
          const originalCell = col.cell;
          col.cell = (info) => (
            <div
              className="editable-cell"
              onDoubleClick={() => setEditingCell({
                rowId: info.row.id,
                columnId: col.accessorKey,
                value: info.getValue()
              })}
            >
              {originalCell(info)}
            </div>
          );
        }
      });
    }

    baseColumns.forEach(col => {
      if (col.accessorKey === 'status') {
        const originalHeader = col.header;
        col.header = () => (
          <div className="header-with-filter">
            <div className="header-text">{originalHeader}</div>
            <div className="column-filter-dropdown">
              <select
                value={filters.status || ''}
                onChange={(e) => onFilterChange?.('status', e.target.value)}
                className="column-filter-select"
                onClick={(e) => e.stopPropagation()}
              >
                <option value="">Все статусы</option>
                <option value="backlog">Бэклог</option>
                <option value="todo">To Do</option>
                <option value="in_progress">В работе</option>
                <option value="review">На проверке</option>
                <option value="done">Готово</option>
              </select>
            </div>
          </div>
        );
      }

      if (col.accessorKey === 'Project.name') {
        const originalHeader = col.header;
        col.header = () => (
          <div className="header-with-filter">
            <div className="header-text">{originalHeader}</div>
            <div className="column-filter-dropdown">
              <select
                value={filters.project || ''}
                onChange={(e) => onFilterChange?.('project', e.target.value)}
                className="column-filter-select"
                onClick={(e) => e.stopPropagation()}
              >
                <option value="">Все проекты</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );
      }
    });

    return baseColumns;
  }, [columns, editingCell, onEditCell, filters, projects, onFilterChange]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    manualPagination: true,
    pageCount: totalPages,
    getCoreRowModel: getCoreRowModel(),
  });

  const hasActiveFilters = filters.status || filters.project;

  if (loading && data.length === 0) {
    return (
      <div className="table-loading">
        <div className="loading-spinner"></div>
        <p>Загрузка данных...</p>
      </div>
    );
  }

  if (data.length === 0 && !loading) {
    return (
      <div className="table-empty">
        <div className="empty-icon">📭</div>
        <p>{emptyMessage}</p>
        {hasActiveFilters && (
          <button
            onClick={() => onFilterChange?.('reset', '')}
            className="btn btn-primary reset-filter-btn"
          >
            Сбросить все фильтры
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="editable-table-container">
      <div className="table-instruction">
        <div className="instruction-icon">💡</div>
        <div className="instruction-text">
          <strong>Фильтрация:</strong> Используйте выпадающие списки в заголовках колонок.
          <strong> Быстрое редактирование:</strong> Двойной клик по статусу задачи.
        </div>
      </div>

      <div className="table-filters-info">
        {hasActiveFilters && (
          <div className="active-filters">
            <span className="filters-label">Активные фильтры:</span>
            {filters.status && (
              <span className="filter-badge">
                Статус: {getStatusLabel(filters.status)}
                <button
                  onClick={() => onFilterChange?.('status', '')}
                  className="filter-remove"
                >
                  ×
                </button>
              </span>
            )}
            {filters.project && (
              <span className="filter-badge">
                Проект: {projects.find(p => p.id === parseInt(filters.project))?.name || `ID ${filters.project}`}
                <button
                  onClick={() => onFilterChange?.('project', '')}
                  className="filter-remove"
                >
                  ×
                </button>
              </span>
            )}
            <button
              onClick={() => onFilterChange?.('reset', '')}
              className="btn btn-secondary btn-small reset-all-filters"
            >
              Сбросить все
            </button>
          </div>
        )}
      </div>

      <div className="table-wrapper">
        <table className="editable-table">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="table-header-cell"
                    style={header.column.columnDef.meta?.width ? { width: header.column.columnDef.meta.width } : {}}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="table-row">
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="table-cell"
                    style={cell.column.columnDef.meta?.width ? { width: cell.column.columnDef.meta.width } : {}}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <div className="table-info">
          Показано {data.length} из {totalCount} записей
          {hasActiveFilters && ' (с фильтрацией)'}
        </div>

        <div className="pagination-controls">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1 || loading}
            className="pagination-btn"
          >
            ◀ Назад
          </button>

          <div className="page-numbers">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              if (pageNum > totalPages) return null;

              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
                  disabled={loading}
                >
                  {pageNum}
                </button>
              );
            })}

            {totalPages > 5 && currentPage < totalPages - 2 && (
              <>
                <span className="page-dots">...</span>
                <button
                  onClick={() => onPageChange(totalPages)}
                  className={`page-btn ${currentPage === totalPages ? 'active' : ''}`}
                  disabled={loading}
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>

          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages || loading}
            className="pagination-btn"
          >
            Вперёд ▶
          </button>
        </div>

        <div className="page-size-control">
          <span>На странице: 10</span>
        </div>
      </div>
    </div>
  );
};

const getStatusLabel = (status) => {
  const statusMap = {
    backlog: 'Бэклог',
    todo: 'To Do',
    in_progress: 'В работе',
    review: 'На проверке',
    done: 'Готово',
  };
  return statusMap[status] || status;
};

export default EditableTable;