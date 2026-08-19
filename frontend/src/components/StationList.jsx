// Renders a short "confirmed X ago" string from an ISO timestamp
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

function AvailabilityBadge({ fuelAvailable }) {
  if (fuelAvailable === null || fuelAvailable === undefined) {
    return <span className="badge badge-unknown">No reports yet</span>;
  }
  return fuelAvailable ? (
    <span className="badge badge-available">Fuel available</span>
  ) : (
    <span className="badge badge-unavailable">Out of fuel</span>
  );
}

export default function StationList({ stations, onSelect, selectedId }) {
  if (!stations.length) {
    return <p className="empty-state">No stations match your filters.</p>;
  }

  return (
    <ul className="station-list">
      {stations.map((s) => (
        <li
          key={s.id}
          className={`station-item ${s.id === selectedId ? 'selected' : ''}`}
          onClick={() => onSelect(s)}
        >
          <div className="station-name">{s.name}</div>
          <div className="station-meta">
            {s.brand || 'Independent'} · {s.address || 'No address'}
          </div>
          <div className="station-status">
            <AvailabilityBadge fuelAvailable={s.fuelAvailable} />
            {s.lastConfirmedAt && (
              <span className="confirmed-time">confirmed {timeAgo(s.lastConfirmedAt)}</span>
            )}
          </div>
          <div className="station-price">
            {s.latestPrice ? `₦${s.latestPrice} / litre` : 'No price reported'}
            {s.distanceKm !== undefined && ` · ${s.distanceKm.toFixed(1)} km away`}
          </div>
        </li>
      ))}
    </ul>
  );
}
