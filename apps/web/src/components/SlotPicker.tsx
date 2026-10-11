import React, { useState, useEffect } from 'react';
import { Calendar, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { doctorApi } from '../services/api';
import { DoctorAvailability, AVAILABILITY_LABELS } from '@vacantup/shared';

interface SlotPickerProps {
  doctorId: string;
  selectedDate: string;
  onDateChange: (date: string) => void;
  selectedSlot: string | null;
  onSlotSelect: (slot: string) => void;
}

export const SlotPicker: React.FC<SlotPickerProps> = ({
  doctorId,
  selectedDate,
  onDateChange,
  selectedSlot,
  onSlotSelect,
}) => {
  const [availability, setAvailability] = useState<DoctorAvailability | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!doctorId || !selectedDate) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    doctorApi
      .getAvailability(doctorId, selectedDate)
      .then((data) => {
        if (isMounted) {
          setAvailability(data);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.response?.data?.error || 'Failed to fetch doctor availability');
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [doctorId, selectedDate]);

  // Quick date options (Today, Tomorrow, +2 days, +3 days)
  const getQuickDates = () => {
    const list = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const str = d.toISOString().split('T')[0];
      const label =
        i === 0
          ? 'Today'
          : i === 1
          ? 'Tomorrow'
          : d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
      list.push({ date: str, label });
    }
    return list;
  };

  const quickDates = getQuickDates();
  const statusInfo = availability
    ? AVAILABILITY_LABELS[availability.status] || { label: availability.statusLabel, color: '#6b7280', bg: '#f3f4f6' }
    : null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-brand-600" />
          <span>Select Consultation Date</span>
        </h4>
        <input
          type="date"
          min={new Date().toISOString().split('T')[0]}
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {/* Quick Date Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        {quickDates.map((item) => (
          <button
            key={item.date}
            onClick={() => onDateChange(item.date)}
            className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedDate === item.date
                ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/20'
                : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Availability Status Header */}
      {loading ? (
        <div className="flex items-center justify-center py-8 text-slate-400 space-x-2 text-xs">
          <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
          <span>Checking real-time doctor availability...</span>
        </div>
      ) : error ? (
        <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : availability ? (
        <div className="space-y-3">
          <div
            className="flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold"
            style={{ backgroundColor: statusInfo?.bg, color: statusInfo?.color }}
          >
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: statusInfo?.color }} />
              <span>{availability.statusLabel}</span>
            </div>
            <span>
              {availability.availableSlots} of {availability.totalSlots} slots free
            </span>
          </div>

          {availability.slots.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
              No consultation slots available on this date. Please pick another date.
            </div>
          ) : (
            <div>
              <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-2 font-medium">
                <Clock className="w-3.5 h-3.5" />
                <span>Available Slots for {new Date(selectedDate + 'T00:00:00Z').toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}:</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-56 overflow-y-auto p-1">
                {availability.slots.map((slot) => {
                  const isSelected = selectedSlot === slot.time;
                  return (
                    <button
                      key={slot.time}
                      disabled={!slot.isAvailable}
                      onClick={() => onSlotSelect(slot.time)}
                      className={`py-2 px-2 text-xs rounded-xl font-bold transition-all text-center relative ${
                        !slot.isAvailable
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-dashed border-slate-200'
                          : isSelected
                          ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30 ring-2 ring-brand-600'
                          : 'bg-brand-50/60 hover:bg-brand-100/80 text-brand-900 border border-brand-200/60'
                      }`}
                    >
                      {slot.time}
                      {!slot.isAvailable && slot.reason && (
                        <span className="block text-[9px] text-slate-400 font-normal -mt-0.5">
                          {slot.reason}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
