import { Request, Response } from 'express';
import { inMemStore } from '../services/store.service';

export async function getPlatformStats(req: Request, res: Response) {
  try {
    const totalUsers = inMemStore.users.length;
    const totalDoctors = inMemStore.doctors.length;
    const totalHospitals = inMemStore.hospitals.length;
    const totalAppointments = inMemStore.appointments.length;

    const confirmedAppointments = inMemStore.appointments.filter((a) => a.status === 'CONFIRMED').length;
    const completedAppointments = inMemStore.appointments.filter((a) => a.status === 'COMPLETED').length;
    const cancelledAppointments = inMemStore.appointments.filter((a) => a.status === 'CANCELLED').length;

    const totalRevenue = inMemStore.appointments
      .filter((a) => a.status !== 'CANCELLED')
      .reduce((sum, a) => sum + a.consultationFee, 0);

    const appointmentsByCity: Record<string, number> = {};
    inMemStore.appointments.forEach((a) => {
      const hosp = inMemStore.hospitals.find((h) => h.id === a.hospitalId);
      const city = hosp?.city || 'Other';
      appointmentsByCity[city] = (appointmentsByCity[city] || 0) + 1;
    });

    return res.json({
      success: true,
      data: {
        totalUsers,
        totalDoctors,
        totalHospitals,
        totalAppointments,
        confirmedAppointments,
        completedAppointments,
        cancelledAppointments,
        totalRevenue,
        appointmentsByCity,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function getAllUsers(req: Request, res: Response) {
  try {
    const users = inMemStore.users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      avatarUrl: u.avatarUrl,
      createdAt: u.createdAt,
    }));

    return res.json({ success: true, count: users.length, data: users });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function verifyDoctor(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { isVerified } = req.body;

    const doctor = inMemStore.doctors.find((d) => d.id === id);
    if (!doctor) {
      return res.status(404).json({ success: false, error: 'Doctor not found' });
    }

    doctor.isVerified = Boolean(isVerified);
    doctor.updatedAt = new Date().toISOString();

    return res.json({ success: true, message: `Doctor verification updated to ${doctor.isVerified}`, data: doctor });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function verifyHospital(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { isVerified } = req.body;

    const hospital = inMemStore.hospitals.find((h) => h.id === id);
    if (!hospital) {
      return res.status(404).json({ success: false, error: 'Hospital not found' });
    }

    hospital.isVerified = Boolean(isVerified);
    hospital.updatedAt = new Date().toISOString();

    return res.json({ success: true, message: `Hospital verification updated to ${hospital.isVerified}`, data: hospital });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function getAuditLogs(req: Request, res: Response) {
  try {
    const logs = [...inMemStore.auditLogs].reverse().slice(0, 50);
    return res.json({ success: true, count: logs.length, data: logs });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
