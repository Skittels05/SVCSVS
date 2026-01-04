import { useState } from 'react';

const DataTable = ({ 
  data = [], 
  columns = [], 
  emptyMessage = "Данные не найдены", 
  onEdit, 
  onDelete, 
  onView,
  actionsLabel = "Действия" 
}) => {
  const [hoverRow, setHoverRow] = useState(null);

  if (data.length === 0) {
    return (
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th 
                key={index} 
                style={{ 
                  padding: '12px', 
                  background: '#f8f9fa', 
                  border: '1px solid #dee2e6', 
                  textAlign: 'left' 
                }}
              >
                {column.header}
              </th>
            ))}
            {(onEdit || onDelete || onView) && (
              <th 
                style={{ 
                  padding: '12px', 
                  background: '#f8f9fa', 
                  border: '1px solid #dee2e6', 
                  textAlign: 'center',
                  width: '250px'
                }}
              >
                {actionsLabel}
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td 
              colSpan={columns.length + (onEdit || onDelete || onView ? 1 : 0)} 
              style={{ 
                textAlign: 'center', 
                padding: '30px', 
                color: '#6c757d' 
              }}
            >
              {emptyMessage}
            </td>
          </tr>
        </tbody>
      </table>
    );
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          {columns.map((column, index) => (
            <th 
              key={index} 
              style={{ 
                padding: '12px', 
                background: '#f8f9fa', 
                border: '1px solid #dee2e6', 
                textAlign: 'left' 
              }}
            >
              {column.header}
            </th>
          ))}
          {(onEdit || onDelete || onView) && (
            <th 
              style={{ 
                padding: '12px', 
                background: '#f8f9fa', 
                border: '1px solid #dee2e6', 
                textAlign: 'center',
                width: '250px'
              }}
            >
              {actionsLabel}
            </th>
          )}
        </tr>
      </thead>
      <tbody>
        {data.map((item, rowIndex) => (
          <tr 
            key={item.id || rowIndex}
            style={{ 
              backgroundColor: hoverRow === item.id ? '#e3f2fd' : 'white' 
            }}
            onMouseEnter={() => setHoverRow(item.id)}
            onMouseLeave={() => setHoverRow(null)}
          >
            {columns.map((column, colIndex) => (
              <td 
                key={colIndex} 
                style={{ 
                  padding: '12px', 
                  border: '1px solid #dee2e6',
                  verticalAlign: 'middle'
                }}
              >
                {column.render ? column.render(item) : item[column.key]}
              </td>
            ))}
            {(onEdit || onDelete || onView) && (
              <td style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'center' }}>
                {onView && (
                  <button
                    onClick={() => onView(item)}
                    style={{
                      padding: '6px 12px',
                      margin: '0 5px',
                      background: '#17a2b8',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Просмотреть
                  </button>
                )}
                {onEdit && (
                  <button
                    onClick={() => onEdit(item)}
                    style={{
                      padding: '6px 12px',
                      margin: '0 5px',
                      background: '#3498db',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Редактировать
                  </button>
                )}
                {onDelete && (
                  <button
                    className="danger"
                    onClick={() => onDelete(item.id)}
                    style={{
                      padding: '6px 12px',
                      margin: '0 5px',
                      background: '#e74c3c',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Удалить
                  </button>
                )}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default DataTable;