"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../../modules/users/user.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const validateInput_middleware_1 = require("../../middlewares/validateInput.middleware");
const user_schema_1 = require("../../modules/users/user.schema");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticateJWT); // Secure all user routes
router.get('/', user_controller_1.getUsers);
router.post('/', (0, validateInput_middleware_1.validate)(user_schema_1.createUserSchema), user_controller_1.createUser);
router.post('/:userId/devices', (0, validateInput_middleware_1.validate)(user_schema_1.assignDeviceSchema), user_controller_1.assignDevice);
exports.default = router;
