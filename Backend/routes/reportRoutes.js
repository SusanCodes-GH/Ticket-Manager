import { Router } from 'express';
import * as reportController from '../controllers/reportController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { allowRoles } from '../middleware/roleMiddleware.js';

const router = Router();

router.use(authenticate);
router.use(allowRoles('admin'));

router.get('/dashboard', reportController.getDashboard);
router.get('/trend', reportController.getTicketTrend);

export default router;
