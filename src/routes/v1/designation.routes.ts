import { Router } from 'express';
import * as designationController from '../../modules/designations/designation.controller';

const router = Router();

router.get('/', designationController.getDesignations);
router.post('/', designationController.createDesignation);

export default router;
