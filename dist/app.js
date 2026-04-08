"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const env_1 = require("./config/env");
const errorHandler_middleware_1 = require("./middlewares/errorHandler.middleware");
const rateLimit_middleware_1 = require("./middlewares/rateLimit.middleware");
const v1_1 = __importDefault(require("./routes/v1"));
const iclock_routes_1 = __importDefault(require("./routes/iclock.routes"));
const cron_service_1 = require("./services/cron.service");
const app = (0, express_1.default)();
app.use(express_1.default.json());
// ADMS Protocol relies on raw text payloads rather than JSON
app.use('/iclock', express_1.default.text({ type: '*/*' }), iclock_routes_1.default);
// Main App Rate limiting (e.g. 100 requests per minute)
app.use((0, rateLimit_middleware_1.rateLimiter)({ windowMs: 60 * 1000, max: 100 }));
app.use('/api/v1', v1_1.default);
app.use(errorHandler_middleware_1.errorHandler);
const PORT = env_1.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    // Start cron jobs
    cron_service_1.cronService.start();
});
