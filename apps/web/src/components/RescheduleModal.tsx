import React, { useState } from 'react';
import { X, Calendar, Loader2, AlertCircle } from 'lucide-react';
import { appointmentApi } from '../services/api';
import { SlotPicker } from './SlotPicker';

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: any;
  onRescheduled: () => void;
}

export const RescheduleModal: React.FC<RescheduleModalProps> = ({
  isOpen,
  onClose,
  appointment,
  onRescheduled,
}) => {
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [newDate, setNewDate] = useState(tomorrowStr);
  const [newSlot, setNewSlot] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !appointment) return null;

  const handleReschedule = async () => {
    if (!newSlot) {
      setError('Please select an available time slot.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await appointmentApi.reschedule(appointment.id, {
        appointmentDate: newDate,
        appointmentTime: newSlot,
        reason,
      });
      onRescheduled();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reschedule appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative space-y-4 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-2 text-brand-600">
          <Calendar className="w-5 h-5" />
          <h3 className="font-bold text-slate-900 text-lg">Reschedule Appointment</h3>
        </div>

        <p className="text-xs text-slate-500">
          Rescheduling booking <strong>{appointment.bookingReference}</strong> with{' '}
          <strong>{appointment.doctorName}</strong>. Current slot: {appointment.appointmentDate} at{' '}
          {appointment.appointmentTime}.
        </p>

        <SlotPicker
          doctorId={appointment.doctorId}
          selectedDate={newDate}
          onDateChange={setNewDate}
          selectedSlot={newSlot}
          onSlotSelect={setNewSlot}
        />

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center space-x-2 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
          >
            Cancel
          </button>
          <button
            disabled={loading || !newSlot}
            onClick={handleReschedule}
            className="flex-1 py-2 px-3 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 rounded-xl flex items-center justify-center space-x-1"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Confirm New Slot</span>}
          </button>
        </div>
      </div>
    </div>
  );
};
