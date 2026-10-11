import { PrismaClient, Role, DayOfWeek, NotificationType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding PostgreSQL database for VacantUp...');

  // Clear existing
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.scheduleException.deleteMany();
  await prisma.doctorSchedule.deleteMany();
  await prisma.doctorHospitalAffiliation.deleteMany();
  await prisma.doctorSpecialty.deleteMany();
  await prisma.hospitalMembership.deleteMany();
  await prisma.doctorProfile.deleteMany();
  await prisma.medicalSpecialty.deleteMany();
  await prisma.hospital.deleteMany();
  await prisma.user.deleteMany();

  const salt = await bcrypt.genSalt(10);
  const patientHash = await bcrypt.hash('Patient@123', salt);
  const doctorHash = await bcrypt.hash('Doctor@123', salt);
  const hospitalHash = await bcrypt.hash('Hospital@123', salt);
  const adminHash = await bcrypt.hash('Admin@123', salt);

  // 1. Users
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@vacantup.com',
      passwordHash: adminHash,
      name: 'VacantUp Super Admin',
      role: Role.PLATFORM_ADMIN,
      phone: '+91 99999 00000',
    },
  });

  const patientUser = await prisma.user.create({
    data: {
      email: 'patient@vacantup.com',
      passwordHash: patientHash,
      name: 'Rahul Verma',
      role: Role.PATIENT,
      phone: '+91 98765 43210',
    },
  });

  const docUserRajesh = await prisma.user.create({
    data: {
      email: 'doctor@vacantup.com',
      passwordHash: doctorHash,
      name: 'Dr. Rajesh Sharma',
      role: Role.DOCTOR,
      phone: '+91 98120 11223',
    },
  });

  const docUserSunita = await prisma.user.create({
    data: {
      email: 'dr.sunita@vacantup.com',
      passwordHash: doctorHash,
      name: 'Dr. Sunita Malik',
      role: Role.DOCTOR,
      phone: '+91 98120 22334',
    },
  });

  const docUserVikram = await prisma.user.create({
    data: {
      email: 'dr.vikram@vacantup.com',
      passwordHash: doctorHash,
      name: 'Dr. Vikram Patel',
      role: Role.DOCTOR,
      phone: '+91 98120 33445',
    },
  });

  const hospAdmin = await prisma.user.create({
    data: {
      email: 'hospital@vacantup.com',
      passwordHash: hospitalHash,
      name: 'Suresh Singhal (Hospital Admin)',
      role: Role.HOSPITAL_ADMIN,
      phone: '+91 98120 99887',
    },
  });

  // 2. Specialties
  const derm = await prisma.medicalSpecialty.create({
    data: {
      name: 'Dermatology',
      slug: 'dermatology',
      description: 'Skin, hair, nail disorders, cosmetic treatments',
      iconName: 'Sparkles',
    },
  });

  const pedia = await prisma.medicalSpecialty.create({
    data: {
      name: 'Pediatrics',
      slug: 'pediatrics',
      description: 'Child and adolescent healthcare and vaccination',
      iconName: 'Baby',
    },
  });

  const ortho = await prisma.medicalSpecialty.create({
    data: {
      name: 'Orthopedics',
      slug: 'orthopedics',
      description: 'Bones, joints, sports injuries, spine care',
      iconName: 'Bone',
    },
  });

  const cardio = await prisma.medicalSpecialty.create({
    data: {
      name: 'Cardiology',
      slug: 'cardiology',
      description: 'Heart health, ECG, echocardiography, hypertension',
      iconName: 'HeartPulse',
    },
  });

  // 3. Hospitals
  const amritdhara = await prisma.hospital.create({
    data: {
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
      departments: 'Dermatology, Pediatrics, Cardiology, Orthopedics, General Medicine',
    },
  });

  const civilKarnal = await prisma.hospital.create({
    data: {
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
      departments: 'Orthopedics, General Medicine, Dermatology, ENT',
    },
  });

  // Hospital Membership
  await prisma.hospitalMembership.create({
    data: {
      hospitalId: amritdhara.id,
      userId: hospAdmin.id,
      role: 'ADMIN',
    },
  });

  // 4. Doctor Profiles
  const docRajesh = await prisma.doctorProfile.create({
    data: {
      userId: docUserRajesh.id,
      qualifications: 'MBBS, MD (Dermatology, Venereology & Leprosy - AIIMS)',
      experienceYears: 12,
      bio: 'Senior Consultant Dermatologist specializing in clinical dermatology, acne treatments, laser procedures, and pediatric skin care.',
      consultationFee: 600,
      isVerified: true,
      isDemo: true,
      city: 'Karnal',
      state: 'Haryana',
    },
  });

  const docSunita = await prisma.doctorProfile.create({
    data: {
      userId: docUserSunita.id,
      qualifications: 'MBBS, DCH, DNB (Pediatrics)',
      experienceYears: 9,
      bio: 'Dedicated Pediatrician with compassionate care for newborns, child immunization, developmental tracking, and pediatric emergency care.',
      consultationFee: 500,
      isVerified: true,
      isDemo: true,
      city: 'Karnal',
      state: 'Haryana',
    },
  });

  const docVikram = await prisma.doctorProfile.create({
    data: {
      userId: docUserVikram.id,
      qualifications: 'MBBS, MS (Orthopedics - PGI)',
      experienceYears: 14,
      bio: 'Orthopedic surgeon with extensive expertise in joint reconstruction, arthroscopy, sports injuries, and conservative fracture management.',
      consultationFee: 750,
      isVerified: true,
      isDemo: true,
      city: 'Karnal',
      state: 'Haryana',
    },
  });

  // Doctor Specialties
  await prisma.doctorSpecialty.create({ data: { doctorId: docRajesh.id, specialtyId: derm.id } });
  await prisma.doctorSpecialty.create({ data: { doctorId: docSunita.id, specialtyId: pedia.id } });
  await prisma.doctorSpecialty.create({ data: { doctorId: docVikram.id, specialtyId: ortho.id } });

  // Affiliations
  await prisma.doctorHospitalAffiliation.create({
    data: { doctorId: docRajesh.id, hospitalId: amritdhara.id, consultationFee: 600 },
  });
  await prisma.doctorHospitalAffiliation.create({
    data: { doctorId: docRajesh.id, hospitalId: civilKarnal.id, consultationFee: 400 },
  });
  await prisma.doctorHospitalAffiliation.create({
    data: { doctorId: docSunita.id, hospitalId: amritdhara.id, consultationFee: 500 },
  });
  await prisma.doctorHospitalAffiliation.create({
    data: { doctorId: docVikram.id, hospitalId: civilKarnal.id, consultationFee: 750 },
  });

  // Schedules (Mon-Sat, 09:00 - 17:00, 20m slots, lunch 13:00 - 14:00)
  const days: DayOfWeek[] = [
    DayOfWeek.MONDAY,
    DayOfWeek.TUESDAY,
    DayOfWeek.WEDNESDAY,
    DayOfWeek.THURSDAY,
    DayOfWeek.FRIDAY,
    DayOfWeek.SATURDAY,
  ];

  for (const doc of [docRajesh, docSunita, docVikram]) {
    for (const day of days) {
      await prisma.doctorSchedule.create({
        data: {
          doctorId: doc.id,
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '17:00',
          slotDurationMinutes: 20,
          breakStartTime: '13:00',
          breakEndTime: '14:00',
          isActive: true,
        },
      });
    }
  }

  // Schedule Exception (Leave)
  await prisma.scheduleException.create({
    data: {
      doctorId: docRajesh.id,
      date: '2026-10-25',
      reason: 'Attending National Dermatology Conference (IADVL)',
      isLeave: true,
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
