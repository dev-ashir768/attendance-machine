"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const iclock_controller_1 = require("../modules/iclock/iclock.controller");
const router = (0, express_1.Router)();
// The K60 machine hits this to verify the server is alive
router.get('/cdata', iclock_controller_1.handshake);
// The K60 machine pushes raw attendance logs here
router.post('/cdata', iclock_controller_1.receiveData);
// The K60 machine polls for commands 
router.get('/getrequest', iclock_controller_1.getRequest);
exports.default = router;
