"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignDevice = exports.updateUser = exports.getUsers = exports.login = exports.createUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_repository_1 = require("./user.repository");
const env_1 = require("../../config/env");
const userRepo = new user_repository_1.UserRepository();
const createUser = async (req, res) => {
    try {
        const userData = req.body;
        // Hash password if provided
        if (userData.password) {
            const saltRounds = 10;
            userData.password = await bcrypt_1.default.hash(userData.password, saltRounds);
        }
        const user = await userRepo.create(userData);
        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        res.status(201).json({ success: true, data: userWithoutPassword });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
exports.createUser = createUser;
const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await userRepo.findByUsername(username);
        if (!user || !user.password) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }
        const isValidPassword = await bcrypt_1.default.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({
            userId: user.id,
            role: user.role,
            iat: Math.floor(Date.now() / 1000)
        }, env_1.env.JWT_SECRET, { expiresIn: '24h' });
        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                username: user.username,
                name: user.name,
                email: user.email,
                role: user.role
            },
            message: 'Login successful'
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Login failed' });
    }
};
exports.login = login;
const getUsers = async (req, res) => {
    try {
        const users = await userRepo.findMany();
        // Remove passwords from response
        const usersWithoutPasswords = users.map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });
        res.json({ success: true, data: usersWithoutPasswords });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
exports.getUsers = getUsers;
const updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const updateData = req.body;
        // Check if user exists
        const user = await userRepo.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        // Hash password if provided
        if (updateData.password) {
            const saltRounds = 10;
            updateData.password = await bcrypt_1.default.hash(updateData.password, saltRounds);
        }
        const updatedUser = await userRepo.update(userId, updateData);
        // Remove password from response
        const { password, ...userWithoutPassword } = updatedUser;
        res.json({ success: true, data: userWithoutPassword });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
exports.updateUser = updateUser;
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
