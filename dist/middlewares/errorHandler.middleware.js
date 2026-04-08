"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const zod_1 = require("zod");
const errorHandler = (err, req, res, next) => {
    console.error(err.stack || err); // Basic logging
    if (err instanceof zod_1.ZodError) {
        return res.status(400).json({ error: 'Validation Error', details: err.errors });
    }
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        error: err.message || 'Internal Server Error',
    });
};
exports.errorHandler = errorHandler;
