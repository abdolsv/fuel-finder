import { useState } from 'react';
import { searchPlaces } from '../api';

export default function LocationSearch({ onSelectLocation }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const response = await searchPlaces(query);
      const places = response?.results || (Array.isArray(response) ? response : []);
      setResults(places);
      if (!places.length) setError('No matching locations found.');
    } catch (err) {
      setError('Could not search for that location. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (place) => {
    onSelectLocation({ lat: place.lat, lng: place.lng, name: place.displayName });
    setResults([]);
    setQuery(place.displayName.split(',')[0]);
  };

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search location (e.g. Ikeja, Lekki)..."
          style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <button type="submit" style={{ padding: '8px 12px', cursor: 'pointer' }}>
          Search
        </button>
      </form>

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
              Searching location...
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

      {error && <p className="error-msg" style={{ margin: '4px 0 0 0', fontSize: '0.85em' }}>{error}</p>}

      {results.length > 0 && (
        <ul
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: '#fff',
            border: '1px solid #ccc',
            borderRadius: '4px',
            listStyle: 'none',
            margin: '4px 0 0 0',
            padding: 0,
            zIndex: 1000,
            maxHeight: '200px',
            overflowY: 'auto',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          }}
        >
          {results.map((place, idx) => (
            <li
              key={`${place.lat}-${place.lng}-${idx}`}
              onClick={() => handleSelect(place)}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                borderBottom: '1px solid #eee',
                fontSize: '14px',
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = '#f0f0f0')}
              onMouseLeave={(e) => (e.target.style.backgroundColor = '#fff')}
            >
              {place.displayName}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
