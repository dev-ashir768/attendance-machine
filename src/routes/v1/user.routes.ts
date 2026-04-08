import { Router } from 'express';
import { createUser, getUsers, assignDevice } from '../../modules/users/user.controller';
import { authenticateJWT } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validateInput.middleware';
import { createUserSchema, assignDeviceSchema } from '../../modules/users/user.schema';

const router = Router();

router.use(authenticateJWT); // Secure all user routes

router.get('/', getUsers);
router.post('/', validate(createUserSchema), createUser);
router.post('/:userId/devices', validate(assignDeviceSchema), assignDevice);

export default router;
