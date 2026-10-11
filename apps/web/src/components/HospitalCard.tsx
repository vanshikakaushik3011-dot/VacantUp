import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, MapPin, Phone, Users, CheckCircle, ChevronRight } from 'lucide-react';

interface HospitalCardProps {
  hospital: any;
}

export const HospitalCard: React.FC<HospitalCardProps> = ({ hospital }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-brand-200 transition-all overflow-hidden flex flex-col justify-between group">
      <div>
        <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
          <img
            src={
              hospital.imageUrl ||
              'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800&auto=format&fit=crop&q=80'
            }
            alt={hospital.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 left-3 flex items-center space-x-1.5">
            {hospital.isVerified && (
              <span className="flex items-center space-x-1 bg-white/95 backdrop-blur text-brand-700 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                <CheckCircle className="w-3 h-3 text-brand-600" />
                <span>Verified Hospital</span>
              </span>
            )}
            {hospital.isDemo && (
              <span className="bg-slate-900/80 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                Demo
              </span>
            )}
          </div>
        </div>

        <div className="p-5">
          <h3 className="font-bold text-slate-900 text-lg group-hover:text-brand-600 transition-colors">
            {hospital.name}
          </h3>

          <div className="flex items-center space-x-1.5 text-xs text-slate-500 mt-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{hospital.address}, {hospital.city}</span>
          </div>

          <div className="flex items-center space-x-4 text-xs text-slate-500 mt-2">
            <span className="flex items-center space-x-1">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{hospital.phone}</span>
            </span>
            <span className="flex items-center space-x-1 text-brand-600 font-semibold">
              <Users className="w-3.5 h-3.5" />
              <span>{hospital.doctorCount || 0} Doctors Available</span>
            </span>
          </div>

          {hospital.departments && hospital.departments.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {hospital.departments.slice(0, 4).map((dept: string) => (
                <span
                  key={dept}
                  className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
                >
                  {dept}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="p-5 pt-0">
        <Link
          to={`/hospitals/${hospital.id}`}
          className="w-full flex items-center justify-center space-x-1.5 py-2.5 px-4 bg-slate-100 hover:bg-brand-50 text-slate-700 hover:text-brand-700 text-xs font-bold rounded-xl transition-colors"
        >
          <span>View Hospital & Doctors</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
