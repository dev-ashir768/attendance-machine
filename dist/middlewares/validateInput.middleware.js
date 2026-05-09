"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const validate = (schema) => {
    return async (req, res, next) => {
        try {
            const validatedData = await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            // Assign back to request to preserve transformations
            req.body = validatedData.body || req.body;
            req.query = validatedData.query || req.query;
            req.params = validatedData.params || req.params;
            return next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                return res.status(400).json({ error: 'Validation Error', details: error.errors });
            }
            return res.status(400).json({ error: 'Validation Error' });
        }
    };
};
exports.validate = validate;
