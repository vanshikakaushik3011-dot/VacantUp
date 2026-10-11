import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle,
  MapPin,
  Briefcase,
  Building2,
  Calendar,
  Clock,
  ArrowLeft,
  Loader2,
  AlertCircle,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';
import { doctorApi } from '../services/api';
import { SlotPicker } from '../components/SlotPicker';
import { BookingModal } from '../components/BookingModal';

export const DoctorDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [doctor, setDoctor] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Booking states
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(tomorrowStr);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedHospital, setSelectedHospital] = useState<any | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    doctorApi
      .getById(id)
      .then((data) => {
        setDoctor(data);
        if (data.hospitals && data.hospitals.length > 0) {
          setSelectedHospital(data.hospitals[0]);
        }
      })
      .catch((err) => {
        setError(err.response?.data?.error || 'Failed to load doctor profile');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="py-32 text-center text-slate-400 space-y-2">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-600" />
        <p className="text-xs font-semibold text-slate-500">Loading doctor profile and schedules...</p>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Doctor Profile Not Found</h2>
        <p className="text-xs text-slate-500">{error || 'This doctor record is unavailable.'}</p>
        <Link
          to="/doctors"
          className="inline-block py-2 px-4 bg-brand-600 text-white text-xs font-bold rounded-xl"
        >
          Return to Doctors Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <div>
        <Link
          to="/doctors"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Doctor Directory</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Doctor Profile & Qualifications */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-5">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="relative">
                <img
                  src={doctor.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${doctor.name}`}
                  alt={doctor.name}
                  className="w-28 h-28 rounded-3xl object-cover shadow-md border-2 border-white ring-2 ring-brand-100"
                />
                {doctor.isVerified && (
                  <div
                    className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm text-brand-600"
                    title="Verified Doctor"
                  >
                    <CheckCircle className="w-5 h-5 fill-brand-600 text-white" />
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-center space-x-2">
                  <h1 className="text-xl font-extrabold text-slate-900">{doctor.name}</h1>
                  {doctor.isDemo && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                      Demo
                    </span>
                  )}
                </div>
                <span className="inline-block mt-1 text-xs font-bold text-brand-700 bg-brand-50 px-3 py-1 rounded-full">
                  {doctor.specialty}
                </span>
                <p className="text-xs text-slate-500 mt-2 font-medium">{doctor.qualifications}</p>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-2.5 text-xs text-slate-600">
              <div className="flex items-center space-x-2.5">
                <Briefcase className="w-4 h-4 text-brand-600 shrink-0" />
                <span>{doctor.experienceYears} Years Clinical Experience</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <MapPin className="w-4 h-4 text-brand-600 shrink-0" />
                <span>{doctor.city}, {doctor.state}</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <CreditCard className="w-4 h-4 text-brand-600 shrink-0" />
                <span>Standard Consultation Fee: <strong>₹{doctor.consultationFee}</strong></span>
              </div>
            </div>

            {/* About / Bio */}
            <div className="border-t border-slate-100 pt-4 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">About Practitioner</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{doctor.bio}</p>
            </div>

            {/* Hospital Affiliations Selector */}
            {doctor.hospitals && doctor.hospitals.length > 0 && (
              <div className="border-t border-slate-100 pt-4 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Hospital Affiliations</h3>
                <div className="space-y-2">
                  {doctor.hospitals.map((h: any) => (
                    <div
                      key={h.id}
                      onClick={() => setSelectedHospital(h)}
                      className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all ${
                        selectedHospital?.id === h.id
                          ? 'border-brand-500 bg-brand-50/50 ring-1 ring-brand-500'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-slate-800">{h.name}</span>
                        <span className="font-extrabold text-brand-700">₹{h.consultationFee}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{h.address}, {h.city}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Interactive Schedule & Slot Booking */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600">Real-Time OPD Availability</span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">Select Date and Appointment Slot</h2>
              <p className="text-xs text-slate-500 mt-1">
                Slots are synchronized with doctor working hours, break schedules, and confirmed bookings.
              </p>
            </div>

            <SlotPicker
              doctorId={doctor.id}
              selectedDate={selectedDate}
              onDateChange={(d) => {
                setSelectedDate(d);
                setSelectedSlot(null);
              }}
              selectedSlot={selectedSlot}
              onSlotSelect={setSelectedSlot}
            />

            {/* Selected Slot Summary Action */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-700">
                {selectedSlot ? (
                  <span>
                    Selected Slot:{' '}
                    <strong className="text-brand-600 text-sm">
                      {selectedDate} at {selectedSlot}
                    </strong>
                    {selectedHospital && (
                      <span className="block text-[11px] text-slate-500 mt-0.5">
                        Hospital: {selectedHospital.name} (Fee: ₹{selectedHospital.consultationFee})
                      </span>
                    )}
                  </span>
                ) : (
                  <span className="text-slate-400">Please choose a consultation time slot above to proceed.</span>
                )}
              </div>

              <button
                disabled={!selectedSlot}
                onClick={() => setBookingModalOpen(true)}
                className="w-full sm:w-auto py-2.5 px-6 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold rounded-xl shadow-md transition-all shrink-0"
              >
                Book Appointment Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {selectedHospital && (
        <BookingModal
          isOpen={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
          doctor={doctor}
          hospital={selectedHospital}
          appointmentDate={selectedDate}
          appointmentTime={selectedSlot || '10:00 AM'}
        />
      )}
    </div>
  );
};
