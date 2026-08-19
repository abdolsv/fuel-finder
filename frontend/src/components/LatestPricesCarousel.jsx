import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchRecentReports } from '../api';

function timeAgo(isoString) {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function LatestPricesCarousel() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const trackRef = useRef(null);

  useEffect(() => {
    fetchRecentReports(12)
      .then(setReports)
      .catch(() => setError('Could not load recent prices.'))
      .finally(() => setLoading(false));
  }, []);

  const scrollByCard = (direction) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector('.price-card');
    const cardWidth = card ? card.offsetWidth + 12 : 220;
    track.scrollBy({ left: direction * cardWidth, behavior: 'smooth' });
  };

  if (loading) return null;
  if (error) return null;
  if (reports.length === 0) return null;

  return (
    <section className="latest-prices">
      <div className="latest-prices-header">
        <h2>Latest reported prices</h2>
        <div className="carousel-controls">
          <button type="button" aria-label="Scroll left" onClick={() => scrollByCard(-1)}>‹</button>
          <button type="button" aria-label="Scroll right" onClick={() => scrollByCard(1)}>›</button>
        </div>
      </div>

      <div className="price-carousel-track" ref={trackRef}>
        {reports.map((r) => (
          <Link
            to={r.station ? `/stations/${r.station.id}` : '/'}
            className="price-card"
            key={r.id}
          >
            <div className="price-card-station">{r.station?.name || 'Unknown station'}</div>
            <div className="price-card-brand">{r.station?.brand || 'Independent'}</div>
            <div className="price-card-price">₦{r.price} <span>/ {r.fuelType}</span></div>
            <div className="price-card-status">
              {r.fuelAvailable ? '🟢 Available' : '🔴 Out of stock'}
            </div>
            <div className="price-card-time">{timeAgo(r.createdAt)}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
