import React, { useState, useEffect } from 'react';
import { Building2, Users, Calendar, Plus, CheckCircle, Mail, Phone, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { hospitalApi, appointmentApi } from '../services/api';

export const HospitalDashboard: React.FC = () => {
  const { user } = useAuth();
  const [hospital, setHospital] = useState<any | null>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    hospitalApi
      .getAll({ city: 'Karnal' })
      .then((hospList) => {
        if (hospList.length > 0) {
          return hospitalApi.getById(hospList[0].id);
        }
      })
      .then((hospData) => {
        if (hospData) setHospital(hospData);
      })
      .then(() => appointmentApi.getMy())
      .then((apts) => setAppointments(apts || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hospital Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-extrabold text-slate-900">{hospital?.name || 'Hospital Administration'}</h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
                Hospital Portal
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {hospital?.address}, {hospital?.city} | Phone: {hospital?.phone}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="bg-purple-50 px-3.5 py-2 rounded-xl text-center">
            <span className="block text-[10px] text-purple-600 font-bold uppercase">Doctors</span>
            <span className="text-lg font-black text-purple-900">{hospital?.doctorCount || 4}</span>
          </div>
          <div className="bg-brand-50 px-3.5 py-2 rounded-xl text-center">
            <span className="block text-[10px] text-brand-600 font-bold uppercase">Departments</span>
            <span className="text-lg font-black text-brand-900">{hospital?.departments?.length || 5}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Doctors in this hospital */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <Users className="w-4 h-4 text-brand-600" />
            <span>Doctors Practicing at Hospital</span>
          </h2>

          <div className="space-y-3">
            {hospital?.doctors?.map((doc: any) => (
              <div key={doc.id} className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <img
                    src={doc.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${doc.name}`}
                    alt={doc.name}
                    className="w-10 h-10 rounded-xl object-cover"
                  />
                  <div>
                    <h3 className="font-bold text-slate-900">{doc.name}</h3>
                    <p className="text-brand-600">{doc.specialty}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-slate-900">₹{doc.consultationFee}</span>
                  <span className="text-[10px] text-emerald-600 block font-semibold">Active OPD</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Clinical departments & booking stats */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900">Clinical Departments</h2>
          <div className="flex flex-wrap gap-2">
            {hospital?.departments?.map((dept: string) => (
              <span
                key={dept}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200/50"
              >
                {dept}
              </span>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-700 mb-2">Hospital Contact</h3>
            <p className="text-xs text-slate-500">Official inquiries: {hospital?.email}</p>
            <p className="text-xs text-slate-500">Emergency OPD line: {hospital?.phone}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
