import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Calendar,
  Clock,
  Building2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  CreditCard,
  User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { appointmentApi } from '../services/api';
import { useNotifications } from '../context/NotificationContext';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: any;
  hospital: any;
  appointmentDate: string;
  appointmentTime: string;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  doctor,
  hospital,
  appointmentDate,
  appointmentTime,
}) => {
  const { user } = useAuth();
  const { refresh } = useNotifications();
  const navigate = useNavigate();

  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!user) {
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await appointmentApi.create({
        doctorId: doctor.id,
        hospitalId: hospital.id,
        appointmentDate,
        appointmentTime,
        notes,
      });

      setConfirmedBooking(res);
      refresh(); // refresh notification count
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {confirmedBooking ? (
          /* Success Screen */
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                Booking Confirmed
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 mt-2">Appointment Reserved!</h3>
              <p className="text-xs text-slate-500 mt-1">
                Your appointment has been registered in the hospital OPD queue.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 text-left border border-slate-200/80 space-y-2 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500">Booking Reference</span>
                <span className="font-mono font-bold text-sm text-brand-600">
                  {confirmedBooking.bookingReference}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Doctor</span>
                <span className="font-bold text-slate-800">{doctor.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Hospital</span>
                <span className="font-semibold text-slate-700">{hospital.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Date & Slot</span>
                <span className="font-bold text-slate-800">
                  {confirmedBooking.appointmentDate} at {confirmedBooking.appointmentTime}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                <span className="text-slate-500">Consultation Fee</span>
                <span className="font-extrabold text-sm text-slate-900">
                  ₹{confirmedBooking.consultationFee}
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => {
                  onClose();
                  navigate('/dashboard/patient');
                }}
                className="flex-1 py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
              >
                Go to My Appointments
              </button>
              <button
                onClick={onClose}
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          /* Confirmation & Review Screen */
          <div className="space-y-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full">
                Review & Confirm
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-2">Book Doctor Consultation</h3>
            </div>

            {/* Doctor & Location Summary */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3 text-xs">
              <div className="flex items-center space-x-3">
                <img
                  src={doctor.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${doctor.name}`}
                  alt={doctor.name}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{doctor.name}</h4>
                  <p className="text-brand-600 font-semibold">{doctor.specialty}</p>
                  <p className="text-slate-500 text-[11px]">{doctor.qualifications}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                <div className="flex items-center space-x-2 text-slate-700">
                  <Calendar className="w-4 h-4 text-brand-600 shrink-0" />
                  <span className="font-semibold">{appointmentDate}</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-700">
                  <Clock className="w-4 h-4 text-brand-600 shrink-0" />
                  <span className="font-semibold">{appointmentTime}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-slate-600 pt-1">
                <Building2 className="w-4 h-4 text-brand-600 shrink-0" />
                <span className="truncate">{hospital.name}, {hospital.city}</span>
              </div>
            </div>

            {/* Consultation Fee */}
            <div className="flex items-center justify-between p-3 bg-brand-50/70 border border-brand-200 rounded-xl text-xs">
              <div className="flex items-center space-x-2 text-brand-900">
                <CreditCard className="w-4 h-4 text-brand-600" />
                <span className="font-semibold">Consultation Fee (Pay at Clinic/OPD)</span>
              </div>
              <span className="font-extrabold text-base text-brand-900">
                ₹{doctor.consultationFee}
              </span>
            </div>

            {/* Patient notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason for Visit / Symptoms (Optional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Briefly describe what you'd like to consult about..."
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {!user ? (
              <div className="p-3 bg-amber-50 text-amber-800 rounded-xl text-xs flex items-center justify-between">
                <span>Please sign in to confirm this appointment.</span>
                <button
                  onClick={() => navigate('/login?redirect=' + encodeURIComponent(window.location.pathname))}
                  className="font-bold text-amber-900 underline ml-2"
                >
                  Sign In Now
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-xs text-slate-500">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Booking as <strong>{user.name}</strong> ({user.email})</span>
              </div>
            )}

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading || !user}
                onClick={handleConfirm}
                className="flex-1 py-2.5 px-4 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Confirming...</span>
                  </>
                ) : (
                  <span>Confirm Appointment</span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
