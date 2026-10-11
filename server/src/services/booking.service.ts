import crypto from 'crypto';
import { inMemStore, DbAppointment } from './store.service';
import { calculateDoctorAvailability } from './availability.service';
import { createNotification } from './notification.service';

export interface BookingPayload {
  patientId: string;
  doctorId: string;
  hospitalId: string;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // e.g. "10:20 AM"
  notes?: string;
}

export function generateBookingReference(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let randomPart = '';
  for (let i = 0; i < 6; i++) {
    const randomIndex = crypto.randomInt(0, chars.length);
    randomPart += chars[randomIndex];
  }
  const year = new Date().getFullYear();
  return `VAC-${year}-${randomPart}`;
}

export async function createBooking(payload: BookingPayload): Promise<DbAppointment> {
  const { patientId, doctorId, hospitalId, appointmentDate, appointmentTime, notes } = payload;

  // 1. Validate date is not past
  const todayStr = new Date().toISOString().split('T')[0];
  if (appointmentDate < todayStr) {
    throw new Error('Appointments cannot be booked in the past.');
  }

  // 2. Check doctor exists
  const doctor = inMemStore.doctors.find((d) => d.id === doctorId);
  if (!doctor) {
    throw new Error('Doctor not found.');
  }

  const doctorUser = inMemStore.users.find((u) => u.id === doctor.userId);
  const patientUser = inMemStore.users.find((u) => u.id === patientId);
  const hospital = inMemStore.hospitals.find((h) => h.id === hospitalId);

  if (!patientUser) {
    throw new Error('Patient not found.');
  }
  if (!hospital) {
    throw new Error('Hospital not found.');
  }

  // 3. Atomically check slot availability via availability service
  const availability = await calculateDoctorAvailability(doctorId, appointmentDate);
  if (availability.status === 'ON_LEAVE') {
    throw new Error(`Doctor is on leave on ${appointmentDate}: ${availability.statusLabel}`);
  }
  if (availability.status === 'SCHEDULE_NOT_AVAILABLE') {
    throw new Error('Doctor does not have an active schedule on this day.');
  }

  const slot = availability.slots.find((s) => s.time === appointmentTime);
  if (!slot) {
    throw new Error(`The requested time slot (${appointmentTime}) is not valid for this doctor.`);
  }
  if (!slot.isAvailable) {
    throw new Error(
      `This appointment slot (${appointmentTime}) is no longer available. Reason: ${slot.reason || 'Already taken'}. Please select another slot.`
    );
  }

  // Double check in-memory race condition
  const existingDuplicate = inMemStore.appointments.find(
    (a) =>
      a.doctorId === doctorId &&
      a.appointmentDate === appointmentDate &&
      a.appointmentTime === appointmentTime &&
      a.status !== 'CANCELLED'
  );
  if (existingDuplicate) {
    throw new Error('This time slot has just been booked by another patient. Please select another slot.');
  }

  // 4. Determine consultation fee
  const affiliation = inMemStore.affiliations.find(
    (aff) => aff.doctorId === doctorId && aff.hospitalId === hospitalId
  );
  const consultationFee = affiliation ? affiliation.consultationFee : doctor.consultationFee;

  // 5. Generate unique booking reference
  let bookingRef = generateBookingReference();
  while (inMemStore.appointments.some((a) => a.bookingReference === bookingRef)) {
    bookingRef = generateBookingReference();
  }

  // 6. Save appointment
  const newAppointment: DbAppointment = {
    id: `apt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    bookingReference: bookingRef,
    patientId,
    doctorId,
    hospitalId,
    appointmentDate,
    appointmentTime,
    status: 'CONFIRMED',
    consultationFee,
    notes: notes || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  inMemStore.appointments.push(newAppointment);

  // 7. Create in-app notifications
  const docName = doctorUser ? doctorUser.name : 'Doctor';
  const patName = patientUser.name;

  createNotification({
    userId: patientId,
    title: 'Appointment Confirmed',
    message: `Your appointment with ${docName} at ${hospital.name} on ${appointmentDate} at ${appointmentTime} is confirmed. Booking Ref: ${bookingRef}.`,
    type: 'BOOKING_CONFIRMED',
    relatedAppointmentId: newAppointment.id,
  });

  if (doctorUser) {
    createNotification({
      userId: doctorUser.id,
      title: 'New Patient Appointment',
      message: `${patName} booked an appointment for ${appointmentDate} at ${appointmentTime} at ${hospital.name}. Booking Ref: ${bookingRef}.`,
      type: 'BOOKING_CONFIRMED',
      relatedAppointmentId: newAppointment.id,
    });
  }

  // 8. Audit log
  inMemStore.auditLogs.push({
    id: `audit-${Date.now()}`,
    userId: patientId,
    action: 'BOOK_APPOINTMENT',
    entityType: 'Appointment',
    entityId: newAppointment.id,
    details: JSON.stringify({
      bookingRef,
      doctorId,
      hospitalId,
      date: appointmentDate,
      time: appointmentTime,
    }),
    createdAt: new Date().toISOString(),
  });

  return newAppointment;
}

export async function cancelBooking(
  appointmentId: string,
  userId: string,
  userRole: string,
  reason?: string
): Promise<DbAppointment> {
  const appointment = inMemStore.appointments.find((a) => a.id === appointmentId);
  if (!appointment) {
    throw new Error('Appointment not found.');
  }

  // Check authorization
  const doctor = inMemStore.doctors.find((d) => d.id === appointment.doctorId);
  const isOwnerPatient = appointment.patientId === userId;
  const isOwnerDoctor = doctor && doctor.userId === userId;
  const isPlatformAdmin = userRole === 'PLATFORM_ADMIN';

  if (!isOwnerPatient && !isOwnerDoctor && !isPlatformAdmin) {
    throw new Error('You are not authorized to cancel this appointment.');
  }

  if (appointment.status === 'CANCELLED') {
    throw new Error('Appointment is already cancelled.');
  }

  appointment.status = 'CANCELLED';
  appointment.cancellationReason = reason || 'Cancelled by user';
  appointment.updatedAt = new Date().toISOString();

  // Notify parties
  createNotification({
    userId: appointment.patientId,
    title: 'Appointment Cancelled',
    message: `Your appointment (Ref: ${appointment.bookingReference}) has been cancelled.`,
    type: 'BOOKING_CANCELLED',
    relatedAppointmentId: appointment.id,
  });

  if (doctor) {
    createNotification({
      userId: doctor.userId,
      title: 'Appointment Cancelled',
      message: `Appointment (Ref: ${appointment.bookingReference}) for ${appointment.appointmentDate} at ${appointment.appointmentTime} was cancelled.`,
      type: 'BOOKING_CANCELLED',
      relatedAppointmentId: appointment.id,
    });
  }

  inMemStore.auditLogs.push({
    id: `audit-${Date.now()}`,
    userId,
    action: 'CANCEL_APPOINTMENT',
    entityType: 'Appointment',
    entityId: appointment.id,
    details: JSON.stringify({ reason }),
    createdAt: new Date().toISOString(),
  });

  return appointment;
}

export async function rescheduleBooking(
  appointmentId: string,
  userId: string,
  userRole: string,
  newDate: string,
  newTime: string,
  reason?: string
): Promise<DbAppointment> {
  const appointment = inMemStore.appointments.find((a) => a.id === appointmentId);
  if (!appointment) {
    throw new Error('Appointment not found.');
  }

  const doctor = inMemStore.doctors.find((d) => d.id === appointment.doctorId);
  const isOwnerPatient = appointment.patientId === userId;
  const isOwnerDoctor = doctor && doctor.userId === userId;
  const isPlatformAdmin = userRole === 'PLATFORM_ADMIN';

  if (!isOwnerPatient && !isOwnerDoctor && !isPlatformAdmin) {
    throw new Error('You are not authorized to reschedule this appointment.');
  }

  if (appointment.status === 'CANCELLED') {
    throw new Error('Cannot reschedule a cancelled appointment.');
  }

  // Validate new slot
  const availability = await calculateDoctorAvailability(appointment.doctorId, newDate);
  const slot = availability.slots.find((s) => s.time === newTime);
  if (!slot || !slot.isAvailable) {
    throw new Error(`The selected slot on ${newDate} at ${newTime} is not available.`);
  }

  const previousDate = appointment.appointmentDate;
  const previousTime = appointment.appointmentTime;

  appointment.appointmentDate = newDate;
  appointment.appointmentTime = newTime;
  appointment.status = 'CONFIRMED';
  appointment.updatedAt = new Date().toISOString();

  createNotification({
    userId: appointment.patientId,
    title: 'Appointment Rescheduled',
    message: `Your appointment (Ref: ${appointment.bookingReference}) has been rescheduled to ${newDate} at ${newTime}.`,
    type: 'BOOKING_RESCHEDULED',
    relatedAppointmentId: appointment.id,
  });

  if (doctor) {
    createNotification({
      userId: doctor.userId,
      title: 'Appointment Rescheduled',
      message: `Appointment (Ref: ${appointment.bookingReference}) moved from ${previousDate} ${previousTime} to ${newDate} ${newTime}.`,
      type: 'BOOKING_RESCHEDULED',
      relatedAppointmentId: appointment.id,
    });
  }

  inMemStore.auditLogs.push({
    id: `audit-${Date.now()}`,
    userId,
    action: 'RESCHEDULE_APPOINTMENT',
    entityType: 'Appointment',
    entityId: appointment.id,
    details: JSON.stringify({ from: `${previousDate} ${previousTime}`, to: `${newDate} ${newTime}`, reason }),
    createdAt: new Date().toISOString(),
  });

  return appointment;
}
