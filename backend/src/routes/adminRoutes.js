const express = require('express');
const router = express.Router();
const { listReports, deleteReport, getStats } = require('../controllers/adminController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

// Every route below requires a valid admin JWT.
router.use(requireAuth, requireAdmin);

/**
 * @openapi
 * /api/admin/stats:
 *   get:
 *     summary: Dashboard summary stats (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Station/report counts
 *       401:
 *         description: Missing or invalid token
 *       403:
 *         description: Admin access required
 */
router.get('/stats', getStats);

/**
 * @openapi
 * /api/admin/reports:
 *   get:
 *     summary: List all price reports, most recent first (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Max results per page (default 50, max 200)
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Pagination offset
 *     responses:
 *       200:
 *         description: Paginated list of price reports with their station
 *       401:
 *         description: Missing or invalid token
 *       403:
 *         description: Admin access required
 */
router.get('/reports', listReports);

/**
 * @openapi
 * /api/admin/reports/{id}:
 *   delete:
 *     summary: Delete a single price report (admin only)
 *     tags: [Admin]
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
 *         description: Report deleted
 *       401:
 *         description: Missing or invalid token
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Report not found
 */
router.delete('/reports/:id', deleteReport);

module.exports = router;
