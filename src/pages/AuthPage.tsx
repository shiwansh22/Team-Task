'use client';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { UserRole } from '../types';

type Mode = 'login' | 'signup';

export default function AuthPage() {
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>('login');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'member' as UserRole });

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
        toast.success('Welcome back!');
      } else {
        if (!form.name.trim()) { toast.error('Name is required'); return; }
        await signup(form.name.trim(), form.email, form.password, form.role);
        toast.success('Account created!');
      }
      navigate('/');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      toast.error(msg.replace('Firebase: ', '').replace(/\(auth.*\)/, '').trim());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-5"
      style={{ background: 'var(--bg)' }}
    >
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--accent)' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="9 11 12 14 22 4" />
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
              </svg>
            </div>
            <span className="text-2xl font-semibold tracking-tight">TaskFlow</span>
          </div>
          <p className="text-sm" style={{ color: 'var(--text2)' }}>Team collaboration made simple</p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-7"
          style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
        >
          {/* Tab switcher */}
          <div
            className="flex rounded-lg p-1 mb-6 gap-1"
            style={{ background: 'var(--bg3)' }}
          >
            {(['login', 'signup'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className="flex-1 py-2 rounded-md text-sm font-medium transition-all"
                style={{
                  background: mode === m ? 'var(--accent)' : 'transparent',
                  color: mode === m ? 'white' : 'var(--text2)',
                }}
              >
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {mode === 'signup' && (
              <input
                type="text"
                placeholder="Full Name"
                value={form.name}
                onChange={set('name')}
                required
                className="w-full"
              />
            )}
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={set('email')}
              required
              className="w-full"
            />
            <input
              type="password"
              placeholder="Password (min 6 chars)"
              value={form.password}
              onChange={set('password')}
              required
              minLength={6}
              className="w-full"
            />
            {mode === 'signup' && (
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'var(--text2)' }}>
                  Role
                </label>
                <select value={form.role} onChange={set('role')} className="w-full">
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-semibold text-sm mt-1 transition-opacity"
              style={{
                background: 'var(--accent)',
                color: 'white',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Demo hint */}
          <div
            className="mt-5 p-3 rounded-lg text-xs"
            style={{ background: 'var(--bg3)', color: 'var(--text2)' }}
          >
            <p className="font-medium mb-1" style={{ color: 'var(--text)' }}>Demo hint</p>
            <p>Create an Admin account first, then add projects and tasks.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
