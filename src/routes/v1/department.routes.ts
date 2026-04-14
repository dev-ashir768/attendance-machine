import { Router } from 'express';
import * as departmentController from '../../modules/departments/department.controller';

const router = Router();

router.get('/', departmentController.getDepartments);
router.post('/', departmentController.createDepartment);

export default router;
