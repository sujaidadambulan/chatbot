/**
 * controllers/clientController.js
 * Admin endpoints to manage clients/tenants.
 */

'use strict';

const Client = require('../models/Client');

/**
 * Creates a new client.
 * Admin API key required in headers.
 */
exports.createClient = async (req, res, next) => {
    try {
        const { clientId, companyName, website } = req.body;

        if (!clientId || !companyName) {
            return res.status(400).json({ success: false, message: 'clientId and companyName are required' });
        }

        const existing = await Client.findOne({ clientId });
        if (existing) {
            return res.status(409).json({ success: false, message: 'clientId already exists' });
        }

        const newClient = await Client.create({
            clientId,
            companyName,
            website
        });

        res.status(201).json({ success: true, data: newClient });
    } catch (error) {
        next(error);
    }
};

/**
 * Gets a client by ID.
 */
exports.getClient = async (req, res, next) => {
    try {
        const client = await Client.findOne({ clientId: req.params.clientId });
        if (!client) {
            return res.status(404).json({ success: false, message: 'Client not found' });
        }
        res.status(200).json({ success: true, data: client });
    } catch (error) {
        next(error);
    }
};

/**
 * Gets all active clients.
 */
exports.getAllClients = async (req, res, next) => {
    try {
        const clients = await Client.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: clients });
    } catch (error) {
        next(error);
    }
};

/**
 * Updates an existing client details.
 */
exports.updateClient = async (req, res, next) => {
    try {
        const { companyName, website, isActive } = req.body;
        const updatedClient = await Client.findOneAndUpdate(
            { clientId: req.params.clientId },
            { companyName, website, isActive },
            { new: true, runValidators: true }
        );

        if (!updatedClient) {
            return res.status(404).json({ success: false, message: 'Client not found' });
        }

        res.status(200).json({ success: true, data: updatedClient });
    } catch (error) {
        next(error);
    }
};

/**
 * Deletes a client and all their nested knowledge base entries.
 */
exports.deleteClient = async (req, res, next) => {
    try {
        const clientId = req.params.clientId;

        // Find and delete the client
        const deletedClient = await Client.findOneAndDelete({ clientId });
        if (!deletedClient) {
            return res.status(404).json({ success: false, message: 'Client not found' });
        }

        // cascade delete their knowledge chunks
        const KnowledgeBase = require('../models/KnowledgeBase');
        const deletedChunks = await KnowledgeBase.deleteMany({ clientId });

        res.status(200).json({
            success: true,
            message: 'Client and associated knowledge base deleted.',
            chunksDeleted: deletedChunks.deletedCount
        });
    } catch (error) {
        next(error);
    }
};
