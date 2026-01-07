import { useState } from 'react';
import './DataTable.css';

const DataTable = ({
  data = [],
  columns = [],
  emptyMessage = "Данные не найдено",
  customActions,
  onEdit,
  onDelete,
  onView,
  actionsLabel = "Действия"
}) => {
  const [hoverRow, setHoverRow] = useState(null);

  const hasActions = customActions || onEdit || onDelete || onView;

  if (data.length === 0) {
    return (
      <div className="data-table-empty">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((column, index) => (
                <th key={index}>{column.header}</th>
              ))}
              {hasActions && <th className="actions-header">{actionsLabel}</th>}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={columns.length + (hasActions ? 1 : 0)} className="empty-message">
                {emptyMessage}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="data-table-container">
      {/* Десктопная таблица */}
      <table className="data-table desktop-only">
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index}>{column.header}</th>
            ))}
            {hasActions && <th className="actions-header">{actionsLabel}</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={item.id}
              className={hoverRow === item.id ? 'hovered' : ''}
              onMouseEnter={() => setHoverRow(item.id)}
              onMouseLeave={() => setHoverRow(null)}
            >
              {columns.map((column, colIndex) => (
                <td key={colIndex}>
                  {column.render ? column.render(item) : item[column.key]}
                </td>
              ))}
              {hasActions && (
                <td className="actions-cell">
                  {customActions ? (
                    customActions(item)
                  ) : (
                    <>
                      {onView && (
                        <button onClick={() => onView(item)} className="btn btn-info btn-small">
                          Просмотреть
                        </button>
                      )}
                      {onEdit && (
                        <button onClick={() => onEdit(item)} className="btn btn-primary btn-small">
                          Редактировать
                        </button>
                      )}
                      {onDelete && (
                        <button onClick={() => onDelete(item.id)} className="btn btn-danger btn-small">
                          Удалить
                        </button>
                      )}
                    </>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Мобильная версия — карточки */}
      <div className="mobile-cards mobile-only">
        {data.map((item) => (
          <div key={item.id} className="data-card">
            <div className="card-body">
              {columns.map((column, idx) => (
                <div key={idx} className="card-row">
                  <strong>{column.header}:</strong>
                  <span>{column.render ? column.render(item) : item[column.key]}</span>
                </div>
              ))}
            </div>
            {hasActions && (
              <div className="card-actions">
                {customActions ? (
                  customActions(item)
                ) : (
                  <>
                    {onView && (
                      <button onClick={() => onView(item)} className="btn btn-info">
                        Просмотреть
                      </button>
                    )}
                    {onEdit && (
                      <button onClick={() => onEdit(item)} className="btn btn-primary">
                        Редактировать
                      </button>
                    )}
                    {onDelete && (
                      <button onClick={() => onDelete(item.id)} className="btn btn-danger">
                        Удалить
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DataTable;