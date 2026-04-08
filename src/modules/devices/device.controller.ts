import { Request, Response } from 'express';
import { DeviceRepository } from './device.repository';

const deviceRepo = new DeviceRepository();

export const createDevice = async (req: Request, res: Response) => {
  try {
    const deviceData = req.body;

    // Check if device already exists
    const existing = await deviceRepo.findByDeviceId(deviceData.deviceId);
    if (existing) {
      return res.status(400).json({ success: false, error: 'Device with this ID already exists' });
    }

    const device = await deviceRepo.create({
      deviceId: deviceData.deviceId,
      name: deviceData.name,
      ipAddress: deviceData.ipAddress,
      location: deviceData.location,
      isActive: true,
    });

    res.status(201).json({ success: true, data: device });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getDevices = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, isActive } = req.query as any;
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const isActiveFilter = isActive === 'true' ? true : isActive === 'false' ? false : undefined;

    const devices = await deviceRepo.findMany(skip, limitNum, isActiveFilter);
    const total = await deviceRepo.countTotal();
    const totalPages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      data: devices,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalRecords: total,
        totalPages,
      },
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getDeviceById = async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;
    const device = await deviceRepo.findById(deviceId);

    if (!device) {
      return res.status(404).json({ success: false, error: 'Device not found' });
    }

    res.json({ success: true, data: device });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const updateDevice = async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;
    const updateData = req.body;

    const device = await deviceRepo.update(deviceId, updateData);
    res.json({ success: true, data: device });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'Device not found' });
    }
    res.status(400).json({ success: false, error: error.message });
  }
};

export const deleteDevice = async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;
    
    const device = await deviceRepo.findById(deviceId);
    if (!device) {
      return res.status(404).json({ success: false, error: 'Device not found' });
    }

    // Check if device has active users or logs
    if (device.users.length > 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Cannot delete device with assigned users. Unassign users first.' 
      });
    }

    await deviceRepo.delete(deviceId);
    res.json({ success: true, message: 'Device deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getDeviceStats = async (req: Request, res: Response) => {
  try {
    const total = await deviceRepo.countTotal();
    const active = await deviceRepo.countActive();
    const inactive = total - active;

    res.json({
      success: true,
      data: {
        total,
        active,
        inactive,
      },
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};
