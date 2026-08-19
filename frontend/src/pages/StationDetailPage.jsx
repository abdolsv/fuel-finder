import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchStationById } from '../api';
import PriceReportForm from '../components/PriceReportForm';

function timeAgo(isoString) {
  if (!isoString) return null;
  const diffMs = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function StationDetailPage() {
  const { id } = useParams();
  const [station, setStation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const formRef = useRef(null);

  const loadStation = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchStationById(id);
      setStation(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Could not load this station.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadStation();
  }, [loadStation]);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) return <div className="page"><p>Loading station...</p></div>;
  if (error) return <div className="page"><p className="error-msg">{error}</p></div>;
  if (!station) return null;

  const reports = station.PriceReports || [];

  return (
    <div className="page">
      <p><Link to="/">← Back to search</Link></p>

      <header>
        <h1>{station.name}</h1>
        <p className="station-meta">
          {station.brand || 'Independent'} · {station.address || 'No address on file'}
        </p>
        <p>
          Here's everything other drivers have reported about this station so far,
          including recent prices and whether fuel was actually available when they
          checked. If you've been here recently yourself, please add what you saw below.
        </p>
      </header>

      <div className="content-grid">
        <div className="price-history">
          <h3>Price report history</h3>
          {reports.length === 0 ? (
            <div className="price-cta">
              <div>
                <h2>No reports yet</h2>
                <p>Be the first driver to report a price and availability here.</p>
              </div>
              <button type="button" className="price-cta-btn" onClick={scrollToForm}>
                Report now
              </button>
            </div>
          ) : (
            <table className="price-history-table">
              <thead>
                <tr>
                  <th>Fuel</th>
                  <th>Price</th>
                  <th>Available</th>
                  <th>Reported</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.id}>
                    <td>{r.fuelType}</td>
                    <td>₦{r.price}</td>
                    <td>{r.fuelAvailable ? '🟢 Yes' : '🔴 No'}</td>
                    <td>{timeAgo(r.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div ref={formRef}>
          <PriceReportForm station={station} onReported={loadStation} />
        </div>
      </div>
    </div>
  );
}
