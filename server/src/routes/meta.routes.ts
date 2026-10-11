import { Router } from 'express';
import { getCities, getSpecialties } from '../controllers/meta.controller';

const router = Router();

router.get('/cities', getCities);
router.get('/specialties', getSpecialties);

export default router;
