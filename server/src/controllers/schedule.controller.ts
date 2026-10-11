import { Request, Response } from 'express';
import { inMemStore, DbDoctorSchedule, DbScheduleException } from '../services/store.service';
import { DayOfWeek } from '@vacantup/shared';

export async function getDoctorSchedules(req: Request, res: Response) {
  try {
    const { doctorId } = req.params;
    const schedules = inMemStore.schedules.filter((s) => s.doctorId === doctorId);
    const exceptions = inMemStore.exceptions.filter((e) => e.doctorId === doctorId);

    return res.json({
      success: true,
      data: {
        schedules,
        exceptions,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function updateDoctorSchedule(req: Request, res: Response) {
  try {
    const { doctorId } = req.params;
    const { dayOfWeek, startTime, endTime, slotDurationMinutes, breakStartTime, breakEndTime, isActive } = req.body;

    // Check authorization: doctor user must match doctor profile or be admin
    if (req.user?.role === 'DOCTOR') {
      const doc = inMemStore.doctors.find((d) => d.userId === req.user?.id);
      if (!doc || doc.id !== doctorId) {
        return res.status(403).json({ success: false, error: 'Unauthorized to modify this schedule' });
      }
    }

    let existing = inMemStore.schedules.find(
      (s) => s.doctorId === doctorId && s.dayOfWeek === dayOfWeek
    );

    if (existing) {
      existing.startTime = startTime;
      existing.endTime = endTime;
      existing.slotDurationMinutes = slotDurationMinutes || 20;
      existing.breakStartTime = breakStartTime || null;
      existing.breakEndTime = breakEndTime || null;
      existing.isActive = isActive !== undefined ? isActive : true;
    } else {
      existing = {
        id: `sch-${doctorId}-${dayOfWeek}`,
        doctorId,
        dayOfWeek: dayOfWeek as DayOfWeek,
        startTime,
        endTime,
        slotDurationMinutes: slotDurationMinutes || 20,
        breakStartTime: breakStartTime || null,
        breakEndTime: breakEndTime || null,
        isActive: isActive !== undefined ? isActive : true,
      };
      inMemStore.schedules.push(existing);
    }

    return res.json({ success: true, message: 'Schedule updated', data: existing });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function addScheduleException(req: Request, res: Response) {
  try {
    const { doctorId } = req.params;
    const { date, reason, isLeave = true } = req.body;

    if (req.user?.role === 'DOCTOR') {
      const doc = inMemStore.doctors.find((d) => d.userId === req.user?.id);
      if (!doc || doc.id !== doctorId) {
        return res.status(403).json({ success: false, error: 'Unauthorized to modify this schedule' });
      }
    }

    const existingIndex = inMemStore.exceptions.findIndex(
      (e) => e.doctorId === doctorId && e.date === date
    );

    const exception: DbScheduleException = {
      id: `exc-${Date.now()}`,
      doctorId,
      date,
      reason,
      isLeave,
    };

    if (existingIndex >= 0) {
      inMemStore.exceptions[existingIndex] = exception;
    } else {
      inMemStore.exceptions.push(exception);
    }

    return res.status(201).json({ success: true, message: 'Leave date / exception registered', data: exception });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function deleteScheduleException(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const index = inMemStore.exceptions.findIndex((e) => e.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Exception not found' });
    }

    inMemStore.exceptions.splice(index, 1);
    return res.json({ success: true, message: 'Exception deleted' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
