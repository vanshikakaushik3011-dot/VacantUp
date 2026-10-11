import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, MapPin, Building2, Loader2 } from 'lucide-react';
import { hospitalApi } from '../services/api';
import { HospitalCard } from '../components/HospitalCard';
import { SUPPORTED_CITIES } from '@vacantup/shared';
import { useAuth } from '../context/AuthContext';

export const HospitalsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { selectedCity, setSelectedCity } = useAuth();

  const [city, setCity] = useState(searchParams.get('city') || selectedCity || 'Karnal');
  const [query, setQuery] = useState(searchParams.get('query') || '');
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHospitals = () => {
    setLoading(true);
    hospitalApi
      .getAll({
        city: city !== 'All' ? city : undefined,
        query: query || undefined,
      })
      .then((data) => setHospitals(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchHospitals();
  }, [city]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHospitals();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-brand-600">Network</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Hospitals & Clinics</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Explore partner hospitals and view department specializations across India.
        </p>
      </div>

      {/* Filter and search bar */}
      <form onSubmit={handleSearchSubmit} className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 sm:w-64">
          <MapPin className="w-4 h-4 text-brand-600 shrink-0" />
          <select
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              setSelectedCity(e.target.value);
            }}
            className="bg-transparent text-xs font-semibold text-slate-700 w-full focus:outline-none"
          >
            <option value="All">All Cities</option>
            {SUPPORTED_CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search hospital by name, department, or address..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <button
          type="submit"
          className="py-2 px-5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-2xl transition-colors shadow-sm"
        >
          Search
        </button>
      </form>

      {/* List */}
      {loading ? (
        <div className="py-24 text-center text-slate-400 space-y-2">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-600" />
          <p className="text-xs font-semibold text-slate-500">Loading hospitals...</p>
        </div>
      ) : hospitals.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
          <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="font-bold text-slate-800 text-sm">No hospitals found.</p>
          <p className="text-xs text-slate-400 mt-1">Try switching the city or clearing the search terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hospitals.map((hosp) => (
            <HospitalCard key={hosp.id} hospital={hosp} />
          ))}
        </div>
      )}
    </div>
  );
};
