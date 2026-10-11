import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck2, ShieldCheck, Heart, AlertCircle } from 'lucide-react';
import { SUPPORTED_CITIES, POPULAR_SPECIALTIES } from '@vacantup/shared';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Medical Emergency Banner */}
        <div className="mb-12 p-4 rounded-2xl bg-amber-950/40 border border-amber-800/40 flex items-start space-x-3 text-amber-200 text-xs leading-relaxed">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-300">Medical Emergency Notice: </span>
            VacantUp is a scheduled consultation booking platform. In case of an emergency, please immediately call{' '}
            <strong className="text-white">112</strong> (National Emergency) or visit your nearest hospital emergency ward.
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-500 to-accent-400 flex items-center justify-center text-white shadow-md">
                <CalendarCheck2 className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">VacantUp</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Skip the Queue. Find Available Doctors Instantly. Connecting patients directly to real-time doctor availability and hospital OPD schedules.
            </p>
            <div className="flex items-center space-x-2 text-xs text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Doctors & Real-time Slots</span>
            </div>
          </div>

          {/* Supported Cities */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Cities in India</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              {SUPPORTED_CITIES.slice(0, 6).map((city) => (
                <li key={city}>
                  <Link to={`/doctors?city=${city}`} className="hover:text-brand-400 transition-colors">
                    Doctors in {city}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Specialties */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Popular Specialties</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              {POPULAR_SPECIALTIES.slice(0, 6).map((s) => (
                <li key={s.slug}>
                  <Link to={`/doctors?specialty=${s.slug}`} className="hover:text-brand-400 transition-colors">
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Portals & Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Portals & Access</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/login" className="hover:text-brand-400 transition-colors">
                  Patient Portal
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-brand-400 transition-colors">
                  Doctor OPD Dashboard
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-brand-400 transition-colors">
                  Hospital Administration
                </Link>
              </li>
              <li>
                <Link to="/hospitals" className="hover:text-brand-400 transition-colors">
                  Partner Hospitals
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-brand-400 transition-colors">
                  Join as a Healthcare Provider
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} VacantUp Healthcare Technologies. All rights reserved.</p>
          <p className="flex items-center space-x-1 mt-2 sm:mt-0">
            <span>Engineered with care for India</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
          </p>
        </div>
      </div>
    </footer>
  );
};
