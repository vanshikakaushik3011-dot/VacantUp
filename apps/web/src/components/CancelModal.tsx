import React, { useState } from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { appointmentApi } from '../services/api';

interface CancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: any;
  onCancelled: () => void;
}

export const CancelModal: React.FC<CancelModalProps> = ({
  isOpen,
  onClose,
  appointment,
  onCancelled,
}) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !appointment) return null;

  const handleCancel = async () => {
    try {
      setLoading(true);
      setError(null);
      await appointmentApi.cancel(appointment.id, reason);
      onCancelled();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to cancel appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div>
          <h3 className="font-bold text-slate-900 text-lg">Cancel Appointment</h3>
          <p className="text-xs text-slate-500 mt-1">
            Are you sure you want to cancel your consultation with{' '}
            <strong>{appointment.doctorName}</strong> on{' '}
            <strong>{appointment.appointmentDate} at {appointment.appointmentTime}</strong>?
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Reason for Cancellation (Optional)
          </label>
          <textarea
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Change of plans, feeling better, rescheduled elsewhere..."
            className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        {error && (
          <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-xl">{error}</p>
        )}

        <div className="flex items-center space-x-2 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
          >
            Keep Appointment
          </button>
          <button
            disabled={loading}
            onClick={handleCancel}
            className="flex-1 py-2 px-3 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl flex items-center justify-center space-x-1"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Confirm Cancellation</span>}
          </button>
        </div>
      </div>
    </div>
  );
};
