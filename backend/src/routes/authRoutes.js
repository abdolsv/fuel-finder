const express = require('express');
const router = express.Router();
const { login, me } = require('../controllers/authController');
const { requireAuth } = require('../middleware/authMiddleware');

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Log in as an admin
 *     description: >
 *       Admin accounts are created via the seed script, not through this
 *       API. This endpoint only exchanges valid credentials for a JWT.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@fuelfinder.ng
 *               password:
 *                 type: string
 *                 example: your-password
 *     responses:
 *       200:
 *         description: Login successful, returns a JWT
 *       400:
 *         description: Missing email or password
 *       401:
 *         description: Invalid email or password
 */
router.post('/login', login);

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     summary: Get the currently authenticated admin
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The decoded token payload for the current user
 *       401:
 *         description: Missing or invalid token
 */
router.get('/me', requireAuth, me);

module.exports = router;
