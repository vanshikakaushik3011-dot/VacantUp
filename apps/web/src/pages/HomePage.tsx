import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  MapPin,
  Calendar,
  Sparkles,
  ShieldCheck,
  Clock,
  HeartPulse,
  Users,
  Building2,
  ChevronRight,
  HelpCircle,
  Smartphone,
  Star,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { doctorApi, hospitalApi } from '../services/api';
import { DoctorCard } from '../components/DoctorCard';
import { HospitalCard } from '../components/HospitalCard';
import { SUPPORTED_CITIES, POPULAR_SPECIALTIES } from '@vacantup/shared';

export const HomePage: React.FC = () => {
  const { selectedCity, setSelectedCity } = useAuth();
  const navigate = useNavigate();

  // Search form states
  const [city, setCity] = useState(selectedCity || 'Karnal');
  const [specialty, setSpecialty] = useState('');
  const [query, setQuery] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Featured data
  const [doctors, setDoctors] = useState<any[]>([]);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync selectedCity from auth context
  useEffect(() => {
    if (selectedCity) {
      setCity(selectedCity);
    }
  }, [selectedCity]);

  useEffect(() => {
    Promise.all([
      doctorApi.getAll({ city }),
      hospitalApi.getAll({ city }),
    ])
      .then(([docRes, hospRes]) => {
        setDoctors(docRes.slice(0, 4));
        setHospitals(hospRes.slice(0, 3));
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [city]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (specialty) params.set('specialty', specialty);
    if (query) params.set('query', query);
    if (date) params.set('date', date);
    navigate(`/doctors?${params.toString()}`);
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/70 via-white to-slate-50 pt-12 pb-20 border-b border-slate-200/60">
        <div className="absolute inset-0 bg-[radial-gradient(#0284c7_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-100/80 border border-brand-200/80 text-brand-800 text-xs font-bold tracking-wide shadow-sm animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              <span>Skip the Queue. Find Available Doctors Instantly.</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              Healthcare Appointments, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-accent-600">
                Without the Wait.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
              Discover doctors, check appointment availability, and book your visit online in just a few clicks. Real-time slot visibility across leading hospitals and clinics.
            </p>
          </div>

          {/* Search Box Card */}
          <div className="mt-10 max-w-4xl mx-auto bg-white rounded-3xl shadow-xl shadow-brand-900/5 border border-slate-200/80 p-4 sm:p-6">
            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* City */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-brand-600" />
                  <span>City / Location</span>
                </label>
                <select
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    setSelectedCity(e.target.value);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {SUPPORTED_CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Specialty */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
                  <HeartPulse className="w-3.5 h-3.5 text-accent-600" />
                  <span>Medical Specialty</span>
                </label>
                <select
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">All Specialties</option>
                  {POPULAR_SPECIALTIES.map((s) => (
                    <option key={s.slug} value={s.slug}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Doctor / Hospital Name */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
                  <Users className="w-3.5 h-3.5 text-brand-600" />
                  <span>Doctor or Hospital</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Rajesh Sharma"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Search Action */}
              <div className="space-y-1 flex flex-col justify-end">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-700 hover:to-accent-700 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-600/25 flex items-center justify-center space-x-2 transition-all group"
                >
                  <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Find Available Doctors</span>
                </button>
              </div>
            </form>

            {/* Quick Pills */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400 text-[11px] font-semibold">Popular Searches:</span>
              <button
                onClick={() => {
                  setCity('Karnal');
                  setSpecialty('dermatology');
                  navigate('/doctors?city=Karnal&specialty=dermatology');
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-600 text-[11px] font-medium transition-colors"
              >
                Dermatologist in Karnal
              </button>
              <button
                onClick={() => {
                  setCity('Karnal');
                  setSpecialty('pediatrics');
                  navigate('/doctors?city=Karnal&specialty=pediatrics');
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-600 text-[11px] font-medium transition-colors"
              >
                Pediatrician in Karnal
              </button>
              <button
                onClick={() => {
                  setCity('New Delhi');
                  setSpecialty('cardiology');
                  navigate('/doctors?city=New Delhi&specialty=cardiology');
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-600 text-[11px] font-medium transition-colors"
              >
                Cardiologist in Delhi
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Medical Specialties */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600">Departments</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Medical Specialties</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Consult with board-certified healthcare professionals across specialized fields.
            </p>
          </div>
          <Link
            to="/doctors"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center space-x-1"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
          {POPULAR_SPECIALTIES.map((spec) => (
            <Link
              key={spec.slug}
              to={`/doctors?city=${city}&specialty=${spec.slug}`}
              className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-brand-300 transition-all group flex flex-col items-center text-center space-y-2"
            >
              <div className="w-12 h-12 rounded-2xl bg-brand-50 group-hover:bg-brand-600 text-brand-600 group-hover:text-white flex items-center justify-center transition-colors">
                <HeartPulse className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-brand-600 transition-colors">
                {spec.name}
              </h3>
              <p className="text-[10px] text-slate-400 line-clamp-1">{spec.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Available Doctors */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600">Immediate Availability</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Doctors in {city}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Check OPD slot vacancies and secure your consultation time without waiting in lines.
            </p>
          </div>
          <Link
            to={`/doctors?city=${city}`}
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center space-x-1"
          >
            <span>Browse {city} Doctors</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {doctors.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
            <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No doctors currently listed for {city}</p>
            <p className="text-xs text-slate-400 mt-1">Try switching to Karnal or New Delhi.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {doctors.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
        )}
      </section>

      {/* Hospital Network */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600">Verified Institutions</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Hospitals & Clinics
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Leading multispecialty hospitals with live doctor schedule coordination.
            </p>
          </div>
          <Link
            to="/hospitals"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center space-x-1"
          >
            <span>All Hospitals</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {hospitals.map((hospital) => (
            <HospitalCard key={hospital.id} hospital={hospital} />
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-brand-900 to-slate-900 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden">
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400">Streamlined OPD Process</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-1">
              How VacantUp Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2">
              We eliminated the traditional chaos of morning OPD lines with guaranteed appointment vacancies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3 bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center font-black text-sm">
                1
              </div>
              <h3 className="text-base font-bold text-white">Find Doctor & Hospital</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Choose your city (e.g. Karnal), select your medical specialty, or search directly for your trusted doctor or clinic.
              </p>
            </div>

            <div className="space-y-3 bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-accent-500 text-white flex items-center justify-center font-black text-sm">
                2
              </div>
              <h3 className="text-base font-bold text-white">Verify Real-Time Slots</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                See transparent status pills: <span className="text-emerald-400 font-semibold">Available</span>, <span className="text-amber-400 font-semibold">Few Slots Left</span>, or <span className="text-red-400 font-semibold">Fully Booked</span> without guessing.
              </p>
            </div>

            <div className="space-y-3 bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-brand-400 text-slate-950 flex items-center justify-center font-black text-sm">
                3
              </div>
              <h3 className="text-base font-bold text-white">Instant Reference</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Confirm your slot in one click. Receive a unique booking reference (<code className="text-brand-300">VAC-2026-XXXXXX</code>) accepted directly at the hospital reception.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600">Got Questions?</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
            <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-brand-600" />
              <span>How does VacantUp prevent double bookings?</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed pl-6">
              Our backend features atomic slot validation and database constraints. When an appointment is reserved, the slot is locked immediately across web and mobile clients, preventing simultaneous conflicting bookings.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
            <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-brand-600" />
              <span>Can I reschedule or cancel my appointment?</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed pl-6">
              Yes! You can reschedule to any other available slot or cancel directly from your Patient Dashboard on both the website and mobile app.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
            <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-brand-600" />
              <span>Are Android and iOS mobile applications available?</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed pl-6">
              Yes, VacantUp includes full native mobile applications for Android (Google Play Store AAB) and iOS (Apple App Store) built on React Native & Expo, sharing the exact same real-time account, bookings, and notifications.
            </p>
          </div>
        </div>
      </section>

      {/* Mobile App Download CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-brand-600 to-accent-600 rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl shadow-brand-600/20">
          <div className="space-y-3 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">
              Mobile Experience
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold leading-snug">
              Book on the Go with VacantUp Android & iOS Apps
            </h2>
            <p className="text-xs sm:text-sm text-brand-50 leading-relaxed">
              Experience lightning-fast slot discovery, secure session storage, native notifications, and offline appointment passes right on your smartphone.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <div className="bg-slate-950/80 hover:bg-slate-950 px-5 py-3 rounded-2xl border border-white/20 flex items-center space-x-3 transition-colors cursor-pointer">
              <Smartphone className="w-6 h-6 text-brand-400" />
              <div className="text-left">
                <span className="text-[10px] text-slate-400 block font-medium">Download for</span>
                <span className="text-xs font-bold text-white">Google Play</span>
              </div>
            </div>
            <div className="bg-slate-950/80 hover:bg-slate-950 px-5 py-3 rounded-2xl border border-white/20 flex items-center space-x-3 transition-colors cursor-pointer">
              <Smartphone className="w-6 h-6 text-accent-400" />
              <div className="text-left">
                <span className="text-[10px] text-slate-400 block font-medium">Download on</span>
                <span className="text-xs font-bold text-white">Apple App Store</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
