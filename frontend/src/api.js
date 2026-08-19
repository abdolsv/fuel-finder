const API_BASE = 'http://localhost:5000/api';

async function parseErrorMessage(res, fallback) {
  try {
    const body = await res.json();
    return body?.error || fallback;
  } catch {
    return fallback;
  }
}

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchStations(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '' && value !== null) {
      params.append(key, value);
    }
  });

  const res = await fetch(`${API_BASE}/stations?${params.toString()}`);
  if (!res.ok) throw new Error(await parseErrorMessage(res, 'Failed to fetch stations'));

  const stations = await res.json();
  const resolvedPlaceHeader = res.headers.get('X-Resolved-Place');
  const resolvedPlace = resolvedPlaceHeader
    ? JSON.parse(decodeURIComponent(resolvedPlaceHeader))
    : null;

  return { stations, resolvedPlace };
}

export async function fetchStationById(id) {
  const res = await fetch(`${API_BASE}/stations/${id}`);
  if (!res.ok) throw new Error(await parseErrorMessage(res, 'Failed to fetch station'));
  return res.json();
}

export async function fetchRecentReports(limit = 10) {
  const res = await fetch(`${API_BASE}/stations/recent-reports?limit=${limit}`);
  if (!res.ok) throw new Error(await parseErrorMessage(res, 'Failed to fetch recent prices'));
  return res.json();
}

export async function reportPrice(stationId, data) {
  const res = await fetch(`${API_BASE}/stations/${stationId}/prices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await parseErrorMessage(res, 'Failed to submit price report'));
  return res.json();
}

export async function searchPlaces(query) {
  const res = await fetch(`${API_BASE}/geocode?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error(await parseErrorMessage(res, 'Failed to search for that place'));
  const data = await res.json();
  return data.results; 
}

export async function loginAdmin(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(await parseErrorMessage(res, 'Login failed'));
  return res.json(); 
}

export async function fetchCurrentAdmin(token) {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(await parseErrorMessage(res, 'Session expired'));
  return res.json(); 
}

export async function createStation(token, data) {
  const res = await fetch(`${API_BASE}/stations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await parseErrorMessage(res, 'Failed to create station'));
  return res.json();
}

export async function updateStation(token, id, data) {
  const res = await fetch(`${API_BASE}/stations/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await parseErrorMessage(res, 'Failed to update station'));
  return res.json();
}

export async function deleteStation(token, id) {
  const res = await fetch(`${API_BASE}/stations/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(await parseErrorMessage(res, 'Failed to delete station'));
  return res.json();
}

export async function fetchAdminStats(token) {
  const res = await fetch(`${API_BASE}/admin/stats`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(await parseErrorMessage(res, 'Failed to fetch stats'));
  return res.json();
}

export async function fetchAdminReports(token, { limit = 50, offset = 0 } = {}) {
  const params = new URLSearchParams({ limit, offset });
  const res = await fetch(`${API_BASE}/admin/reports?${params.toString()}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(await parseErrorMessage(res, 'Failed to fetch price reports'));
  return res.json();
}

export async function deleteAdminReport(token, reportId) {
  const res = await fetch(`${API_BASE}/admin/reports/${reportId}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(await parseErrorMessage(res, 'Failed to delete price report'));
  return res.json();
}
