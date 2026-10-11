export type UserRole = 'PATIENT' | 'DOCTOR' | 'HOSPITAL_ADMIN' | 'PLATFORM_ADMIN';

export type AppointmentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'RESCHEDULED'
  | 'COMPLETED';

export type AvailabilityStatus =
  | 'AVAILABLE'
  | 'FEW_SLOTS_LEFT'
  | 'FULLY_BOOKED'
  | 'ON_LEAVE'
  | 'NOT_AVAILABLE'
  | 'SCHEDULE_NOT_AVAILABLE';

export type DayOfWeek =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  avatarUrl?: string | null;
  createdAt: string;
}

export interface MedicalSpecialty {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName?: string;
  doctorCount?: number;
}

export interface HospitalSummary {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  imageUrl?: string | null;
  isVerified: boolean;
  isDemo: boolean;
  departments?: string[];
  doctorCount?: number;
}

export interface DoctorHospitalAffiliation {
  id: string;
  doctorId: string;
  hospitalId: string;
  consultationFee: number;
  hospital: HospitalSummary;
}

export interface DoctorScheduleSlotConfig {
  id: string;
  doctorId: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  slotDurationMinutes: number;
  breakStartTime?: string | null; // HH:mm
  breakEndTime?: string | null;   // HH:mm
  isActive: boolean;
}

export interface ScheduleException {
  id: string;
  doctorId: string;
  date: string; // YYYY-MM-DD
  reason: string;
  isLeave: boolean;
}

export interface Slot {
  time: string; // "09:00 AM", "09:30 AM"
  datetime: string; // ISO string
  isAvailable: boolean;
  reason?: string;
}

export interface DoctorAvailability {
  date: string; // YYYY-MM-DD
  status: AvailabilityStatus;
  statusLabel: string;
  totalSlots: number;
  availableSlots: number;
  slots: Slot[];
}

export interface DoctorSummary {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string | null;
  avatarUrl?: string | null;
  specialty: string;
  specialties: MedicalSpecialty[];
  qualifications: string;
  experienceYears: number;
  bio: string;
  city: string;
  state: string;
  consultationFee: number;
  isVerified: boolean;
  isDemo: boolean;
  hospitals: HospitalSummary[];
  nextAvailableDate?: string | null;
  availabilityStatus?: AvailabilityStatus;
}

export interface Appointment {
  id: string;
  bookingReference: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  patientPhone?: string | null;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  hospitalId: string;
  hospitalName: string;
  hospitalAddress: string;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // "10:30 AM"
  status: AppointmentStatus;
  consultationFee: number;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InAppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'BOOKING_CONFIRMED' | 'BOOKING_CANCELLED' | 'BOOKING_RESCHEDULED' | 'SCHEDULE_CHANGED' | 'SYSTEM';
  isRead: boolean;
  relatedAppointmentId?: string | null;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: UserSummary;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
