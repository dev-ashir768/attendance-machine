import { Router } from 'express';
import { 
  createDevice, 
  getDevices, 
  getDeviceById, 
  updateDevice, 
  deleteDevice,
  getDeviceStats 
} from '../../modules/devices/device.controller';
import { authenticateJWT } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validateInput.middleware';
import { createDeviceSchema, updateDeviceSchema, deviceQuerySchema } from '../../modules/devices/device.schema';

const router = Router();

router.use(authenticateJWT); // Secure all device routes

router.post('/', validate(createDeviceSchema), createDevice);
router.get('/', validate(deviceQuerySchema), getDevices);
router.get('/stats', getDeviceStats);
router.get('/:deviceId', getDeviceById);
router.put('/:deviceId', validate(updateDeviceSchema), updateDevice);
router.delete('/:deviceId', deleteDevice);

export default router;
