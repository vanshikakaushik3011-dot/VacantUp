
import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  CalendarCheck2,
  Lock,
  Mail,
  AlertCircle,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;

    if (typeof data === 'string' && data.trim()) {
      return data;
    }

    if (data && typeof data === 'object') {
      const responseData = data as {
        code?: unknown;
        message?: unknown;
        error?: unknown;
      };

      if (
        typeof responseData.message === 'string' &&
        responseData.message.trim()
      ) {
        return responseData.message;
      }

      if (
        typeof responseData.error === 'string' &&
        responseData.error.trim()
      ) {
        return responseData.error;
      }
    }

    if (!error.response) {
      return 'Unable to connect to the server. Please check your internet connection.';
    }

    if (error.response.status === 401) {
      return 'Invalid email or password.';
    }

    if (error.response.status === 403) {
      return 'You do not have permission to sign in.';
    }

    if (error.response.status === 404) {
      return 'The login service could not be found. Please contact support.';
    }

    if (error.response.status >= 500) {
      return 'The server encountered an error. Please try again later.';
    }

    return 'Unable to sign in. Please check your details and try again.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error && typeof error === 'object') {
    const value = error as { message?: unknown };

    if (typeof value.message === 'string') {
      return value.message;
    }
  }

  return 'Something went wrong. Please try again.';
}

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const requestedRedirect = searchParams.get('redirect');
  const redirectPath =
    requestedRedirect?.startsWith('/') &&
    !requestedRedirect.startsWith('//') &&
    !requestedRedirect.includes('\\')
      ? requestedRedirect
      : '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authenticate = async (
    loginEmail: string,
    loginPassword: string
  ) => {
    if (loading) return;

    if (!loginEmail.trim() || !loginPassword) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await login(loginEmail.trim(), loginPassword);

      navigate(redirectPath, { replace: true });
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await authenticate(email, password);
  };

  const handleQuickLogin = async (
    demoEmail: string,
    demoPassword: string
  ) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    await authenticate(demoEmail, demoPassword);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-3xl border border-slate-200/90 shadow-xl shadow-brand-900/5">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-accent-500 flex items-center justify-center text-white mx-auto shadow-md">
            <CalendarCheck2 className="w-7 h-7" />
          </div>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Sign In to VacantUp
          </h2>

          <p className="text-xs text-slate-500">
            Access your appointments, OPD queue, and medical schedules
          </p>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block text-center">
            Instant Demo Logins
          </span>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              disabled={loading}
              onClick={() =>
                handleQuickLogin('patient@vacantup.com', 'Patient@123')
              }
              className="p-2 rounded-xl bg-white border border-slate-200 hover:border-brand-500 hover:bg-brand-50/50 disabled:opacity-50 text-slate-700 font-semibold transition-all text-left"
            >
              <span className="block text-[11px] font-bold text-brand-600">
                Patient
              </span>
              <span className="text-[10px] text-slate-400">
                patient@vacantup.com
              </span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() =>
                handleQuickLogin('doctor@vacantup.com', 'Doctor@123')
              }
              className="p-2 rounded-xl bg-white border border-slate-200 hover:border-brand-500 hover:bg-brand-50/50 disabled:opacity-50 text-slate-700 font-semibold transition-all text-left"
            >
              <span className="block text-[11px] font-bold text-accent-600">
                Doctor (OPD)
              </span>
              <span className="text-[10px] text-slate-400">
                doctor@vacantup.com
              </span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() =>
                handleQuickLogin('hospital@vacantup.com', 'Hospital@123')
              }
              className="p-2 rounded-xl bg-white border border-slate-200 hover:border-brand-500 hover:bg-brand-50/50 disabled:opacity-50 text-slate-700 font-semibold transition-all text-left"
            >
              <span className="block text-[11px] font-bold text-purple-600">
                Hospital Admin
              </span>
              <span className="text-[10px] text-slate-400">
                hospital@vacantup.com
              </span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() =>
                handleQuickLogin('admin@vacantup.com', 'Admin@123')
              }
              className="p-2 rounded-xl bg-white border border-slate-200 hover:border-brand-500 hover:bg-brand-50/50 disabled:opacity-50 text-slate-700 font-semibold transition-all text-left"
            >
              <span className="block text-[11px] font-bold text-rose-600">
                Platform Admin
              </span>
              <span className="text-[10px] text-slate-400">
                admin@vacantup.com
              </span>
            </button>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            aria-live="polite"
            className="p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-start space-x-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="break-words">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label
              htmlFor="login-email"
              className="font-bold text-slate-700 block"
            >
              Email Address
            </label>

            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />

              <input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                disabled={loading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-60"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label
              htmlFor="login-password"
              className="font-bold text-slate-700 block"
            >
              Password
            </label>

            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />

              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                required
                disabled={loading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-60"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white font-bold rounded-xl shadow-md shadow-brand-600/25 transition-all flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In to Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Don't have an account yet?{' '}
          <Link
            to="/register"
            className="font-bold text-brand-600 hover:text-brand-700"
          >
            Sign up now
          </Link>
        </p>
      </div>
    </div>
  );
};
