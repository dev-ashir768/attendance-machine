"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const device_controller_1 = require("../../modules/devices/device.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const validateInput_middleware_1 = require("../../middlewares/validateInput.middleware");
const device_schema_1 = require("../../modules/devices/device.schema");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticateJWT); // Secure all device routes
router.post('/', (0, validateInput_middleware_1.validate)(device_schema_1.createDeviceSchema), device_controller_1.createDevice);
router.get('/', (0, validateInput_middleware_1.validate)(device_schema_1.deviceQuerySchema), device_controller_1.getDevices);
router.get('/stats', device_controller_1.getDeviceStats);
router.get('/:deviceId', device_controller_1.getDeviceById);
router.put('/:deviceId', (0, validateInput_middleware_1.validate)(device_schema_1.updateDeviceSchema), device_controller_1.updateDevice);
router.delete('/:deviceId', device_controller_1.deleteDevice);
exports.default = router;
