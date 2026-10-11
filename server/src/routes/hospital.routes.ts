import { Router } from 'express';
import { getAllHospitals, getHospitalById, createHospital } from '../controllers/hospital.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', getAllHospitals);
router.get('/:id', getHospitalById);
router.post('/', authenticate, authorize('HOSPITAL_ADMIN', 'PLATFORM_ADMIN'), createHospital);

export default router;
