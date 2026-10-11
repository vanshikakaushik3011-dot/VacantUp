import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['PATIENT', 'DOCTOR', 'HOSPITAL_ADMIN', 'PLATFORM_ADMIN']).default('PATIENT'),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const createAppointmentSchema = z.object({
  doctorId: z.string().min(1, 'Doctor ID is required'),
  hospitalId: z.string().min(1, 'Hospital ID is required'),
  appointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'),
  appointmentTime: z.string().min(1, 'Appointment time is required'),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
});

export const rescheduleAppointmentSchema = z.object({
  appointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'),
  appointmentTime: z.string().min(1, 'Appointment time is required'),
  reason: z.string().max(300).optional(),
});

export const cancelAppointmentSchema = z.object({
  reason: z.string().max(300).optional(),
});

export const doctorFilterSchema = z.object({
  city: z.string().optional(),
  specialty: z.string().optional(),
  query: z.string().optional(),
  hospitalId: z.string().optional(),
  date: z.string().optional(),
  maxFee: z.coerce.number().optional(),
});

export const scheduleSlotConfigSchema = z.object({
  dayOfWeek: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Start time must be HH:mm'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'End time must be HH:mm'),
  slotDurationMinutes: z.number().int().min(10).max(60).default(20),
  breakStartTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional().nullable(),
  breakEndTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional().nullable(),
  isActive: z.boolean().default(true),
});

export const leaveExceptionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  reason: z.string().min(2, 'Reason is required'),
  isLeave: z.boolean().default(true),
});
