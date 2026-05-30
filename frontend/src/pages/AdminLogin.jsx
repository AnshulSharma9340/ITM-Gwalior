import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/auth';
import { errorMessage } from '../api/client';
import { Lock, User, LogIn, Eye, EyeOff } from 'lucide-react';

export default function AdminLogin() {
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
      if (!['super_admin', 'editor', 'admin'].includes(data.role)) {
        setError(`This is a ${data.role} account. Use the main /login page.`);
        setLoading(false);
        return;
      }
      login(data);
      const dest = data.role === 'editor' ? '/editor' : '/admin';
      navigate(dest, { replace: true });
    } catch (err) {
      setError(errorMessage(err) || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0606] via-[#800000] to-[#3e0202] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo strip */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur rounded-2xl border border-white/20 mb-4">
            <Lock size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Admin Panel</h1>
          <p className="text-red-200/70 text-sm mt-1 font-medium">ITM Gwalior · CMS</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 space-y-5"
        >
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm font-semibold px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[11px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5">
              Username
            </label>
            <div className="relative">
              <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                required
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                className="w-full pl-9 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-[#800000] focus:ring-2 focus:ring-[#800000]/10 transition"
                placeholder="admin"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPw ? 'text' : 'password'}
                required
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="w-full pl-9 pr-10 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-[#800000] focus:ring-2 focus:ring-[#800000]/10 transition"
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
            className="w-full bg-[#800000] hover:bg-[#6a0000] text-white font-black text-sm tracking-widest uppercase py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
          >
            {loading ? 'Signing in…' : <><LogIn size={15} /> Sign In</>}
          </button>
        </form>

        <p className="text-center text-red-200/50 text-xs mt-6 font-medium">
          Default: admin / admin123
        </p>
      </div>
    </div>
  );
}
