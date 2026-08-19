const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';
const USER_AGENT = 'FuelStationFinder/1.0';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const cache = new Map();

const NIGERIAN_LOCATIONS = {
  'kaduna': { lat: 10.5105, lng: 7.4165, displayName: 'Kaduna, Nigeria' },
  'lagos': { lat: 6.5244, lng: 3.3792, displayName: 'Lagos, Nigeria' },
  'abuja': { lat: 9.0765, lng: 7.3986, displayName: 'Abuja, Federal Capital Territory, Nigeria' },
  'kano': { lat: 12.0022, lng: 8.5920, displayName: 'Kano, Nigeria' },
  'ibadan': { lat: 7.3775, lng: 3.9470, displayName: 'Ibadan, Oyo, Nigeria' },
  'port harcourt': { lat: 4.8156, lng: 7.0498, displayName: 'Port Harcourt, Rivers, Nigeria' },
  'benin city': { lat: 6.3350, lng: 5.6037, displayName: 'Benin City, Edo, Nigeria' },
  'ikeja': { lat: 6.6018, lng: 3.3515, displayName: 'Ikeja, Lagos, Nigeria' },
  'lekki': { lat: 6.4698, lng: 3.5852, displayName: 'Lekki, Lagos, Nigeria' },
  'jos': { lat: 9.8965, lng: 8.8583, displayName: 'Jos, Plateau, Nigeria' },
  'enugu': { lat: 6.4244, lng: 7.5100, displayName: 'Enugu, Nigeria' },
  'abeokuta': { lat: 7.1558, lng: 3.3451, displayName: 'Abeokuta, Ogun, Nigeria' },
  'owerri': { lat: 5.4859, lng: 7.0351, displayName: 'Owerri, Imo, Nigeria' },
  'ilorin': { lat: 8.4966, lng: 4.5421, displayName: 'Ilorin, Kwara, Nigeria' },
  'zaria': { lat: 11.1113, lng: 7.7227, displayName: 'Zaria, Kaduna, Nigeria' }
};

function getLocalFallback(query) {
  const clean = query.toLowerCase().trim();
  for (const [key, value] of Object.entries(NIGERIAN_LOCATIONS)) {
    if (clean.includes(key)) {
      return value;
    }
  }
  return null;
}

function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCached(key, data) {
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

let queueTail = Promise.resolve();
const MIN_INTERVAL_MS = 1100;
let lastRequestAt = 0;

function scheduleNominatimCall(fn) {
  const run = async () => {
    const now = Date.now();
    const wait = Math.max(0, lastRequestAt + MIN_INTERVAL_MS - now);
    if (wait > 0) {
      await new Promise((resolve) => setTimeout(resolve, wait));
    }
    lastRequestAt = Date.now();
    return fn();
  };
  const result = queueTail.then(run, run);
  queueTail = result.catch(() => {});
  return result;
}

async function nominatimFetch(path) {
  const url = `${NOMINATIM_BASE_URL}${path}`;
  const response = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      'Accept-Language': 'en',
    },
  });
  if (!response.ok) {
    throw new Error(`Nominatim request failed: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

async function geocodePlace(rawQuery) {
  const query = rawQuery.trim();
  const cacheKey = `geocode:${query.toLowerCase()}`;
  const cached = getCached(cacheKey);
  if (cached) {
    return { ...cached, cached: true };
  }

  const fallback = getLocalFallback(query);
  if (fallback) {
    const payload = { query, results: [fallback] };
    setCached(cacheKey, payload);
    return { ...payload, cached: true };
  }

  try {
    const path =
      `/search?format=jsonv2&addressdetails=1&limit=5` +
      `&countrycodes=ng&q=${encodeURIComponent(query)}`;
    const results = await scheduleNominatimCall(() => nominatimFetch(path));
    const payload = {
      query,
      results: (results || []).map((r) => ({
        displayName: r.display_name,
        lat: Number(r.lat),
        lng: Number(r.lon),
        type: r.type,
        importance: r.importance,
      })),
    };
    setCached(cacheKey, payload);
    return { ...payload, cached: false };
  } catch (err) {
    return { query, results: [], cached: false };
  }
}

async function resolvePlaceToCoords(rawQuery) {
  if (!rawQuery || !rawQuery.trim()) return null;
  const fallback = getLocalFallback(rawQuery);
  if (fallback) return { lat: fallback.lat, lng: fallback.lng, displayName: fallback.displayName };

  const { results } = await geocodePlace(rawQuery);
  if (!results.length) return null;
  const best = results[0];
  return { lat: best.lat, lng: best.lng, displayName: best.displayName };
}

exports.geocode = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }
    const payload = await geocodePlace(q);
    res.json(payload);
  } catch (err) {
    res.status(502).json({ error: 'Geocoding service unavailable, please try again' });
  }
};

exports.resolvePlaceToCoords = resolvePlaceToCoords;

exports.reverseGeocode = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (lat === undefined || lng === undefined) {
      return res.status(400).json({ error: 'Query parameters "lat" and "lng" are required' });
    }
    const cacheKey = `reverse:${Number(lat).toFixed(4)},${Number(lng).toFixed(4)}`;
    const cached = getCached(cacheKey);
    if (cached) {
      return res.json({ ...cached, cached: true });
    }
    const path = `/reverse?format=jsonv2&lat=${Number(lat)}&lon=${Number(lng)}`;
    const result = await scheduleNominatimCall(() => nominatimFetch(path));
    const payload = {
      displayName: result.display_name || null,
      address: result.address || null,
    };
    setCached(cacheKey, payload);
    res.json({ ...payload, cached: false });
  } catch (err) {
    res.status(502).json({ error: 'Reverse geocoding service unavailable, please try again' });
  }
};
