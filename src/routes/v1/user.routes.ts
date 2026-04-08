import { Router } from 'express';
import { createUser, login, getUsers, assignDevice } from '../../modules/users/user.controller';
import { authenticateJWT } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validateInput.middleware';
import { createUserSchema, loginSchema, assignDeviceSchema } from '../../modules/users/user.schema';

const router = Router();

// Public login endpoint (no auth required)
router.post('/login', validate(loginSchema), login);

router.use(authenticateJWT); // Secure all other user routes

router.get('/', getUsers);
router.post('/', validate(createUserSchema), createUser);
router.post('/:userId/devices', validate(assignDeviceSchema), assignDevice);

export default router;
