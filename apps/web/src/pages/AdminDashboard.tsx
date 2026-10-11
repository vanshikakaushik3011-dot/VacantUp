import React, { useState, useEffect } from 'react';
import {
  Users,
  Building2,
  CalendarCheck,
  CreditCard,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Loader2,
  FileText,
} from 'lucide-react';
import { adminApi, doctorApi, hospitalApi } from '../services/api';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any | null>(null);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      adminApi.getStats(),
      doctorApi.getAll(),
      hospitalApi.getAll(),
      adminApi.getAuditLogs(),
    ])
      .then(([statsData, docs, hosps, logs]) => {
        setStats(statsData);
        setDoctors(docs);
        setHospitals(hosps);
        setAuditLogs(logs);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleDoctorVerify = async (docId: string, currentStatus: boolean) => {
    try {
      await adminApi.verifyDoctor(docId, !currentStatus);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update doctor verification');
    }
  };

  const handleToggleHospitalVerify = async (hospId: string, currentStatus: boolean) => {
    try {
      await adminApi.verifyHospital(hospId, !currentStatus);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update hospital verification');
    }
  };

  if (loading) {
    return (
      <div className="py-32 text-center text-slate-400 space-y-2">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-600" />
        <p className="text-xs font-semibold text-slate-500">Loading admin metrics...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-rose-600">Platform Command</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">VacantUp Platform Administration</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Monitor system-wide bookings, provider verification status, and security audit logs.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-slate-400 text-xs font-bold uppercase">Total Users</span>
          <p className="text-2xl font-black text-slate-900">{stats?.totalUsers || 0}</p>
          <span className="text-[11px] text-brand-600 font-semibold">Patients & Providers</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-slate-400 text-xs font-bold uppercase">Total Bookings</span>
          <p className="text-2xl font-black text-slate-900">{stats?.totalAppointments || 0}</p>
          <span className="text-[11px] text-emerald-600 font-semibold">{stats?.confirmedAppointments || 0} Confirmed</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-slate-400 text-xs font-bold uppercase">Verified Doctors</span>
          <p className="text-2xl font-black text-slate-900">{stats?.totalDoctors || 0}</p>
          <span className="text-[11px] text-accent-600 font-semibold">Across multiple cities</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-slate-400 text-xs font-bold uppercase">Gross Consultation Value</span>
          <p className="text-2xl font-black text-slate-900">₹{stats?.totalRevenue || 0}</p>
          <span className="text-[11px] text-purple-600 font-semibold">OPD Appointments</span>
        </div>
      </div>

      {/* Verification Management */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Doctors Verification */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-brand-600" />
            <span>Doctor Verification Management</span>
          </h2>
          <div className="space-y-3">
            {doctors.map((doc) => (
              <div key={doc.id} className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-slate-900">{doc.name}</h4>
                  <p className="text-slate-500 text-[11px]">{doc.specialty} • {doc.city}</p>
                </div>
                <button
                  onClick={() => handleToggleDoctorVerify(doc.id, doc.isVerified)}
                  className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
                    doc.isVerified
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                  }`}
                >
                  {doc.isVerified ? 'Verified ✓' : 'Approve Verification'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Hospitals Verification */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-purple-600" />
            <span>Hospital Verification Management</span>
          </h2>
          <div className="space-y-3">
            {hospitals.map((hosp) => (
              <div key={hosp.id} className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-slate-900">{hosp.name}</h4>
                  <p className="text-slate-500 text-[11px]">{hosp.city}</p>
                </div>
                <button
                  onClick={() => handleToggleHospitalVerify(hosp.id, hosp.isVerified)}
                  className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
                    hosp.isVerified
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                  }`}
                >
                  {hosp.isVerified ? 'Verified ✓' : 'Approve Facility'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Audit Logs */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
          <FileText className="w-4 h-4 text-slate-600" />
          <span>Security & Transaction Audit Logs</span>
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
                <th className="py-2 px-3">Timestamp</th>
                <th className="py-2 px-3">Action</th>
                <th className="py-2 px-3">Entity</th>
                <th className="py-2 px-3">Context Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-2 px-3 text-slate-500 font-mono text-[11px]">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="py-2 px-3 font-bold text-brand-700">{log.action}</td>
                  <td className="py-2 px-3 text-slate-600">{log.entityType}</td>
                  <td className="py-2 px-3 text-slate-500 font-mono text-[10px] truncate max-w-xs">
                    {log.details || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
