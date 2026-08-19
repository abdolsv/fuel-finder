import { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { fetchStations } from '../api';
import FilterBar from '../components/FilterBar';
import StationList from '../components/StationList';
import StationMap from '../components/StationMap';
import PriceReportForm from '../components/PriceReportForm';
import LocationSearch from '../components/LocationSearch';
import HowItWorks from '../components/HowItWorks';
import LatestPricesCarousel from '../components/LatestPricesCarousel';
import FAQPreview from '../components/FAQPreview';
import PriceCTA from '../components/PriceCTA';

export default function HomePage() {
  const [stations, setStations] = useState([]);
  const [resolvedPlace, setResolvedPlace] = useState(null);
  const [filters, setFilters] = useState({
    fuelType: '',
    maxPrice: '',
    radiusKm: '',
    availableOnly: '',
  });
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const stationsSectionRef = useRef(null);

  const handleLocationSelect = ({ lat, lng }) => {
    setUserLocation({ lat, lng });
    setFilters((prev) => ({
      ...prev,
      lat,
      lng,
      radiusKm: prev.radiusKm || 10,
    }));
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported on this device/browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        handleLocationSelect({ lat, lng });
      },
      (geoError) => {
        alert('Could not get your location: ' + geoError.message);
      }
    );
  };

  const loadStations = useCallback(async () => {
    try {
      setLoading(true);
      const { stations: data, resolvedPlace: place } = await fetchStations(filters);
      setStations(data);
      setResolvedPlace(place);
      setError(null);
    } catch (err) {
      setError('Could not load stations. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadStations();
  }, [loadStations]);

  const scrollToStations = () => {
    stationsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="page">
      <header>
        <h1>Fuel Station Finder</h1>
        <p>Find nearby fuel stations and see recently reported prices.</p>
      </header>

      <PriceCTA onReportClick={scrollToStations} />

      <div className="location-search-wrap">
        <LocationSearch onSelectLocation={handleLocationSelect} />
      </div>

      {resolvedPlace && (
        <p className="resolved-place">Showing results near {resolvedPlace.displayName}</p>
      )}

      <FilterBar filters={filters} onChange={setFilters} onUseLocation={useMyLocation} />

      {error && <p className="error-msg">{error}</p>}

      {loading && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
          }}
        >
          <div
            style={{
              backgroundColor: '#fff',
              padding: '24px',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#007bff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                animation: 'rotateEarth 2s linear infinite',
              }}
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <span style={{ fontSize: '15px', fontWeight: '500', color: '#333' }}>
              Searching stations...
            </span>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes rotateEarth {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>

      <section ref={stationsSectionRef}>
        <StationMap stations={stations} onSelect={setSelected} userLocation={userLocation} />

        <HowItWorks />

        <div className="content-grid">
          <div>
            <StationList stations={stations} onSelect={setSelected} selectedId={selected?.id} />
            {selected && !selected.isOSM && (
              <p className="selected-station-note">
                <Link to={`/stations/${selected.id}`}>View full details for {selected.name} →</Link>
              </p>
            )}
            {selected && selected.isOSM && (
              <p className="hint-msg selected-station-note">
                This station is from OpenStreetMap and isn't saved yet — report a price below to add it.
              </p>
            )}
          </div>
          <PriceReportForm station={selected} onReported={loadStations} />
        </div>
      </section>

      <LatestPricesCarousel />

      <FAQPreview />
    </div>
  );
}
