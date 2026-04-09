"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../../modules/users/user.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const validateInput_middleware_1 = require("../../middlewares/validateInput.middleware");
const user_schema_1 = require("../../modules/users/user.schema");
const router = (0, express_1.Router)();
// Public login endpoint (no auth required)
router.post('/login', (0, validateInput_middleware_1.validate)(user_schema_1.loginSchema), user_controller_1.login);
router.use(auth_middleware_1.authenticateJWT); // Secure all other user routes
router.get('/', user_controller_1.getUsers);
router.post('/', (0, validateInput_middleware_1.validate)(user_schema_1.createUserSchema), user_controller_1.createUser);
router.put('/:userId', (0, validateInput_middleware_1.validate)(user_schema_1.updateUserSchema), user_controller_1.updateUser);
router.post('/:userId/devices', (0, validateInput_middleware_1.validate)(user_schema_1.assignDeviceSchema), user_controller_1.assignDevice);
exports.default = router;
