import bcrypt from 'bcryptjs';

export interface DbUser {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: 'PATIENT' | 'DOCTOR' | 'HOSPITAL_ADMIN' | 'PLATFORM_ADMIN';
  phone?: string | null;
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DbDoctorProfile {
  id: string;
  userId: string;
  qualifications: string;
  experienceYears: number;
  bio: string;
  consultationFee: number;
  isVerified: boolean;
  isDemo: boolean;
  city: string;
  state: string;
  createdAt: string;
  updatedAt: string;
}

export interface DbHospital {
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
  createdAt: string;
  updatedAt: string;
}

export interface DbDoctorSchedule {
  id: string;
  doctorId: string;
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  startTime: string; // e.g. "09:00"
  endTime: string;   // e.g. "17:00"
  slotDurationMinutes: number;
  breakStartTime?: string | null;
  breakEndTime?: string | null;
  isActive: boolean;
}

export interface DbScheduleException {
  id: string;
  doctorId: string;
  date: string; // YYYY-MM-DD
  reason: string;
  isLeave: boolean;
}

export interface DbAppointment {
  id: string;
  bookingReference: string;
  patientId: string;
  doctorId: string;
  hospitalId: string;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // "09:00 AM"
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'RESCHEDULED' | 'COMPLETED';
  consultationFee: number;
  notes?: string | null;
  cancellationReason?: string | null;
  rescheduledFromId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DbNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'BOOKING_CONFIRMED' | 'BOOKING_CANCELLED' | 'BOOKING_RESCHEDULED' | 'SCHEDULE_CHANGED' | 'SYSTEM';
  isRead: boolean;
  relatedAppointmentId?: string | null;
  createdAt: string;
}

export interface DbAuditLog {
  id: string;
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  details?: string | null;
  ipAddress?: string | null;
  createdAt: string;
}

export interface DbVerificationRequest {
  id: string;
  entityType: string;
  entityId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedById: string;
  notes?: string | null;
  reviewedById?: string | null;
  createdAt: string;
  updatedAt: string;
}

class InMemStore {
  users: DbUser[] = [];
  doctors: DbDoctorProfile[] = [];
  hospitals: DbHospital[] = [];
  specialties: { id: string; name: string; slug: string; description: string; iconName: string }[] = [];
  doctorSpecialties: { id: string; doctorId: string; specialtyId: string }[] = [];
  affiliations: { id: string; doctorId: string; hospitalId: string; consultationFee: number }[] = [];
  schedules: DbDoctorSchedule[] = [];
  exceptions: DbScheduleException[] = [];
  appointments: DbAppointment[] = [];
  notifications: DbNotification[] = [];
  verificationRequests: DbVerificationRequest[] = [];
  auditLogs: DbAuditLog[] = [];

  constructor() {
    this.seed();
  }

