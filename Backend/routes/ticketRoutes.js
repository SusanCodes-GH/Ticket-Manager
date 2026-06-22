import { Router } from 'express';
import * as ticketController from '../controllers/ticketController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { allowRoles } from '../middleware/roleMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/', ticketController.getTickets);
router.get('/unassigned', allowRoles('admin'), ticketController.getUnassignedTickets);
router.get('/:id', ticketController.getTicket);

router.post('/', ticketController.createTicket);
router.put('/:id', ticketController.updateTicket);
router.delete('/:id', allowRoles('admin'), ticketController.deleteTicket);
router.post('/:id/assign', allowRoles('admin'), ticketController.assignTicket);
router.post('/:id/status', ticketController.updateStatus);

router.get('/:id/comments', ticketController.getTicketComments);
router.post('/:id/comments', ticketController.addComment);

export default router;
