"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const attendance_routes_1 = __importDefault(require("./attendance.routes"));
const user_routes_1 = __importDefault(require("./user.routes"));
const devices_routes_1 = __importDefault(require("./devices.routes"));
const router = (0, express_1.Router)();
router.use('/attendance', attendance_routes_1.default);
router.use('/users', user_routes_1.default);
router.use('/devices', devices_routes_1.default);
exports.default = router;