  seed() {
    const salt = bcrypt.genSaltSync(10);
    const patientHash = bcrypt.hashSync('Patient@123', salt);
    const doctorHash = bcrypt.hashSync('Doctor@123', salt);
    const hospitalHash = bcrypt.hashSync('Hospital@123', salt);
    const adminHash = bcrypt.hashSync('Admin@123', salt);

    // 1. Specialties
    this.specialties = [
      { id: 'spec-derm', name: 'Dermatology', slug: 'dermatology', description: 'Skin, hair, nail disorders, cosmetic treatments', iconName: 'Sparkles' },
      { id: 'spec-cardio', name: 'Cardiology', slug: 'cardiology', description: 'Heart health, ECG, echocardiography, hypertension', iconName: 'HeartPulse' },
      { id: 'spec-pedia', name: 'Pediatrics', slug: 'pediatrics', description: 'Infant, child, and adolescent healthcare and vaccination', iconName: 'Baby' },
      { id: 'spec-ortho', name: 'Orthopedics', slug: 'orthopedics', description: 'Bones, joints, sports injuries, spine care', iconName: 'Bone' },
      { id: 'spec-neuro', name: 'Neurology', slug: 'neurology', description: 'Brain, nerves, migraine, neurological conditions', iconName: 'Brain' },
      { id: 'spec-genmed', name: 'General Medicine', slug: 'general-medicine', description: 'Primary consultations, viral fevers, chronic illness', iconName: 'Stethoscope' },
      { id: 'spec-gynae', name: 'Gynecology & Obstetrics', slug: 'gynecology', description: "Women's wellness, prenatal, maternal care", iconName: 'Activity' },
      { id: 'spec-ent', name: 'ENT', slug: 'ent', description: 'Ear, nose, throat, sinusitis, hearing health', iconName: 'Ear' },
      { id: 'spec-ophthal', name: 'Ophthalmology', slug: 'ophthalmology', description: 'Eye exams, cataracts, vision correction', iconName: 'Eye' },
      { id: 'spec-dental', name: 'Dentistry', slug: 'dentistry', description: 'Oral healthcare, root canals, dental alignment', iconName: 'Smile' },
    ];

    // 2. Hospitals
    this.hospitals = [
      {
        id: 'hosp-amritdhara',
        name: 'Amritdhara myHospital',
        slug: 'amritdhara-myhospital-karnal',
        address: 'Chaura Bazar Road, Model Town',
        city: 'Karnal',
        state: 'Haryana',
        pincode: '132001',
        phone: '+91 184 220 5000',
        email: 'info@amritdharahospital.com',
        imageUrl: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800&auto=format&fit=crop&q=80',
        isVerified: true,
        isDemo: true,
        departments: ['Dermatology', 'Pediatrics', 'Cardiology', 'Orthopedics', 'General Medicine'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'hosp-civil-karnal',
        name: 'Civil Hospital Karnal',
        slug: 'civil-hospital-karnal',
        address: 'Mall Road, Old Char Chaman',
        city: 'Karnal',
        state: 'Haryana',
        pincode: '132001',
        phone: '+91 184 225 1100',
        email: 'civilhospital.karnal@haryanahealth.gov.in',
        imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&auto=format&fit=crop&q=80',
        isVerified: true,
        isDemo: true,
        departments: ['Orthopedics', 'General Medicine', 'Dermatology', 'ENT'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'hosp-max-delhi',
        name: 'Max Super Speciality Hospital',
        slug: 'max-hospital-saket',
        address: '1, 2 Press Enclave Marg, Saket',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110017',
        phone: '+91 11 2651 5050',
        email: 'contact@maxhealthcare.com',
        imageUrl: 'https://images.unsplash.com/photo-1512678080530-7760d81faba6?w=800&auto=format&fit=crop&q=80',
        isVerified: true,
        isDemo: true,
        departments: ['Cardiology', 'Neurology', 'Oncology', 'Orthopedics'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'hosp-medanta-ggn',
        name: 'Medanta - The Medicity',
        slug: 'medanta-gurugram',
        address: 'Sector 38, Near Rajiv Chowk',
        city: 'Gurugram',
        state: 'Haryana',
        pincode: '122001',
        phone: '+91 124 414 1414',
        email: 'info@medanta.org',
        imageUrl: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&auto=format&fit=crop&q=80',
        isVerified: true,
        isDemo: true,
        departments: ['Gynecology', 'Cardiology', 'Neurology', 'Robotic Surgery'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'hosp-manipal-blr',
        name: 'Manipal Hospital',
        slug: 'manipal-hospital-hal',
        address: '98 HAL Airport Road, Kodihalli',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560017',
        phone: '+91 80 2502 4444',
        email: 'info@manipalhospitals.com',
        imageUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&auto=format&fit=crop&q=80',
        isVerified: true,
        isDemo: true,
        departments: ['Neurology', 'Nephrology', 'Dermatology'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    // 3. Users
    this.users = [
      {
        id: 'usr-admin',
        email: 'admin@vacantup.com',
        passwordHash: adminHash,
        name: 'VacantUp Super Admin',
        role: 'PLATFORM_ADMIN',
        phone: '+91 99999 00000',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'usr-patient',
        email: 'patient@vacantup.com',
        passwordHash: patientHash,
        name: 'Rahul Verma',
        role: 'PATIENT',
        phone: '+91 98765 43210',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'usr-doc-rajesh',
        email: 'doctor@vacantup.com',
        passwordHash: doctorHash,
        name: 'Dr. Rajesh Sharma',
        role: 'DOCTOR',
        phone: '+91 98120 11223',
        avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'usr-doc-sunita',
        email: 'dr.sunita@vacantup.com',
        passwordHash: doctorHash,
        name: 'Dr. Sunita Malik',
        role: 'DOCTOR',
        phone: '+91 98120 22334',
        avatarUrl: 'https://images.unsplash.com/photo-1594824813571-638f02614d3f?w=200&auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'usr-doc-vikram',
        email: 'dr.vikram@vacantup.com',
        passwordHash: doctorHash,
        name: 'Dr. Vikram Patel',
        role: 'DOCTOR',
        phone: '+91 98120 33445',
        avatarUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'usr-doc-ananya',
        email: 'dr.ananya@vacantup.com',
        passwordHash: doctorHash,
        name: 'Dr. Ananya Verma',
        role: 'DOCTOR',
        phone: '+91 98110 44556',
        avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'usr-doc-neha',
        email: 'dr.neha@vacantup.com',
        passwordHash: doctorHash,
        name: 'Dr. Neha Gupta',
        role: 'DOCTOR',
        phone: '+91 98124 55667',
        avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'usr-hosp-admin',
        email: 'hospital@vacantup.com',
        passwordHash: hospitalHash,
        name: 'Suresh Singhal (Hospital Admin)',
        role: 'HOSPITAL_ADMIN',
        phone: '+91 98120 99887',
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    // 4. Doctor Profiles
    this.doctors = [
      {
        id: 'doc-rajesh',
        userId: 'usr-doc-rajesh',
        qualifications: 'MBBS, MD (Dermatology, Venereology & Leprosy - AIIMS)',
        experienceYears: 12,
        bio: 'Senior Consultant Dermatologist specializing in clinical dermatology, acne treatments, laser procedures, and pediatric skin care.',
        consultationFee: 600,
        isVerified: true,
        isDemo: true,
        city: 'Karnal',
        state: 'Haryana',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'doc-sunita',
        userId: 'usr-doc-sunita',
        qualifications: 'MBBS, DCH, DNB (Pediatrics)',
        experienceYears: 9,
        bio: 'Dedicated Pediatrician with compassionate care for newborns, child immunization, developmental tracking, and pediatric emergency care.',
        consultationFee: 500,
        isVerified: true,
        isDemo: true,
        city: 'Karnal',
        state: 'Haryana',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'doc-vikram',
        userId: 'usr-doc-vikram',
        qualifications: 'MBBS, MS (Orthopedics - PGI)',
        experienceYears: 14,
        bio: 'Orthopedic surgeon with extensive expertise in joint reconstruction, arthroscopy, sports injuries, and conservative fracture management.',
        consultationFee: 750,
        isVerified: true,
        isDemo: true,
        city: 'Karnal',
        state: 'Haryana',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'doc-ananya',
        userId: 'usr-doc-ananya',
        qualifications: 'MBBS, MD (Internal Medicine), DM (Cardiology - AIIMS)',
        experienceYears: 15,
        bio: 'Distinguished Cardiologist specializing in preventive cardiology, coronary interventions, echocardiography, and heart failure management.',
        consultationFee: 1200,
        isVerified: true,
        isDemo: true,
        city: 'New Delhi',
        state: 'Delhi',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'doc-neha',
        userId: 'usr-doc-neha',
        qualifications: 'MBBS, MS (OBG), Fellowship in Reproductive Medicine',
        experienceYears: 11,
        bio: 'Gynecologist and Obstetrician focused on high-risk pregnancies, adolescent gynaecology, PCOS management, and laparoscopic surgery.',
        consultationFee: 900,
        isVerified: true,
        isDemo: true,
        city: 'Gurugram',
        state: 'Haryana',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    // 5. Doctor Specialties
    this.doctorSpecialties = [
      { id: 'ds-1', doctorId: 'doc-rajesh', specialtyId: 'spec-derm' },
      { id: 'ds-2', doctorId: 'doc-sunita', specialtyId: 'spec-pedia' },
      { id: 'ds-3', doctorId: 'doc-vikram', specialtyId: 'spec-ortho' },
      { id: 'ds-4', doctorId: 'doc-ananya', specialtyId: 'spec-cardio' },
      { id: 'ds-5', doctorId: 'doc-neha', specialtyId: 'spec-gynae' },
    ];

    // 6. Affiliations
    this.affiliations = [
      { id: 'aff-1', doctorId: 'doc-rajesh', hospitalId: 'hosp-amritdhara', consultationFee: 600 },
      { id: 'aff-2', doctorId: 'doc-rajesh', hospitalId: 'hosp-civil-karnal', consultationFee: 400 },
      { id: 'aff-3', doctorId: 'doc-sunita', hospitalId: 'hosp-amritdhara', consultationFee: 500 },
      { id: 'aff-4', doctorId: 'doc-vikram', hospitalId: 'hosp-civil-karnal', consultationFee: 750 },
      { id: 'aff-5', doctorId: 'doc-ananya', hospitalId: 'hosp-max-delhi', consultationFee: 1200 },
      { id: 'aff-6', doctorId: 'doc-neha', hospitalId: 'hosp-medanta-ggn', consultationFee: 900 },
    ];

    // 7. Schedules (Mon-Sat, 09:00 - 17:00, 20-min slots, 13:00 - 14:00 lunch break)
    const days: ('MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY')[] = [
      'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'
    ];

    ['doc-rajesh', 'doc-sunita', 'doc-vikram', 'doc-ananya', 'doc-neha'].forEach((docId) => {
      days.forEach((day, idx) => {
        this.schedules.push({
          id: `sch-${docId}-${day}`,
          doctorId: docId,
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '17:00',
          slotDurationMinutes: 20,
          breakStartTime: '13:00',
          breakEndTime: '14:00',
          isActive: true,
        });
      });
    });

    // 8. Schedule Exception (Test leave date: 2026-10-25 for Dr. Rajesh)
    this.exceptions.push({
      id: 'exc-rajesh-1',
      doctorId: 'doc-rajesh',
      date: '2026-10-25',
      reason: 'Attending National Dermatology Conference (IADVL)',
      isLeave: true,
    });

    // 9. Initial Appointments
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 5);
    const pastDateStr = pastDate.toISOString().split('T')[0];

    this.appointments.push(
      {
        id: 'apt-seed-1',
        bookingReference: 'VAC-2026-789123',
        patientId: 'usr-patient',
        doctorId: 'doc-rajesh',
        hospitalId: 'hosp-amritdhara',
        appointmentDate: tomorrowStr,
        appointmentTime: '10:20 AM',
        status: 'CONFIRMED',
        consultationFee: 600,
        notes: 'Follow up regarding skin allergy and persistent rash',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'apt-seed-2',
        bookingReference: 'VAC-2026-456789',
        patientId: 'usr-patient',
        doctorId: 'doc-vikram',
        hospitalId: 'hosp-civil-karnal',
        appointmentDate: pastDateStr,
        appointmentTime: '11:00 AM',
        status: 'COMPLETED',
        consultationFee: 750,
        notes: 'Knee joint pain after running',
        createdAt: pastDate.toISOString(),
        updatedAt: pastDate.toISOString(),
      }
    );

    // 10. Notifications
    this.notifications.push(
      {
        id: 'notif-1',
        userId: 'usr-patient',
        title: 'Appointment Confirmed',
        message: `Your appointment with Dr. Rajesh Sharma on ${tomorrowStr} at 10:20 AM is confirmed. Booking ref: VAC-2026-789123.`,
        type: 'BOOKING_CONFIRMED',
        isRead: false,
        relatedAppointmentId: 'apt-seed-1',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'notif-2',
        userId: 'usr-doc-rajesh',
        title: 'New Patient Booking',
        message: `Rahul Verma has booked an appointment for ${tomorrowStr} at 10:20 AM.`,
        type: 'BOOKING_CONFIRMED',
        isRead: false,
        relatedAppointmentId: 'apt-seed-1',
        createdAt: new Date().toISOString(),
      }
    );

    // 11. Audit Logs
    this.auditLogs.push({
      id: 'audit-1',
      userId: 'usr-patient',
      action: 'BOOK_APPOINTMENT',
      entityType: 'Appointment',
      entityId: 'apt-seed-1',
      details: JSON.stringify({ doctorId: 'doc-rajesh', date: tomorrowStr, time: '10:20 AM' }),
      ipAddress: '127.0.0.1',
      createdAt: new Date().toISOString(),
    });
  }
}

export const inMemStore = new InMemStore();
