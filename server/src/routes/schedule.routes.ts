import { Router } from 'express';
import {
  getDoctorSchedules,
  updateDoctorSchedule,
  addScheduleException,
  deleteScheduleException,
} from '../controllers/schedule.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { scheduleSlotConfigSchema, leaveExceptionSchema } from '@vacantup/shared';

const router = Router();

router.get('/:doctorId', getDoctorSchedules);
router.post(
  '/:doctorId',
  authenticate,
  authorize('DOCTOR', 'HOSPITAL_ADMIN', 'PLATFORM_ADMIN'),
  validateBody(scheduleSlotConfigSchema),
  updateDoctorSchedule
);
router.post(
  '/:doctorId/exception',
  authenticate,
  authorize('DOCTOR', 'HOSPITAL_ADMIN', 'PLATFORM_ADMIN'),
  validateBody(leaveExceptionSchema),
  addScheduleException
);
router.delete(
  '/exception/:id',
  authenticate,
  authorize('DOCTOR', 'HOSPITAL_ADMIN', 'PLATFORM_ADMIN'),
  deleteScheduleException
);

export default router;
