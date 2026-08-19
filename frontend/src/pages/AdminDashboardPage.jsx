import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  fetchStations,
  fetchAdminStats,
  fetchAdminReports,
  deleteAdminReport,
  createStation,
  updateStation,
  deleteStation,
} from '../api';

function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>{title}</h3>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function StatsPanel({ stats }) {
  if (!stats) return null;
  return (
    <div className="admin-stats">
      <div className="admin-stat-card">
        <div className="admin-stat-value">{stats.totalStations}</div>
        <div className="admin-stat-label">Stations</div>
      </div>
      <div className="admin-stat-card">
        <div className="admin-stat-value">{stats.totalPriceReports}</div>
        <div className="admin-stat-label">Price reports</div>
      </div>
      <div className="admin-stat-card">
        <div className="admin-stat-value">{stats.stationsWithNoReports}</div>
        <div className="admin-stat-label">Stations with no reports</div>
      </div>
    </div>
  );
}

function StationFormModal({ isOpen, onClose, token, station, onSaved }) {
  const [form, setForm] = useState({ name: '', brand: '', address: '', lat: '', lng: '' });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (station) {
      setForm({
        name: station.name || '',
        brand: station.brand || '',
        address: station.address || '',
        lat: station.lat ?? '',
        lng: station.lng ?? '',
      });
    } else {
      setForm({ name: '', brand: '', address: '', lat: '', lng: '' });
    }
    setError(null);
  }, [station, isOpen]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        brand: form.brand || null,
        address: form.address || null,
        lat: Number(form.lat),
        lng: Number(form.lng),
      };

      if (station) {
        await updateStation(token, station.id, payload);
      } else {
        await createStation(token, payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose} title={station ? 'Edit Station' : 'Add New Station'}>
      <form className="admin-modal-form" onSubmit={handleSubmit}>
        <div className="admin-form-row">
          <input name="name" placeholder="Station name" value={form.name} onChange={handleChange} required />
          <input name="brand" placeholder="Brand (optional)" value={form.brand} onChange={handleChange} />
        </div>
        <div className="admin-form-row">
          <input name="address" placeholder="Address (optional)" value={form.address} onChange={handleChange} />
        </div>
        <div className="admin-form-row">
          <input name="lat" type="number" step="any" placeholder="Latitude" value={form.lat} onChange={handleChange} required />
          <input name="lng" type="number" step="any" placeholder="Longitude" value={form.lng} onChange={handleChange} required />
        </div>
        {error && <p className="error-msg">{error}</p>}
        <div className="modal-actions">
          <button type="button" onClick={onClose} disabled={submitting}>Cancel</button>
          <button type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : station ? 'Save Changes' : 'Add Station'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function StationRow({ station, token, onChanged, onEdit }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${station.name}" and all its price reports? This can't be undone.`)) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await deleteStation(token, station.id);
      onChanged();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <tr>
      <td>{station.name}</td>
      <td>{station.brand || '—'}</td>
      <td>{station.address || '—'}</td>
      <td>{station.lat.toFixed(4)}, {station.lng.toFixed(4)}</td>
      <td>
        <button type="button" onClick={onEdit} disabled={busy}>Edit</button>
        <button type="button" onClick={handleDelete} disabled={busy} className="admin-delete-btn">
          Delete
        </button>
        {error && <p className="error-msg">{error}</p>}
      </td>
    </tr>
  );
}

function StationsPanel({ token }) {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [activeStation, setActiveStation] = useState(null); // null = adding, object = editing

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { stations: data } = await fetchStations({});
      setStations(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleAddClick = () => {
    setActiveStation(null);
    setModalOpen(true);
  };

  const handleEditClick = (station) => {
    setActiveStation(station);
    setModalOpen(true);
  };

  return (
    <div>
      <div className="admin-actions-bar" style={{ marginBottom: '1rem' }}>
        <button type="button" className="primary-btn" onClick={handleAddClick}>
          + Add New Station
        </button>
      </div>

      <StationFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        token={token}
        station={activeStation}
        onSaved={load}
      />

      {loading && <p>Loading stations...</p>}
      {error && <p className="error-msg">{error}</p>}

      {!loading && !error && (
        <div className="table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Brand</th>
                <th>Address</th>
                <th>Coordinates</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stations.map((s) => (
                <StationRow
                  key={s.id}
                  station={s}
                  token={token}
                  onChanged={load}
                  onEdit={() => handleEditClick(s)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ReportsPanel({ token }) {
  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const limit = 50;

  const load = useCallback(
    async (nextOffset = 0) => {
      try {
        setLoading(true);
        const data = await fetchAdminReports(token, { limit, offset: nextOffset });
        if (nextOffset === 0) {
          setReports(data.reports);
        } else {
          setReports((prev) => [...prev, ...data.reports]);
        }
        setTotal(data.total);
        setOffset(nextOffset);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    load(0);
  }, [load]);

  const handleDelete = async (reportId) => {
    if (!window.confirm('Delete this price report?')) return;
    try {
      await deleteAdminReport(token, reportId);
      setReports((prev) => prev.filter((r) => r.id !== reportId));
      setTotal((t) => t - 1);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      {loading && reports.length === 0 && <p>Loading reports...</p>}
      {error && <p className="error-msg">{error}</p>}

      {reports.length > 0 && (
        <>
          <div className="table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Station</th>
                  <th>Fuel</th>
                  <th>Price</th>
                  <th>Available</th>
                  <th>Reported by</th>
                  <th>When</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.id}>
                    <td>{r.Station?.name || 'Unknown'}</td>
                    <td>{r.fuelType}</td>
                    <td>₦{r.price}</td>
                    <td>{r.fuelAvailable ? '🟢 Yes' : '🔴 No'}</td>
                    <td>{r.reportedBy || 'anonymous'}</td>
                    <td>{new Date(r.createdAt).toLocaleString()}</td>
                    <td>
                      <button type="button" className="admin-delete-btn" onClick={() => handleDelete(r.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="admin-report-count">
            Showing {reports.length} of {total}
          </p>

          {reports.length < total && (
            <button type="button" onClick={() => load(offset + limit)} disabled={loading}>
              {loading ? 'Loading...' : 'Load more'}
            </button>
          )}
        </>
      )}

      {!loading && reports.length === 0 && !error && <p className="empty-state">No price reports yet.</p>}
    </div>
  );
}

export default function AdminDashboardPage() {
  const { token } = useAuth();
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [statsError, setStatsError] = useState(null);

  useEffect(() => {
    fetchAdminStats(token)
      .then(setStats)
      .catch((err) => setStatsError(err.message));
  }, [token]);

  return (
    <div className="page admin-dashboard">
      <header>
        <h1>Admin dashboard</h1>
      </header>

      {statsError && <p className="error-msg">{statsError}</p>}
      <StatsPanel stats={stats} />

      <div className="admin-tabs">
        <button
          type="button"
          className={tab === 'overview' ? 'admin-tab active' : 'admin-tab'}
          onClick={() => setTab('overview')}
        >
          Stations
        </button>
        <button
          type="button"
          className={tab === 'reports' ? 'admin-tab active' : 'admin-tab'}
          onClick={() => setTab('reports')}
        >
          Price reports
        </button>
      </div>

      {tab === 'overview' && <StationsPanel token={token} />}
      {tab === 'reports' && <ReportsPanel token={token} />}
    </div>
  );
}
