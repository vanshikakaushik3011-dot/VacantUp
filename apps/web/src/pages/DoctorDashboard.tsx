import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  Save,
  Loader2,
  CalendarDays,
  Coffee,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { appointmentApi, scheduleApi } from '../services/api';

export const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'appointments' | 'schedule' | 'leaves'>('appointments');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [exceptions, setExceptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  // New leave form state
  const [leaveDate, setLeaveDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');

  // Selected schedule editing
  const [editDay, setEditDay] = useState('MONDAY');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [duration, setDuration] = useState(20);
  const [breakStart, setBreakStart] = useState('13:00');
  const [breakEnd, setBreakEnd] = useState('14:00');

  const doctorId = (user as any)?.doctorProfile?.id || 'doc-rajesh';

  const loadData = () => {
    setLoading(true);
    Promise.all([
      appointmentApi.getMy(),
      scheduleApi.getDoctorSchedules(doctorId),
    ])
      .then(([apts, schData]) => {
        setAppointments(apts);
        setSchedules(schData.schedules || []);
        setExceptions(schData.exceptions || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [doctorId]);

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await scheduleApi.updateSlot(doctorId, {
        dayOfWeek: editDay,
        startTime,
        endTime,
        slotDurationMinutes: Number(duration),
        breakStartTime: breakStart,
        breakEndTime: breakEnd,
        isActive: true,
      });
      setMessage('Schedule updated successfully!');
      setTimeout(() => setMessage(null), 3000);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleAddLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveDate || !leaveReason) return;
    try {
      setLoading(true);
      await scheduleApi.addException(doctorId, {
        date: leaveDate,
        reason: leaveReason,
        isLeave: true,
      });
      setLeaveDate('');
      setLeaveReason('');
      setMessage('Leave date registered successfully!');
      setTimeout(() => setMessage(null), 3000);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to add leave');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLeave = async (excId: string) => {
    try {
      await scheduleApi.deleteException(excId);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete leave');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <img
            src={user?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`}
            alt={user?.name}
            className="w-16 h-16 rounded-2xl object-cover border border-slate-100 shadow-sm"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-extrabold text-slate-900">{user?.name}</h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-accent-50 text-accent-700">
                Doctor OPD Portal
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Manage your daily outpatient queue, availability schedules, and leave calendar.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="bg-brand-50 px-3.5 py-2 rounded-xl text-center">
            <span className="block text-[10px] text-brand-600 font-bold uppercase">Total Bookings</span>
            <span className="text-lg font-black text-brand-900">{appointments.length}</span>
          </div>
          <div className="bg-emerald-50 px-3.5 py-2 rounded-xl text-center">
            <span className="block text-[10px] text-emerald-600 font-bold uppercase">Active Schedules</span>
            <span className="text-lg font-black text-emerald-900">{schedules.length} Days</span>
          </div>
        </div>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center space-x-2 border border-emerald-200">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('appointments')}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'appointments' ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Patient OPD Queue ({appointments.length})
        </button>
        <button
          onClick={() => setActiveTab('schedule')}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'schedule' ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Working Hours & Slot Settings
        </button>
        <button
          onClick={() => setActiveTab('leaves')}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'leaves' ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Leave Dates & Exceptions ({exceptions.length})
        </button>
      </div>

      {/* Tab 1: Appointments Queue */}
      {activeTab === 'appointments' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900">Patient Consultation Queue</h2>
          {appointments.length === 0 ? (
            <p className="text-xs text-slate-400 py-12 text-center">No patients booked in queue yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {appointments.map((apt) => (
                <div key={apt.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-brand-600">{apt.bookingReference}</span>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          apt.status === 'CONFIRMED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {apt.status}
                      </span>
                    </div>
                    <p className="font-bold text-sm text-slate-900">{apt.patientName}</p>
                    <p className="text-slate-500 text-[11px]">{apt.patientPhone || apt.patientEmail}</p>
                    {apt.notes && <p className="text-slate-600 italic">"{apt.notes}"</p>}
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 block">{apt.appointmentDate}</span>
                    <span className="text-brand-600 font-semibold">{apt.appointmentTime}</span>
                    <span className="block text-slate-400 text-[10px]">Fee: ₹{apt.consultationFee}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Working Hours & Slot Settings */}
      {activeTab === 'schedule' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <form onSubmit={handleSaveSchedule} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 text-sm">Configure Working Hours</h3>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Day of Week</label>
              <select
                value={editDay}
                onChange={(e) => setEditDay(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
              >
                {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Start Time (HH:mm)</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700">End Time (HH:mm)</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Slot Duration (Minutes)</label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
              >
                <option value={15}>15 Minutes per patient</option>
                <option value={20}>20 Minutes per patient (Standard)</option>
                <option value={30}>30 Minutes per patient</option>
                <option value={45}>45 Minutes per patient</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Lunch Break Start</label>
                <input
                  type="time"
                  value={breakStart}
                  onChange={(e) => setBreakStart(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Lunch Break End</label>
                <input
                  type="time"
                  value={breakEnd}
                  onChange={(e) => setBreakEnd(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl flex items-center justify-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Day Schedule</span>
            </button>
          </form>

          {/* Current Weekly Schedule Summary */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Active Weekly Schedule</h3>
            <div className="space-y-2">
              {schedules.map((s) => (
                <div key={s.id} className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-800">{s.dayOfWeek}</span>
                    <span className="block text-[11px] text-slate-500">
                      {s.startTime} - {s.endTime} ({s.slotDurationMinutes} min slots)
                    </span>
                  </div>
                  {s.breakStartTime && (
                    <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md flex items-center space-x-1">
                      <Coffee className="w-3 h-3" />
                      <span>Break: {s.breakStartTime}-{s.breakEndTime}</span>
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Leave Dates */}
      {activeTab === 'leaves' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <form onSubmit={handleAddLeave} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 text-sm">Register Leave or Holiday</h3>
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Date</label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={leaveDate}
                onChange={(e) => setLeaveDate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Reason</label>
              <input
                type="text"
                required
                placeholder="e.g. Attending Conference, Medical leave"
                value={leaveReason}
                onChange={(e) => setLeaveReason(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Mark Date as On Leave</span>
            </button>
          </form>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Upcoming Leave Dates</h3>
            {exceptions.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No leaves registered.</p>
            ) : (
              <div className="space-y-2">
                {exceptions.map((exc) => (
                  <div key={exc.id} className="p-3 bg-red-50 rounded-2xl flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-red-900">{exc.date}</span>
                      <p className="text-red-700 text-[11px]">{exc.reason}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteLeave(exc.id)}
                      className="p-1.5 rounded-lg text-red-600 hover:bg-red-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
