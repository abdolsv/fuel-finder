const { Op } = require('sequelize');
const Station = require('../models/Station');
const PriceReport = require('../models/PriceReport');
const { resolvePlaceToCoords } = require('./geocodeController');

function distanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function fetchOSMStations(lat, lng, radiusKm = 10) {
  const radiusMeters = radiusKm * 1000;

  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="fuel"](around:${radiusMeters},${lat},${lng});
      way["amenity"="fuel"](around:${radiusMeters},${lat},${lng});
    );
    out center;
  `;

  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 
        'User-Agent': 'FuelFinderApp/1.0 (contact@fuelfinder.local)',
        'Accept': 'application/json'
      },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    return (data.elements || [])
      .map((el) => {
        const itemLat = el.lat || el.center?.lat;
        const itemLng = el.lon || el.center?.lon;

        if (!itemLat || !itemLng) return null;

        const name = el.tags?.name || el.tags?.brand || el.tags?.operator || 'Fuel Station';

        return {
          id: `osm-${el.id}`,
          name: name,
          brand: el.tags?.brand || null,
          address: el.tags?.['addr:street'] || null,
          lat: Number(itemLat),
          lng: Number(itemLng),
          latestPrice: null,
          fuelAvailable: null,
          lastConfirmedAt: null,
          isOSM: true,
        };
      })
      .filter(Boolean);
  } catch (err) {
    return [];
  }
}

exports.getStations = async (req, res) => {
  try {
    const { fuelType, maxPrice, radiusKm, availableOnly, place } = req.query;
    let { lat, lng } = req.query;

    let resolvedPlace = null;
    if (!lat && !lng && place) {
      resolvedPlace = await resolvePlaceToCoords(place);
      if (!resolvedPlace) {
        return res.status(404).json({ error: `Could not find a location matching "${place}"` });
      }
      lat = resolvedPlace.lat;
      lng = resolvedPlace.lng;
    }

    const stations = await Station.findAll({
      include: [
        {
          model: PriceReport,
          separate: true,
          order: [['createdAt', 'DESC']],
          limit: 5,
          ...(fuelType ? { where: { fuelType } } : {}),
        },
      ],
    });

    let result = stations.map((s) => {
      const plain = s.toJSON();
      const latestReport = plain.PriceReports?.[0] ?? null;
      return {
        ...plain,
        latestPrice: latestReport?.price ?? null,
        fuelAvailable: latestReport?.fuelAvailable ?? null,
        lastConfirmedAt: latestReport?.createdAt ?? null,
      };
    });

    if (lat && lng) {
      result = result
        .map((s) => ({
          ...s,
          distanceKm: distanceKm(Number(lat), Number(lng), s.lat, s.lng),
        }))
        .sort((a, b) => a.distanceKm - b.distanceKm);

      if (radiusKm) {
        result = result.filter((s) => s.distanceKm <= Number(radiusKm));
      }
    }

    if (availableOnly === 'true') {
      result = result.filter((s) => s.fuelAvailable === true);
    }

    if (maxPrice) {
      result = result.filter(
        (s) => s.latestPrice !== null && s.latestPrice <= Number(maxPrice)
      );
    }

    if (result.length === 0 && lat && lng) {
      let osmStations = await fetchOSMStations(Number(lat), Number(lng), Number(radiusKm) || 10);

      osmStations = osmStations
        .map((s) => ({
          ...s,
          distanceKm: distanceKm(Number(lat), Number(lng), s.lat, s.lng),
        }))
        .sort((a, b) => a.distanceKm - b.distanceKm);

      if (resolvedPlace) res.set('X-Resolved-Place', encodeURIComponent(JSON.stringify(resolvedPlace)));
      return res.json(osmStations);
    }

    if (resolvedPlace) res.set('X-Resolved-Place', encodeURIComponent(JSON.stringify(resolvedPlace)));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stations' });
  }
};

exports.getRecentReports = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 10, 30);

    const reports = await PriceReport.findAll({
      include: [{ model: Station, attributes: ['id', 'name', 'brand'] }],
      order: [['createdAt', 'DESC']],
      limit,
    });

    res.json(
      reports.map((r) => ({
        id: r.id,
        fuelType: r.fuelType,
        price: r.price,
        fuelAvailable: r.fuelAvailable,
        createdAt: r.createdAt,
        station: r.Station ? { id: r.Station.id, name: r.Station.name, brand: r.Station.brand } : null,
      }))
    );
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch recent price reports' });
  }
};

exports.getStationById = async (req, res) => {
  try {
    const station = await Station.findByPk(req.params.id, {
      include: [{ model: PriceReport, order: [['createdAt', 'DESC']] }],
    });
    if (!station) return res.status(404).json({ error: 'Station not found' });
    res.json(station);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch station' });
  }
};

exports.reportPrice = async (req, res) => {
  try {
    const { fuelType, price, reportedBy, fuelAvailable, name, lat, lng, brand, address } = req.body;

    if (!fuelType || !price) {
      return res.status(400).json({ error: 'fuelType and price are required' });
    }

    let stationId = req.params.id;
    let station;

    if (typeof stationId === 'string' && stationId.startsWith('osm-')) {
      if (!name || lat === undefined || lng === undefined) {
        return res.status(400).json({
          error: 'Station name, lat, and lng are required to register an OpenStreetMap station.',
        });
      }

      station = await Station.create({
        name,
        brand: brand || null,
        address: address || null,
        lat: Number(lat),
        lng: Number(lng),
      });

      stationId = station.id;
    } else {
      station = await Station.findByPk(stationId);
    }

    if (!station) return res.status(404).json({ error: 'Station not found' });

    const report = await PriceReport.create({
      stationId: station.id,
      fuelType,
      price,
      reportedBy: reportedBy || 'anonymous',
      fuelAvailable: fuelAvailable !== undefined ? fuelAvailable : true,
    });

    res.status(201).json({ report, station });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit price report' });
  }
};

exports.createStation = async (req, res) => {
  try {
    const { name, brand, address, lat, lng } = req.body;
    if (!name || lat === undefined || lng === undefined) {
      return res.status(400).json({ error: 'name, lat, lng are required' });
    }
    const station = await Station.create({ name, brand, address, lat, lng });
    res.status(201).json(station);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create station' });
  }
};

exports.updateStation = async (req, res) => {
  try {
    const station = await Station.findByPk(req.params.id);
    if (!station) return res.status(404).json({ error: 'Station not found' });

    const { name, brand, address, lat, lng } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (brand !== undefined) updates.brand = brand;
    if (address !== undefined) updates.address = address;
    if (lat !== undefined) updates.lat = Number(lat);
    if (lng !== undefined) updates.lng = Number(lng);

    await station.update(updates);
    res.json(station);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update station' });
  }
};

exports.deleteStation = async (req, res) => {
  try {
    const station = await Station.findByPk(req.params.id);
    if (!station) return res.status(404).json({ error: 'Station not found' });

    await station.destroy();
    res.json({ message: 'Station and its price reports were deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete station' });
  }
};
