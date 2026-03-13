/**
 * routes/clientRoutes.js
 * Express router for managing clients.
 */

'use strict';

const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');

/**
 * Middleware to check admin API key
 */
const requireAdmin = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
        return res.status(401).json({ success: false, message: 'Unauthorized. Invalid API Key.' });
    }
    next();
};

// Protect all client routes
router.use(requireAdmin);

// POST /api/clients
router.post('/', clientController.createClient);
// GET /api/clients
router.get('/', clientController.getAllClients);
// GET /api/clients/:clientId
router.get('/:clientId', clientController.getClient);
// PUT /api/clients/:clientId
router.put('/:clientId', clientController.updateClient);
// DELETE /api/clients/:clientId
router.delete('/:clientId', clientController.deleteClient);

module.exports = router;
