import { Router } from 'express';
import { getAllDoctors, getDoctorById, getDoctorAvailability } from '../controllers/doctor.controller';

const router = Router();

router.get('/', getAllDoctors);
router.get('/:id', getDoctorById);
router.get('/:id/availability', getDoctorAvailability);

export default router;
