import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserRepository } from "./user.repository";
import { env } from "../../config/env";
import { prisma } from "../../utils/prisma";

const userRepo = new UserRepository();

export const createUser = async (req: Request, res: Response) => {
  try {
    const userData = req.body;

    // Hash password if provided
    if (userData.password) {
      const saltRounds = 10;
      userData.password = await bcrypt.hash(userData.password, saltRounds);
    }

    const user = await userRepo.create(userData);
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    res.status(201).json({ success: true, data: userWithoutPassword });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    const user = await userRepo.findByUsername(username);
    if (!user || !user.password) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        iat: Math.floor(Date.now() / 1000),
      },
      env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      message: "Login successful",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Login failed" });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await userRepo.findMany();
    // Remove passwords from response
    const usersWithoutPasswords = users.map((user) => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    res.json({ success: true, data: usersWithoutPasswords });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    // Check if user exists
    const user = await userRepo.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Hash password if provided
    if (updateData.password) {
      const saltRounds = 10;
      updateData.password = await bcrypt.hash(updateData.password, saltRounds);
    }

    const updatedUser = await userRepo.update(userId, updateData);
    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser;
    res.json({ success: true, data: userWithoutPassword });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const assignDevice = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { deviceId } = req.body; // System device ID, not physical ZK ID
    const assignment = await userRepo.assignDevice(userId, deviceId);
    res.json({ success: true, data: assignment });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getStatistics = async (req: Request, res: Response) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalDepartments = await prisma.department.count();
    const totalDesignations = await prisma.designation.count();

    const usersPerDepartmentRaw = await prisma.user.groupBy({
      by: ["departmentId"],
      _count: { id: true },
    });

    const usersPerDesignationRaw = await prisma.user.groupBy({
      by: ["designationId"],
      _count: { id: true },
    });

    const departments = await prisma.department.findMany();
    const designations = await prisma.designation.findMany();

    const usersPerDepartment = usersPerDepartmentRaw.map((item) => {
      const dept = departments.find((d) => d.id === item.departmentId);
      return {
        departmentId: item.departmentId,
        departmentName: dept ? dept.name : "Unknown/Unassigned",
        count: item._count.id,
      };
    });

    const usersPerDesignation = usersPerDesignationRaw.map((item) => {
      const desig = designations.find((d) => d.id === item.designationId);
      return {
        designationId: item.designationId,
        designationName: desig ? desig.name : "Unknown/Unassigned",
        count: item._count.id,
      };
    });

    res.json({
      success: true,
      data: {
        totals: {
          users: totalUsers,
          departments: totalDepartments,
          designations: totalDesignations,
        },
        usersPerDepartment,
        usersPerDesignation,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
