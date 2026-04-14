"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDepartment = exports.getDepartments = void 0;
const department_repository_1 = require("./department.repository");
const deptRepo = new department_repository_1.DepartmentRepository();
const getDepartments = async (req, res) => {
    try {
        const departments = await deptRepo.findMany();
        res.json({ success: true, data: departments });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.getDepartments = getDepartments;
const createDepartment = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ success: false, error: 'Name is required' });
        }
        const department = await deptRepo.create(name);
        res.status(201).json({ success: true, data: department });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
exports.createDepartment = createDepartment;
