import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, MapPin, Filter, HeartPulse, Calendar, Loader2, RotateCcw } from 'lucide-react';
import { doctorApi } from '../services/api';
import { DoctorCard } from '../components/DoctorCard';
import { BookingModal } from '../components/BookingModal';
import { SUPPORTED_CITIES, POPULAR_SPECIALTIES } from '@vacantup/shared';
import { useAuth } from '../context/AuthContext';

export const DoctorsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedCity, setSelectedCity } = useAuth();

  const [city, setCity] = useState(searchParams.get('city') || selectedCity || 'Karnal');
  const [specialty, setSpecialty] = useState(searchParams.get('specialty') || '');
  const [query, setQuery] = useState(searchParams.get('query') || '');
  const [date, setDate] = useState(searchParams.get('date') || new Date().toISOString().split('T')[0]);
  const [maxFee, setMaxFee] = useState<number>(Number(searchParams.get('maxFee')) || 2000);

  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [bookingDoctor, setBookingDoctor] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchDoctors = () => {
    setLoading(true);
    doctorApi
      .getAll({
        city: city !== 'All' ? city : undefined,
        specialty: specialty || undefined,
        query: query || undefined,
        date: date || undefined,
        maxFee,
      })
      .then((data) => setDoctors(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDoctors();
  }, [city, specialty, date, maxFee]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDoctors();
  };

  const handleResetFilters = () => {
    setCity('Karnal');
    setSpecialty('');
    setQuery('');
    setDate(new Date().toISOString().split('T')[0]);
    setMaxFee(2000);
    setSearchParams({});
  };

  const handleBookClick = (doc: any) => {
    setBookingDoctor(doc);
    setModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-brand-600">Directory</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Find Available Doctors</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Search qualified medical specialists and inspect real-time OPD availability for {city}.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Filters Sidebar */}
        <aside className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-5 lg:sticky lg:top-24">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="font-bold text-sm text-slate-900 flex items-center space-x-1.5">
              <Filter className="w-4 h-4 text-brand-600" />
              <span>Filters</span>
            </span>
            <button
              onClick={handleResetFilters}
              className="text-xs text-brand-600 hover:text-brand-700 font-semibold flex items-center space-x-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* City */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-brand-600" />
              <span>City</span>
            </label>
            <select
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                setSelectedCity(e.target.value);
              }}
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="All">All Cities</option>
              {SUPPORTED_CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Medical Specialty */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center space-x-1">
              <HeartPulse className="w-3.5 h-3.5 text-accent-600" />
              <span>Specialty</span>
            </label>
            <select
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">All Specialties</option>
              {POPULAR_SPECIALTIES.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Target Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-brand-600" />
              <span>Consultation Date</span>
            </label>
            <input
              type="date"
              min={new Date().toISOString().split('T')[0]}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
            </input>
          </div>

          {/* Max Fee */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Max Fee</span>
              <span className="text-brand-600">₹{maxFee}</span>
            </div>
            <input
              type="range"
              min={200}
              max={2500}
              step={100}
              value={maxFee}
              onChange={(e) => setMaxFee(Number(e.target.value))}
              className="w-full accent-brand-600 cursor-pointer"
            />
          </div>
        </aside>

        {/* Doctor List */}
        <main className="lg:col-span-3 space-y-4">
          {/* Quick Keyword Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search doctor by name, qualification, or hospital..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
              />
            </div>
            <button
              type="submit"
              className="py-2.5 px-5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-2xl transition-colors shadow-sm"
            >
              Search
            </button>
          </form>

          {loading ? (
            <div className="py-24 text-center text-slate-400 space-y-2">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-600" />
              <p className="text-xs font-semibold text-slate-500">Checking doctor schedules and real-time vacancies...</p>
            </div>
          ) : doctors.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-2">
              <p className="font-bold text-slate-800 text-sm">No doctors found matching criteria.</p>
              <p className="text-xs text-slate-400">Try adjusting your filters or resetting the city.</p>
              <button
                onClick={handleResetFilters}
                className="mt-2 text-xs font-bold text-brand-600 underline"
              >
                Reset all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {doctors.map((doc) => (
                <DoctorCard key={doc.id} doctor={doc} onBookClick={handleBookClick} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Booking Modal */}
      {bookingDoctor && (
        <BookingModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setBookingDoctor(null);
          }}
          doctor={bookingDoctor}
          hospital={bookingDoctor.hospitals?.[0] || { id: 'default', name: 'OPD Clinic', city }}
          appointmentDate={date}
          appointmentTime="10:00 AM"
        />
      )}
    </div>
  );
};
