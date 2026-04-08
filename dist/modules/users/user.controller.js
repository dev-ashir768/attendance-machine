"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignDevice = exports.getUsers = exports.createUser = void 0;
const user_repository_1 = require("./user.repository");
const userRepo = new user_repository_1.UserRepository();
const createUser = async (req, res) => {
    try {
        const user = await userRepo.create(req.body);
        res.status(201).json({ success: true, data: user });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
exports.createUser = createUser;
const getUsers = async (req, res) => {
    try {
        const users = await userRepo.findMany();
        res.json({ success: true, data: users });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
exports.getUsers = getUsers;
const assignDevice = async (req, res) => {
    try {
        const { userId } = req.params;
        const { deviceId } = req.body; // System device ID, not physical ZK ID
        const assignment = await userRepo.assignDevice(userId, deviceId);
        res.json({ success: true, data: assignment });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
exports.assignDevice = assignDevice;
