import { Request, Response } from 'express';
import { inMemStore } from '../services/store.service';
import { createBooking, cancelBooking, rescheduleBooking } from '../services/booking.service';

export function enrichAppointment(apt: any) {
  const patient = inMemStore.users.find((u) => u.id === apt.patientId);
  const doctor = inMemStore.doctors.find((d) => d.id === apt.doctorId);
  const doctorUser = doctor ? inMemStore.users.find((u) => u.id === doctor.userId) : null;
  const hospital = inMemStore.hospitals.find((h) => h.id === apt.hospitalId);

  const docSpecs = doctor
    ? inMemStore.doctorSpecialties
        .filter((ds) => ds.doctorId === doctor.id)
        .map((ds) => inMemStore.specialties.find((s) => s.id === ds.specialtyId)?.name)
        .filter(Boolean)
    : [];

  return {
    ...apt,
    patientName: patient?.name || 'Unknown Patient',
    patientEmail: patient?.email || '',
    patientPhone: patient?.phone || '',
    doctorName: doctorUser?.name || 'Dr. Unknown',
    doctorAvatarUrl: doctorUser?.avatarUrl || null,
    doctorSpecialty: docSpecs[0] || 'General Physician',
    hospitalName: hospital?.name || 'Hospital',
    hospitalAddress: hospital?.address || '',
    hospitalCity: hospital?.city || '',
  };
}

export async function createAppointment(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const { doctorId, hospitalId, appointmentDate, appointmentTime, notes } = req.body;

    const appointment = await createBooking({
      patientId: req.user.id,
      doctorId,
      hospitalId,
      appointmentDate,
      appointmentTime,
      notes,
    });

    return res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: enrichAppointment(appointment),
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
}

export async function getMyAppointments(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const { filter } = req.query; // 'upcoming', 'past', 'cancelled'
    const todayStr = new Date().toISOString().split('T')[0];

    let appointments = inMemStore.appointments;

    if (req.user.role === 'PATIENT') {
      appointments = appointments.filter((a) => a.patientId === req.user?.id);
    } else if (req.user.role === 'DOCTOR') {
      const doctor = inMemStore.doctors.find((d) => d.userId === req.user?.id);
      if (!doctor) {
        return res.json({ success: true, count: 0, data: [] });
      }
      appointments = appointments.filter((a) => a.doctorId === doctor.id);
    } else if (req.user.role === 'HOSPITAL_ADMIN') {
      // Find hospital
      const hospital = inMemStore.hospitals[0]; // Or membership
      if (hospital) {
        appointments = appointments.filter((a) => a.hospitalId === hospital.id);
      }
    }

    if (filter === 'upcoming') {
      appointments = appointments.filter(
        (a) => a.status !== 'CANCELLED' && a.status !== 'COMPLETED' && a.appointmentDate >= todayStr
      );
    } else if (filter === 'past') {
      appointments = appointments.filter(
        (a) => a.status === 'COMPLETED' || (a.status !== 'CANCELLED' && a.appointmentDate < todayStr)
      );
    } else if (filter === 'cancelled') {
      appointments = appointments.filter((a) => a.status === 'CANCELLED');
    }

    // Sort by appointmentDate descending
    appointments.sort((a, b) => b.appointmentDate.localeCompare(a.appointmentDate));

    const enriched = appointments.map(enrichAppointment);
    return res.json({ success: true, count: enriched.length, data: enriched });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function getAppointmentById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const apt = inMemStore.appointments.find((a) => a.id === id || a.bookingReference === id);
    if (!apt) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }

    // Authorization check
    if (req.user && req.user.role === 'PATIENT' && apt.patientId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Access denied to this appointment' });
    }

    return res.json({ success: true, data: enrichAppointment(apt) });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function cancelAppointment(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const { id } = req.params;
    const { reason } = req.body;

    const cancelled = await cancelBooking(id, req.user.id, req.user.role, reason);
    return res.json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: enrichAppointment(cancelled),
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
}

export async function rescheduleAppointment(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const { id } = req.params;
    const { appointmentDate, appointmentTime, reason } = req.body;

    const rescheduled = await rescheduleBooking(
      id,
      req.user.id,
      req.user.role,
      appointmentDate,
      appointmentTime,
      reason
    );

    return res.json({
      success: true,
      message: 'Appointment rescheduled successfully',
      data: enrichAppointment(rescheduled),
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
}
