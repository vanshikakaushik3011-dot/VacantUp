import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CalendarCheck2,
  MapPin,
  Bell,
  User,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  CheckCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { SUPPORTED_CITIES } from '@vacantup/shared';

export const Navbar: React.FC = () => {
  const { user, logout, selectedCity, setSelectedCity } = useAuth();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'DOCTOR':
        return '/dashboard/doctor';
      case 'HOSPITAL_ADMIN':
        return '/dashboard/hospital';
      case 'PLATFORM_ADMIN':
        return '/dashboard/admin';
      case 'PATIENT':
      default:
        return '/dashboard/patient';
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <CalendarCheck2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center">
                <span className="text-xl font-black tracking-tight text-slate-900">Vacant</span>
                <span className="text-xl font-black tracking-tight text-brand-600">Up</span>
              </div>
              <p className="text-[10px] text-slate-500 -mt-1 font-medium hidden sm:block">Instant Doctor Booking</p>
            </div>
          </Link>

          {/* City Selector */}
          <div className="hidden md:flex items-center space-x-2 bg-slate-100 hover:bg-slate-200/80 px-3 py-1.5 rounded-full transition-colors">
            <MapPin className="w-4 h-4 text-brand-600 shrink-0" />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-transparent text-sm font-semibold text-slate-700 focus:outline-none cursor-pointer pr-2"
            >
              {SUPPORTED_CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-semibold text-slate-600">
            <Link to="/doctors" className="hover:text-brand-600 transition-colors">
              Find Doctors
            </Link>
            <Link to="/hospitals" className="hover:text-brand-600 transition-colors">
              Hospitals
            </Link>
            <Link to="/#how-it-works" className="hover:text-brand-600 transition-colors">
              How It Works
            </Link>
          </nav>

          {/* Right Action Icons & User Menu */}
          <div className="flex items-center space-x-3">
            {/* Notification Bell */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className="p-2 rounded-full text-slate-600 hover:text-brand-600 hover:bg-slate-100 transition-colors relative"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {notifDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50">
                    <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-800">In-App Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={() => markAllRead()}
                          className="text-xs text-brand-600 hover:text-brand-700 flex items-center space-x-1 font-medium"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span>Mark all read</span>
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <p className="p-6 text-center text-sm text-slate-500">No notifications yet.</p>
                      ) : (
                        notifications.slice(0, 10).map((n) => (
                          <div
                            key={n.id}
                            onClick={() => {
                              if (!n.isRead) markRead(n.id);
                            }}
                            className={`p-3 text-xs cursor-pointer hover:bg-slate-50 transition-colors ${
                              !n.isRead ? 'bg-brand-50/50 font-medium' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-slate-900">{n.title}</span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-slate-600 leading-relaxed">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Auth Buttons or User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-slate-100 transition-colors border border-slate-200"
                >
                  <img
                    src={user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                  <span className="text-xs font-semibold text-slate-700 hidden sm:block max-w-[100px] truncate">
                    {user.name}
                  </span>
                </button>

                {/* Dropdown */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-900 truncate">{user.name}</p>
                      <span className="inline-block mt-0.5 px-2 py-0.5 text-[10px] font-bold rounded-md bg-brand-100 text-brand-700">
                        {user.role.replace('_', ' ')}
                      </span>
                    </div>
                    <Link
                      to={getDashboardLink()}
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <LayoutDashboard className="w-4 h-4 text-brand-600" />
                      <span>Dashboard</span>
                    </Link>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                        navigate('/');
                      }}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-brand-600 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-brand-600"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3">
          <div className="flex items-center space-x-2 bg-slate-100 px-3 py-2 rounded-xl">
            <MapPin className="w-4 h-4 text-brand-600" />
            <select
              value={selectedCity}
              onChange={(e) => {
                setSelectedCity(e.target.value);
                setMobileMenuOpen(false);
              }}
              className="bg-transparent text-sm font-semibold text-slate-800 w-full focus:outline-none"
            >
              {SUPPORTED_CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <Link
            to="/doctors"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:text-brand-600 rounded-lg hover:bg-slate-50"
          >
            Find Doctors
          </Link>
          <Link
            to="/hospitals"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:text-brand-600 rounded-lg hover:bg-slate-50"
          >
            Hospitals
          </Link>
          {user && (
            <Link
              to={getDashboardLink()}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-brand-600 rounded-lg bg-brand-50"
            >
              My Dashboard
            </Link>
          )}
        </div>
      )}
    </header>
  );
};
