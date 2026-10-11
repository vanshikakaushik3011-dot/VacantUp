import React from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Building2,
  CheckCircle,
  Briefcase,
  ChevronRight,
} from 'lucide-react';
import { AVAILABILITY_LABELS } from '@vacantup/shared';

interface DoctorCardProps {
  doctor: any;
  onBookClick?: (doctor: any) => void;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, onBookClick }) => {
  const statusKey = doctor.availabilityStatus || 'AVAILABLE';
  const statusInfo = AVAILABILITY_LABELS[statusKey] || {
    label: doctor.availabilityStatusLabel || 'Available',
    color: '#16a34a',
    bg: '#dcfce7',
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-brand-200 transition-all p-5 flex flex-col justify-between group">
      <div>
        {/* Top Header: Image, Name, Badge */}
        <div className="flex items-start space-x-4">
          <div className="relative shrink-0">
            <img
              src={doctor.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${doctor.name}`}
              alt={doctor.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-slate-100 shadow-sm"
            />
            {doctor.isVerified && (
              <div
                className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm text-brand-600"
                title="Verified Healthcare Practitioner"
              >
                <CheckCircle className="w-4 h-4 fill-brand-600 text-white" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-bold text-slate-900 text-base sm:text-lg truncate group-hover:text-brand-600 transition-colors">
                {doctor.name}
              </h3>
              {doctor.isDemo && (
                <span className="shrink-0 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                  Demo
                </span>
              )}
            </div>

            <p className="text-xs font-semibold text-brand-700 bg-brand-50 inline-block px-2.5 py-0.5 rounded-md mt-1">
              {doctor.specialty}
            </p>

            <p className="text-xs text-slate-500 line-clamp-1 mt-1 font-medium">{doctor.qualifications}</p>

            <div className="flex items-center space-x-3 text-xs text-slate-500 mt-1.5">
              <span className="flex items-center space-x-1">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                <span>{doctor.experienceYears} yrs exp</span>
              </span>
              <span className="flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{doctor.city}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Hospitals */}
        {doctor.hospitals && doctor.hospitals.length > 0 && (
          <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center space-x-2 text-xs text-slate-600">
            <Building2 className="w-3.5 h-3.5 text-brand-600 shrink-0" />
            <span className="truncate">
              {doctor.hospitals.map((h: any) => h.name).join(', ')}
            </span>
          </div>
        )}

        {/* Availability Badge */}
        <div className="mt-3 flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100">
          <div className="flex items-center space-x-2 text-xs">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: statusInfo.color }}
            />
            <span className="font-semibold text-slate-700">{doctor.availabilityStatusLabel || statusInfo.label}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block font-medium">Consultation Fee</span>
            <span className="text-sm font-extrabold text-slate-900">₹{doctor.consultationFee}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 pt-3 flex items-center space-x-2.5">
        <Link
          to={`/doctors/${doctor.id}`}
          className="flex-1 text-center py-2 px-3 text-xs font-semibold text-slate-700 hover:text-brand-600 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors"
        >
          View Profile
        </Link>
        <button
          onClick={() => {
            if (onBookClick) {
              onBookClick(doctor);
            } else {
              window.location.href = `/doctors/${doctor.id}?book=true`;
            }
          }}
          disabled={statusKey === 'FULLY_BOOKED' || statusKey === 'ON_LEAVE' || statusKey === 'NOT_AVAILABLE'}
          className={`flex-1 flex items-center justify-center space-x-1 py-2 px-3 text-xs font-bold rounded-xl transition-all shadow-sm ${
            statusKey === 'FULLY_BOOKED' || statusKey === 'ON_LEAVE' || statusKey === 'NOT_AVAILABLE'
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-500/20'
          }`}
        >
          <span>Book Slot</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
