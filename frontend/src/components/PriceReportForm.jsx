import { useState } from 'react';
import { reportPrice } from '../api';

export default function PriceReportForm({ station, onReported }) {
  const [fuelType, setFuelType] = useState('petrol');
  const [price, setPrice] = useState('');
  const [fuelAvailable, setFuelAvailable] = useState(true);
  const [status, setStatus] = useState(null);

  if (!station) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!price) return;

    try {
      setStatus('submitting');
      await reportPrice(station.id, {
        fuelType,
        price: Number(price),
        fuelAvailable,
        // 💡 Station metadata sent so backend can auto-save OpenStreetMap fallback stations
        name: station.name,
        lat: station.lat,
        lng: station.lng,
        brand: station.brand || null,
        address: station.address || null,
      });

      setStatus('success');
      setPrice('');
      onReported?.();
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <form className="price-report-form" onSubmit={handleSubmit}>
      <h3>Report a price for {station.name}</h3>

      <select value={fuelType} onChange={(e) => setFuelType(e.target.value)}>
        <option value="petrol">Petrol</option>
        <option value="diesel">Diesel</option>
        <option value="kerosene">Kerosene</option>
        <option value="gas">Gas</option>
      </select>

      <input
        type="number"
        placeholder="Price per litre (₦)"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        required
      />

      <label className="availability-toggle">
        <input
          type="checkbox"
          checked={fuelAvailable}
          onChange={(e) => setFuelAvailable(e.target.checked)}
        />
        Fuel is available at this station right now
      </label>

      <button type="submit" disabled={status === 'submitting'}>
        {status === 'submitting' ? 'Submitting...' : 'Submit price'}
      </button>

      {status === 'success' && <p className="success-msg">Price submitted, thank you!</p>}
      {status === 'error' && <p className="error-msg">Something went wrong. Try again.</p>}
    </form>
  );
}
