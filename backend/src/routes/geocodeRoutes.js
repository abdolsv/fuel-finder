const express = require('express');
const router = express.Router();
const { geocode, reverseGeocode } = require('../controllers/geocodeController');

/**
 * @openapi
 * /api/geocode:
 *   get:
 *     summary: Search for a place by name/address (forward geocoding)
 *     description: >
 *       Converts a place name, area, or address (e.g. "Ikeja, Lagos") into
 *       coordinates using OpenStreetMap's Nominatim service, biased toward
 *       Nigeria. Results are cached for 24 hours to respect Nominatim's
 *       rate-limit policy.
 *     tags: [Geocode]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Place name or address to search for
 *         example: Ikeja, Lagos
 *     responses:
 *       200:
 *         description: Matching locations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 query:
 *                   type: string
 *                 cached:
 *                   type: boolean
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       displayName:
 *                         type: string
 *                       lat:
 *                         type: number
 *                       lng:
 *                         type: number
 *                       type:
 *                         type: string
 *                       importance:
 *                         type: number
 *       400:
 *         description: Missing "q" query parameter
 *       502:
 *         description: Geocoding service unavailable
 */
router.get('/', geocode);

/**
 * @openapi
 * /api/geocode/reverse:
 *   get:
 *     summary: Look up a human-readable place name from coordinates
 *     tags: [Geocode]
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *         description: Latitude
 *       - in: query
 *         name: lng
 *         required: true
 *         schema:
 *           type: number
 *         description: Longitude
 *     responses:
 *       200:
 *         description: Place details for the given coordinates
 *       400:
 *         description: Missing lat/lng query parameters
 *       502:
 *         description: Reverse geocoding service unavailable
 */
router.get('/reverse', reverseGeocode);

module.exports = router;
