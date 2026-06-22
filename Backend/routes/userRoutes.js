import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { allowRoles } from '../middleware/roleMiddleware.js';

const router = Router();

router.use(authenticate);

// Self-service routes (any authenticated user)
router.get('/settings', userController.getSettings);
router.put('/settings', userController.updateSettings);
router.put('/profile', userController.updateOwnProfile);

// Admin-only routes
router.use(allowRoles('admin'));

router.get('/', userController.getUsers);
router.get('/:id', userController.getUser);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

export default router;
