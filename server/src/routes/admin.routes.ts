import { Router } from 'express';
import {
  getPlatformStats,
  getAllUsers,
  verifyDoctor,
  verifyHospital,
  getAuditLogs,
} from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.use(authorize('PLATFORM_ADMIN'));

router.get('/stats', getPlatformStats);
router.get('/users', getAllUsers);
router.patch('/doctors/:id/verify', verifyDoctor);
router.patch('/hospitals/:id/verify', verifyHospital);
router.get('/audit-logs', getAuditLogs);

export default router;
