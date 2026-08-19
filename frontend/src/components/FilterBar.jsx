export default function FilterBar({ filters, onChange, onUseLocation }) {
  const handleChange = (e) => {
    onChange({ ...filters, [e.target.name]: e.target.value });
  };

  const handleCheckbox = (e) => {
    onChange({ ...filters, availableOnly: e.target.checked ? 'true' : '' });
  };

  return (
    <div className="filter-bar">
      <select
        name="fuelType"
        value={filters.fuelType}
        onChange={handleChange}
        aria-label="Fuel type"
      >
        <option value="">All fuel types</option>
        <option value="petrol">Petrol</option>
        <option value="diesel">Diesel</option>
        <option value="kerosene">Kerosene</option>
        <option value="gas">Gas</option>
      </select>

      <input
        type="number"
        name="maxPrice"
        placeholder="Max price (₦)"
        aria-label="Maximum price per litre"
        value={filters.maxPrice}
        onChange={handleChange}
      />

      <input
        type="number"
        name="radiusKm"
        placeholder="Radius (km)"
        aria-label="Search radius in kilometres"
        value={filters.radiusKm}
        onChange={handleChange}
      />

      <button type="button" className="filter-bar-btn" onClick={onUseLocation}>
        Use my location
      </button>

      <label className="availability-toggle">
        <input
          type="checkbox"
          checked={filters.availableOnly === 'true'}
          onChange={handleCheckbox}
        />
        Only show stations with fuel available
      </label>
    </div>
  );
}
