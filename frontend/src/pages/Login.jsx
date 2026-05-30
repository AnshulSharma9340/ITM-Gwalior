import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, LogIn, Eye, EyeOff, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/auth';
import { errorMessage } from '../api/client';

// This login is for Admin & Editor accounts only.
// Any other role is rejected with a friendly message below.
const ALLOWED_ROLES = new Set(['super_admin', 'admin', 'editor']);
const REDIRECT_BY_ROLE = {
  super_admin: '/admin',
  admin: '/admin',
  editor: '/admin',
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authApi.login(form.username, form.password);
      if (!ALLOWED_ROLES.has(data.role)) {
        setError(`This portal is for Admin & Editor accounts only. (Your account is ${data.role}.)`);
        setLoading(false);
        return;
      }
      login(data);
      const target = REDIRECT_BY_ROLE[data.role] || '/admin';
      navigate(target, { replace: true });
    } catch (err) {
      setError(errorMessage(err) || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0606] via-[#800000] to-[#3e0202] flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />

      <div className="relative w-full max-w-md">

        <div className="text-center mb-8">
          <Link to="/">
            <img src="/images/ITMGOILogo.png" alt="ITM Logo" className="h-14 mx-auto mb-4 drop-shadow-lg" />
          </Link>
          <h1 className="text-2xl font-black text-white tracking-tight">ITM Gwalior Portal</h1>
          <p className="text-red-200/60 text-sm mt-1">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600 to-[#800000] flex items-center justify-center text-white">
              <Shield size={18} />
            </div>
            <div>
              <p className="font-black text-[#3e0202] text-base">Sign In</p>
              <p className="text-gray-400 text-xs">Admin & Editor access only.</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm font-semibold px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-black uppercase tracking-widest text-gray-500 mb-1.5">
                Username or email
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  required
                  autoComplete="username"
                  value={form.username}
                  onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                  className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#800000] focus:ring-2 focus:ring-[#800000]/10 transition"
                  placeholder="admin or your email"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-widest text-gray-500 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full pl-9 pr-10 py-3 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#800000] focus:ring-2 focus:ring-[#800000]/10 transition"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-rose-600 to-[#800000] text-white font-black text-[11px] tracking-widest uppercase py-3.5 rounded-xl flex items-center justify-center gap-2 transition-opacity disabled:opacity-60 shadow-md hover:shadow-lg"
            >
              {loading ? 'Signing in…' : <><LogIn size={14} /> Sign In</>}
            </button>
          </form>
        </div>

        <p className="text-center text-red-200/40 text-xs mt-6">
          <Link to="/" className="hover:text-red-200 transition-colors">← Back to website</Link>
        </p>
      </div>
    </div>
  );
}
