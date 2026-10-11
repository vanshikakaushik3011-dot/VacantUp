import { Router } from 'express';
import {
  createAppointment,
  getMyAppointments,
  getAppointmentById,
  cancelAppointment,
  rescheduleAppointment,
} from '../controllers/appointment.controller';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import {
  createAppointmentSchema,
  cancelAppointmentSchema,
  rescheduleAppointmentSchema,
} from '@vacantup/shared';

const router = Router();

router.post('/', authenticate, validateBody(createAppointmentSchema), createAppointment);
router.get('/my', authenticate, getMyAppointments);
router.get('/:id', authenticate, getAppointmentById);
router.post('/:id/cancel', authenticate, validateBody(cancelAppointmentSchema), cancelAppointment);
router.post('/:id/reschedule', authenticate, validateBody(rescheduleAppointmentSchema), rescheduleAppointment);

export default router;
