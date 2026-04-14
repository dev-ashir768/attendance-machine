"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDesignation = exports.getDesignations = void 0;
const prisma_1 = require("../../utils/prisma");
const getDesignations = async (req, res) => {
    try {
        const designations = await prisma_1.prisma.designation.findMany({
            orderBy: { name: 'asc' }
        });
        res.json({ success: true, data: designations });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.getDesignations = getDesignations;
const createDesignation = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ success: false, error: 'Name is required' });
        }
        const designation = await prisma_1.prisma.designation.create({
            data: { name }
        });
        res.status(201).json({ success: true, data: designation });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
exports.createDesignation = createDesignation;
