import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Building2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Bell,
  User,
  Phone,
  Mail,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { appointmentApi } from '../services/api';
import { CancelModal } from '../components/CancelModal';
import { RescheduleModal } from '../components/RescheduleModal';

export const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [cancelTarget, setCancelTarget] = useState<any | null>(null);
  const [rescheduleTarget, setRescheduleTarget] = useState<any | null>(null);

  const fetchAppointments = () => {
    setLoading(true);
    appointmentApi
      .getMy(activeTab)
      .then((data) => setAppointments(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAppointments();
  }, [activeTab]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Profile Bar */}
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
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700">
                Patient Account
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
              <span className="flex items-center space-x-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{user?.email}</span>
              </span>
              {user?.phone && (
                <span className="flex items-center space-x-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{user.phone}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <Link
          to="/doctors"
          className="py-2.5 px-5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md shadow-brand-600/20 transition-all flex items-center space-x-1.5"
        >
          <span>Find & Book Doctor</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'upcoming'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Upcoming Consultations
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'past'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Past History
        </button>
        <button
          onClick={() => setActiveTab('cancelled')}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'cancelled'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Cancelled
        </button>
      </div>

      {/* Appointments List */}
      {loading ? (
        <div className="py-24 text-center text-slate-400 space-y-2">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-600" />
          <p className="text-xs font-semibold text-slate-500">Retrieving appointment bookings...</p>
        </div>
      ) : appointments.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No {activeTab} appointments</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {activeTab === 'upcoming'
              ? 'You have no scheduled consultations. Check doctor OPD availability to skip hospital lines.'
              : `You have no ${activeTab} consultations in your record.`}
          </p>
          {activeTab === 'upcoming' && (
            <Link
              to="/doctors"
              className="inline-block mt-2 py-2 px-4 bg-brand-600 text-white text-xs font-bold rounded-xl"
            >
              Browse Available Doctors
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((apt) => (
            <div
              key={apt.id}
              className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
            >
              {/* Doctor and booking info */}
              <div className="flex items-start space-x-4">
                <img
                  src={apt.doctorAvatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${apt.doctorName}`}
                  alt={apt.doctorName}
                  className="w-16 h-16 rounded-2xl object-cover border border-slate-100 shrink-0"
                />
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-extrabold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-lg border border-brand-200">
                      Ref: {apt.bookingReference}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        apt.status === 'CONFIRMED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : apt.status === 'CANCELLED'
                          ? 'bg-rose-100 text-rose-800'
                          : apt.status === 'COMPLETED'
                          ? 'bg-slate-100 text-slate-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {apt.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900">{apt.doctorName}</h3>
                  <p className="text-xs text-brand-600 font-semibold">{apt.doctorSpecialty}</p>

                  <div className="flex items-center space-x-1.5 text-xs text-slate-500 pt-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{apt.hospitalName}, {apt.hospitalAddress}</span>
                  </div>

                  {apt.notes && (
                    <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-xl mt-1">
                      "{apt.notes}"
                    </p>
                  )}
                </div>
              </div>

              {/* Slot & Fee & Actions */}
              <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end justify-between w-full md:w-auto gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                <div className="text-left md:text-right">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-900">
                    <Calendar className="w-4 h-4 text-brand-600" />
                    <span>{apt.appointmentDate}</span>
                    <Clock className="w-4 h-4 text-brand-600 ml-1" />
                    <span>{apt.appointmentTime}</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-500 block mt-0.5">
                    Consultation Fee: <strong>₹{apt.consultationFee}</strong>
                  </span>
                </div>

                {apt.status === 'CONFIRMED' && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setRescheduleTarget(apt)}
                      className="py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                    >
                      Reschedule
                    </button>
                    <button
                      onClick={() => setCancelTarget(apt)}
                      className="py-1.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancel Modal */}
      <CancelModal
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        appointment={cancelTarget}
        onCancelled={fetchAppointments}
      />

      {/* Reschedule Modal */}
      <RescheduleModal
        isOpen={!!rescheduleTarget}
        onClose={() => setRescheduleTarget(null)}
        appointment={rescheduleTarget}
        onRescheduled={fetchAppointments}
      />
    </div>
  );
};
