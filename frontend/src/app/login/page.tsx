'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import Image from 'next/image';
import Link from 'next/link';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Shield, ArrowLeft, Mail, KeyRound } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('aleem811');
  const [password, setPassword] = useState('aleem811');
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const { login, isLoading } = useAuthStore();
  const router = useRouter();

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success('Welcome back, Admin!');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Invalid credentials');
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpLoading(true);
    try {
      await api.post('/otp/verify', { email, otp, purpose: 'login' });
      toast.success('Welcome back, Admin!');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    }
    setOtpLoading(false);
  };

  const resendOtp = async () => {
    setOtpLoading(true);
    try {
      await api.post('/otp/send', { email, purpose: 'login' });
      toast.success('New OTP sent!');
    } catch (err: any) {
      toast.error('Failed to resend OTP');
    }
    setOtpLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-red-950" />
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(220, 38, 38, 0.15) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(220, 38, 38, 0.1) 0%, transparent 50%)' }} />
      
      {/* Floating shapes */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-red-600/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-800/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      {/* Back to home */}
      <Link href="/" className="absolute top-6 left-6 z-20 flex items-center gap-2 text-gray-400 hover:text-white transition text-sm">
        <ArrowLeft size={16} /> Back to Home
      </Link>

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] p-10 border border-white/20">
          {/* Logo & Header */}
          <div className="text-center mb-10">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl scale-150" />
              <Image src="/logo.png" alt="Aleem Restaurant" width={90} height={90} className="relative mx-auto rounded-full shadow-lg ring-4 ring-red-50" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mt-5">
              {step === 'credentials' ? 'Welcome Back' : 'Verify OTP'}
            </h1>
            <div className="flex items-center justify-center gap-2 mt-2">
              {step === 'credentials' ? (
                <><Shield size={14} className="text-red-500" /><p className="text-gray-500 text-sm font-medium">Admin Control Panel</p></>
              ) : (
                <><Mail size={14} className="text-red-500" /><p className="text-gray-500 text-sm font-medium">Enter the code sent to your email</p></>
              )}
            </div>
          </div>

          {/* Credentials Form */}
          {step === 'credentials' && (
            <form onSubmit={handleCredentials} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                <div className="relative">
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent focus:bg-white outline-none transition text-gray-900"
                    placeholder="Enter username"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent focus:bg-white outline-none transition pr-12 text-gray-900"
                    placeholder="Enter password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || otpLoading}
                className="w-full py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-bold text-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-600/30 hover:shadow-red-600/50 active:scale-[0.98]"
              >
                {isLoading || otpLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    {otpLoading ? 'Sending OTP...' : 'Verifying...'}
                  </span>
                ) : 'Sign In & Get OTP'}
              </button>
            </form>
          )}

          {/* OTP Form */}
          {step === 'otp' && (
            <form onSubmit={handleOtpVerify} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Enter 6-digit OTP</label>
                <div className="relative">
                  <KeyRound size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent focus:bg-white outline-none transition text-gray-900 text-center text-2xl font-bold tracking-[0.5em]"
                    placeholder="------"
                    maxLength={6}
                    required
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={otpLoading || otp.length !== 6}
                className="w-full py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-bold text-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-600/30 hover:shadow-red-600/50 active:scale-[0.98]"
              >
                {otpLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    Verifying...
                  </span>
                ) : 'Verify & Enter'}
              </button>

              <div className="flex items-center justify-between text-sm">
                <button type="button" onClick={() => setStep('credentials')} className="text-gray-500 hover:text-gray-700 transition">
                  ← Back to login
                </button>
                <button type="button" onClick={resendOtp} disabled={otpLoading} className="text-red-600 hover:text-red-700 font-medium transition disabled:opacity-50">
                  Resend OTP
                </button>
              </div>
            </form>
          )}

          {/* Footer hint */}
          <div className="mt-6 pt-5 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">{step === 'credentials' ? 'Secured admin access with OTP verification' : 'Check your email inbox & spam folder'}</p>
          </div>
        </div>

        {/* Bottom branding */}
        <p className="text-center text-gray-600 text-xs mt-6">© 2026 Aleem Restaurant. All rights reserved.</p>
      </div>
    </div>
  );
}
