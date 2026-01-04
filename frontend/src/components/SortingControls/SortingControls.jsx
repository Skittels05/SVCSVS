const SortingControls = ({ 
  sortField, 
  sortDirection, 
  onSortFieldChange, 
  onSortDirectionChange, 
  availableFields = [], 
  onResetFilters = null,
  additionalControls = null,
  title = "Сортировка"
}) => {
  const getFieldLabel = (fieldKey) => {
    const field = availableFields.find(f => f.key === fieldKey);
    return field ? field.label : fieldKey;
  };

  return (
    <div style={{ 
      margin: '20px 0', 
      padding: '15px', 
      background: '#f8f9fa', 
      borderRadius: '8px', 
      border: '1px solid #dee2e6'
    }}>
      <div style={{ marginBottom: '15px', fontWeight: 'bold', color: '#2c3e50' }}>
        {title}:
      </div>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <label style={{ fontWeight: '500', color: '#495057' }}>Поле:</label>
          <select
            value={sortField}
            onChange={(e) => {
              onSortFieldChange(e.target.value);
            }}
            style={{ 
              padding: '8px 12px', 
              borderRadius: '4px', 
              border: '1px solid #ced4da',
              background: 'white',
              minWidth: '150px'
            }}
          >
            {availableFields.map((field, index) => (
              <option key={index} value={field.key}>
                {field.label}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <label style={{ fontWeight: '500', color: '#495057' }}>Направление:</label>
          <select
            value={sortDirection}
            onChange={(e) => {
              onSortDirectionChange(e.target.value);
            }}
            style={{ 
              padding: '8px 12px', 
              borderRadius: '4px', 
              border: '1px solid #ced4da',
              background: 'white',
              minWidth: '140px'
            }}
          >
            <option value="asc">По возрастанию ↑</option>
            <option value="desc">По убыванию ↓</option>
          </select>
        </div>

        {onResetFilters && (
          <button
            onClick={onResetFilters}
            style={{
              padding: '8px 16px',
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Сбросить фильтры
          </button>
        )}

        {additionalControls && additionalControls()}
      </div>
    </div>
  );
};

export default SortingControls;