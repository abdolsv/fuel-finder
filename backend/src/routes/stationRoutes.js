const express = require('express');
const router = express.Router();
const {
  getStations,
  getStationById,
  reportPrice,
  createStation,
  updateStation,
  deleteStation,
  getRecentReports,
} = require('../controllers/stationController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

/**
 * @openapi
 * components:
 *   schemas:
 *     Station:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: TotalEnergies Station
 *         lat:
 *           type: number
 *           example: 6.5244
 *         lng:
 *           type: number
 *           example: 3.3792
 *         latestPrice:
 *           type: number
 *           example: 650
 *         fuelAvailable:
 *           type: boolean
 *           example: true
 *     PriceReport:
 *       type: object
 *       required:
 *         - price
 *         - fuelType
 *       properties:
 *         price:
 *           type: number
 *           example: 680
 *         fuelType:
 *           type: string
 *           example: PMS
 *         fuelAvailable:
 *           type: boolean
 *           example: true
 */

/**
 * @openapi
 * /api/stations:
 *   get:
 *     summary: Fetch all fuel stations
 *     tags: [Stations]
 *     parameters:
 *       - in: query
 *         name: place
 *         schema:
 *           type: string
 *         description: >
 *           Free-text place name/address (e.g. "Ikeja, Lagos"). Resolved
 *           server-side to lat/lng via Nominatim geocoding. Ignored if lat
 *           and lng are also provided. The resolved location is returned in
 *           the X-Resolved-Place response header.
 *       - in: query
 *         name: fuelType
 *         schema:
 *           type: string
 *         description: Filter by fuel type (e.g. PMS, AGO)
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Filter stations with price less than or equal to this
 *       - in: query
 *         name: radiusKm
 *         schema:
 *           type: number
 *         description: Distance radius in kilometers (requires lat and lng)
 *       - in: query
 *         name: lat
 *         schema:
 *           type: number
 *         description: User latitude coordinate
 *       - in: query
 *         name: lng
 *         schema:
 *           type: number
 *         description: User longitude coordinate
 *       - in: query
 *         name: availableOnly
 *         schema:
 *           type: boolean
 *         description: Filter only stations where fuel is currently available
 *     responses:
 *       200:
 *         description: A list of fuel stations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Station'
 *       500:
 *         description: Internal server error
 * 
 *   post:
 *     summary: Create a new fuel station
 *     tags: [Stations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, lat, lng]
 *             properties:
 *               name:
 *                 type: string
 *                 example: NNPC Mega Station
 *               lat:
 *                 type: number
 *                 example: 6.4531
 *               lng:
 *                 type: number
 *                 example: 3.3958
 *     responses:
 *       201:
 *         description: Station created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Station'
 *       400:
 *         description: Bad request / missing required fields
 */
router.get('/', getStations);
router.post('/', requireAuth, requireAdmin, createStation);

/**
 * @openapi
 * /api/stations/{id}:
 *   get:
 *     summary: Get a specific station by ID
 *     tags: [Stations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Unique station ID
 *     responses:
 *       200:
 *         description: Station details retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Station'
 *       404:
 *         description: Station not found
 */
/**
 * @openapi
 * /api/stations/recent-reports:
 *   get:
 *     summary: Latest price reports across all stations (public)
 *     description: Powers the "latest prices" carousel on the homepage.
 *     tags: [Stations]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Max results (default 10, max 30)
 *     responses:
 *       200:
 *         description: Most recent price reports, newest first
 */
router.get('/recent-reports', getRecentReports);

router.get('/:id', getStationById);

/**
 * @openapi
 * /api/stations/{id}:
 *   put:
 *     summary: Update a station (admin only)
 *     tags: [Stations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               brand:
 *                 type: string
 *               address:
 *                 type: string
 *               lat:
 *                 type: number
 *               lng:
 *                 type: number
 *     responses:
 *       200:
 *         description: Station updated
 *       401:
 *         description: Missing or invalid token
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Station not found
 *   delete:
 *     summary: Delete a station and its price reports (admin only)
 *     tags: [Stations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Station deleted
 *       401:
 *         description: Missing or invalid token
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Station not found
 */
router.put('/:id', requireAuth, requireAdmin, updateStation);
router.delete('/:id', requireAuth, requireAdmin, deleteStation);

/**
 * @openapi
 * /api/stations/{id}/prices:
 *   post:
 *     summary: Report a fuel price or availability status
 *     tags: [Stations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Unique station ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PriceReport'
 *     responses:
 *       201:
 *         description: Price report submitted successfully
 *       400:
 *         description: Bad request / invalid input
 *       404:
 *         description: Station not found
 */
router.post('/:id/prices', reportPrice);

module.exports = router;
