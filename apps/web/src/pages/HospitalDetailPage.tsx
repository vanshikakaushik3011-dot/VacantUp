import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  ArrowLeft,
  Loader2,
  Users,
  ChevronRight,
} from 'lucide-react';
import { hospitalApi } from '../services/api';

export const HospitalDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [hospital, setHospital] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    hospitalApi
      .getById(id)
      .then((data) => setHospital(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="py-32 text-center text-slate-400 space-y-2">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-600" />
        <p className="text-xs font-semibold text-slate-500">Loading hospital details...</p>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Hospital Not Found</h2>
        <Link to="/hospitals" className="inline-block py-2 px-4 bg-brand-600 text-white text-xs font-bold rounded-xl">
          Return to Hospitals
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <Link
          to="/hospitals"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Hospitals</span>
        </Link>
      </div>

      {/* Hospital Banner */}
      <div className="bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm">
        <div className="h-64 sm:h-80 w-full relative">
          <img
            src={
              hospital.imageUrl ||
              'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=1200&auto=format&fit=crop&q=80'
            }
            alt={hospital.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
            <div className="flex items-center space-x-2">
              {hospital.isVerified && (
                <span className="flex items-center space-x-1 bg-white text-brand-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                  <CheckCircle className="w-3.5 h-3.5 text-brand-600" />
                  <span>Verified Healthcare Facility</span>
                </span>
              )}
              {hospital.isDemo && (
                <span className="bg-slate-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Demo
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">{hospital.name}</h1>
            <p className="text-xs sm:text-sm text-slate-200 flex items-center space-x-1.5">
              <MapPin className="w-4 h-4 text-brand-400" />
              <span>{hospital.address}, {hospital.city}, {hospital.state} - {hospital.pincode}</span>
            </p>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50">
          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-brand-600" />
              <span>Reception / OPD Hotline: <strong>{hospital.phone}</strong></span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-brand-600" />
              <span>Official Email: <strong>{hospital.email}</strong></span>
            </div>
          </div>

          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              Available Clinical Departments
            </span>
            <div className="flex flex-wrap gap-1.5">
              {hospital.departments?.map((d: string) => (
                <span
                  key={d}
                  className="text-xs font-semibold bg-white border border-slate-200 text-slate-700 px-2.5 py-1 rounded-lg shadow-2xs"
                >
                  {d}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Associated Doctors */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-brand-600" />
            <h2 className="text-xl font-bold text-slate-900">Practicing Specialists at {hospital.name}</h2>
          </div>
          <span className="text-xs font-bold text-slate-500">
            {hospital.doctors?.length || 0} Doctors
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hospital.doctors?.map((doc: any) => (
            <div
              key={doc.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start space-x-3">
                <img
                  src={doc.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${doc.name}`}
                  alt={doc.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-100"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-slate-900 truncate">{doc.name}</h3>
                  <p className="text-xs text-brand-600 font-semibold">{doc.specialty}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{doc.qualifications}</p>
                  <span className="text-xs font-extrabold text-slate-900 block mt-1">₹{doc.consultationFee}</span>
                </div>
              </div>

              <Link
                to={`/doctors/${doc.id}`}
                className="w-full py-2 px-3 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl text-center flex items-center justify-center space-x-1"
              >
                <span>Check OPD Schedule & Book</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
