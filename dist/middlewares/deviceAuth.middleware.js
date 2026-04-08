"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateDevice = void 0;
const env_1 = require("../config/env");
const authenticateDevice = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== env_1.env.API_KEY) {
        return res.status(401).json({ error: 'Unauthorized device' });
    }
    // Future: Could extract machine IP and validate against DB whitelist
    next();
};
exports.authenticateDevice = authenticateDevice;
