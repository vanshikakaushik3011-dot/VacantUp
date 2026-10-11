import { inMemStore } from './store.service';
import { AvailabilityStatus, DayOfWeek, Slot } from '@vacantup/shared';

export interface DoctorDayAvailability {
  date: string;
  status: AvailabilityStatus;
  statusLabel: string;
  totalSlots: number;
  availableSlots: number;
  slots: Slot[];
}

export function formatTime12(time24: string): string {
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12; // 0 becomes 12
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
}

export function parseTimeToMinutes(timeStr: string): number {
  // Can be "09:00" or "09:20 AM"
  if (timeStr.includes('AM') || timeStr.includes('PM')) {
    const [time, modifier] = timeStr.trim().split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

export function getDayOfWeekName(dateStr: string): DayOfWeek {
  const date = new Date(dateStr + 'T00:00:00Z');
  const dayIndex = date.getUTCDay(); // 0 is Sunday, 1 is Monday
  const mapping: DayOfWeek[] = [
    'SUNDAY',
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
  ];
  return mapping[dayIndex];
}

export async function calculateDoctorAvailability(
  doctorId: string,
  dateStr: string
): Promise<DoctorDayAvailability> {
  // 1. Check leave / holiday exception
  const exception = inMemStore.exceptions.find(
    (e) => e.doctorId === doctorId && e.date === dateStr && e.isLeave
  );
  if (exception) {
    return {
      date: dateStr,
      status: 'ON_LEAVE',
      statusLabel: 'On Leave: ' + exception.reason,
      totalSlots: 0,
      availableSlots: 0,
      slots: [],
    };
  }

  // 2. Check doctor's regular schedule
  const dayOfWeek = getDayOfWeekName(dateStr);
  const schedule = inMemStore.schedules.find(
    (s) => s.doctorId === doctorId && s.dayOfWeek === dayOfWeek && s.isActive
  );

  if (!schedule) {
    return {
      date: dateStr,
      status: 'SCHEDULE_NOT_AVAILABLE',
      statusLabel: 'Schedule Not Available',
      totalSlots: 0,
      availableSlots: 0,
      slots: [],
    };
  }

  // 3. Generate slots
  const startMin = parseTimeToMinutes(schedule.startTime);
  const endMin = parseTimeToMinutes(schedule.endTime);
  const duration = schedule.slotDurationMinutes || 20;

  const breakStartMin = schedule.breakStartTime ? parseTimeToMinutes(schedule.breakStartTime) : null;
  const breakEndMin = schedule.breakEndTime ? parseTimeToMinutes(schedule.breakEndTime) : null;

  // Retrieve active appointments for this doctor on this date
  const bookedAppointments = inMemStore.appointments.filter(
    (apt) => apt.doctorId === doctorId && apt.appointmentDate === dateStr && apt.status !== 'CANCELLED'
  );
  const bookedTimeSlots = new Set(bookedAppointments.map((a) => a.appointmentTime));

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const isPastDay = dateStr < todayStr;
  const isToday = dateStr === todayStr;
  const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

  const slots: Slot[] = [];

  for (let m = startMin; m + duration <= endMin; m += duration) {
    // Check if slot falls in break
    if (breakStartMin !== null && breakEndMin !== null) {
      if (m >= breakStartMin && m < breakEndMin) {
        continue;
      }
    }

    const hour = Math.floor(m / 60);
    const minute = m % 60;
    const time24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    const formatted12 = formatTime12(time24);

    let isAvailable = true;
    let reason: string | undefined = undefined;

    if (bookedTimeSlots.has(formatted12) || bookedTimeSlots.has(time24)) {
      isAvailable = false;
      reason = 'Booked';
    } else if (isPastDay) {
      isAvailable = false;
      reason = 'Past date';
    } else if (isToday && m <= currentTotalMinutes) {
      isAvailable = false;
      reason = 'Slot elapsed';
    }

    slots.push({
      time: formatted12,
      datetime: `${dateStr}T${time24}:00.000Z`,
      isAvailable,
      reason,
    });
  }

  const totalSlots = slots.length;
  const availableSlots = slots.filter((s) => s.isAvailable).length;

  let status: AvailabilityStatus = 'AVAILABLE';
  let statusLabel = 'Available';

  if (totalSlots === 0) {
    status = 'NOT_AVAILABLE';
    statusLabel = 'Not Available';
  } else if (availableSlots === 0) {
    status = 'FULLY_BOOKED';
    statusLabel = 'Fully Booked';
  } else if (availableSlots <= Math.max(2, Math.floor(totalSlots * 0.25))) {
    status = 'FEW_SLOTS_LEFT';
    statusLabel = `Few Slots Left (${availableSlots} remaining)`;
  } else {
    status = 'AVAILABLE';
    statusLabel = `Available (${availableSlots} slots)`;
  }

  return {
    date: dateStr,
    status,
    statusLabel,
    totalSlots,
    availableSlots,
    slots,
  };
}
