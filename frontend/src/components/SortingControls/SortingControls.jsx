import './SortingControls.css';

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
  return (
    <div className="sorting-controls">
      <div className="sorting-title">{title}:</div>

      <div className="sorting-options">
        <div className="sorting-group">
          <label className="sorting-label">Поле:</label>
          <select
            value={sortField}
            onChange={(e) => onSortFieldChange(e.target.value)}
            className="sorting-select"
          >
            {availableFields.map((field) => (
              <option key={field.key} value={field.key}>
                {field.label}
              </option>
            ))}
          </select>
        </div>

        <div className="sorting-group">
          <label className="sorting-label">Направление:</label>
          <select
            value={sortDirection}
            onChange={(e) => onSortDirectionChange(e.target.value)}
            className="sorting-select"
          >
            <option value="asc">По возрастанию ↑</option>
            <option value="desc">По убыванию ↓</option>
          </select>
        </div>

        {onResetFilters && (
          <button onClick={onResetFilters} className="btn btn-secondary">
            Сбросить фильтры
          </button>
        )}

        {additionalControls && additionalControls()}
      </div>
    </div>
  );
};

export default SortingControls;