'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { login, resetPassword } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, Mail, Lock, Check, AlertCircle, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);

  // Validation checks
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password || newPassword);
  const hasNumber = /[0-9]/.test(password || newPassword);
  const isLongEnough = (password || newPassword).length >= 8;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = login(email, password);
    if (result.success) {
      router.push('/dashboard');
    } else {
      setError(result.error || 'Login failed');
    }

    setLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!isLongEnough || !hasNumber || !hasSpecialChar) {
      setError('Password does not meet requirements');
      setLoading(false);
      return;
    }

    const result = resetPassword(email, newPassword);
    if (result.success) {
      setSuccess('Password reset successful! You can now log in.');
      setTimeout(() => {
        setMode('login');
        setSuccess('');
        setNewPassword('');
      }, 2000);
    } else {
      setError(result.error || 'Reset failed');
    }

    setLoading(false);
  };

  return (
    <div className="h-full relative flex items-center justify-center px-4 overflow-hidden">
      {/* Content Container */}
      <div className="relative z-10 w-full max-w-[440px] page-transition py-8">
        {/* Logo & Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-20 w-auto mb-6">
            <img src="/web_logo.png" alt="NeuroCare Logo" className="h-full w-auto object-contain" />
          </div>
          <p className="text-muted-foreground text-lg">
            {mode === 'login' ? 'Sign in to your cognitive health dashboard' : 'Reset your account password'}
          </p>
        </div>

        {/* Login/Forgot Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden group">
          {/* Subtle top light effect */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          
          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70 ml-1">Email Address</label>
                <div className="relative group/input">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within/input:text-primary transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full h-12 pl-12 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-primary/50 focus:ring-primary/20 rounded-xl transition-all"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-sm font-medium text-white/70">Password</label>
                  <button 
                    type="button"
                    onClick={() => { setMode('forgot'); setError(''); }}
                    className="text-xs text-primary hover:text-secondary transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative group/input">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within/input:text-primary transition-colors">
                    <Lock className="w-5 h-5" />
                  </div>
                  <Input
                    type="password"
                    value={password}
                    onFocus={() => setPasswordFocus(true)}
                    onBlur={() => setPasswordFocus(false)}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-12 pl-12 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-primary/50 focus:ring-primary/20 rounded-xl transition-all"
                    required
                  />
                </div>
              </div>

              {/* Password Requirements - Elegant Feedback */}
              {passwordFocus && password.length > 0 && (
                <div className="grid grid-cols-2 gap-2 pt-1 animate-in fade-in slide-in-from-top-2 duration-300">
                  <RequirementCheck label="8+ Characters" checked={isLongEnough} />
                  <RequirementCheck label="Special Char" checked={hasSpecialChar} />
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-3 bg-destructive/10 border border-destructive/20 text-destructive-foreground p-4 rounded-xl text-sm animate-in zoom-in-95 duration-200">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              {/* Login Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary hover:to-secondary text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <button 
                type="button"
                onClick={() => setMode('login')}
                className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors mb-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to login
              </button>

              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70 ml-1">Your Email Address</label>
                <div className="relative group/input">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within/input:text-primary transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full h-12 pl-12 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-primary/50 focus:ring-primary/20 rounded-xl transition-all"
                    required
                  />
                </div>
              </div>

              {/* New Password Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70 ml-1">New Password</label>
                <div className="relative group/input">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within/input:text-primary transition-colors">
                    <Lock className="w-5 h-5" />
                  </div>
                  <Input
                    type="password"
                    value={newPassword}
                    onFocus={() => setPasswordFocus(true)}
                    onBlur={() => setPasswordFocus(false)}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-12 pl-12 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-primary/50 focus:ring-primary/20 rounded-xl transition-all"
                    required
                  />
                </div>
              </div>

              {/* Password Requirements */}
              {passwordFocus && newPassword.length > 0 && (
                <div className="grid grid-cols-2 gap-2 pt-1 animate-in fade-in slide-in-from-top-2 duration-300">
                  <RequirementCheck label="8+ Characters" checked={isLongEnough} />
                  <RequirementCheck label="Special Char" checked={hasSpecialChar} />
                </div>
              )}

              {/* Status Messages */}
              {error && (
                <div className="flex items-center gap-3 bg-destructive/10 border border-destructive/20 text-destructive-foreground p-4 rounded-xl text-sm animate-in zoom-in-95 duration-200">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}
              {success && (
                <div className="flex items-center gap-3 bg-secondary/10 border border-secondary/20 text-secondary-foreground p-4 rounded-xl text-sm animate-in zoom-in-95 duration-200">
                  <Check className="w-5 h-5 shrink-0" />
                  <p>{success}</p>
                </div>
              )}

              {/* Reset Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary hover:to-secondary text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? 'Processing...' : 'Reset Password'}
              </Button>
            </form>
          )}

          {/* Signup Footer */}
          <div className="text-center mt-8">
            <p className="text-white/50 text-sm">
              New to NeuroCare?{' '}
              <Link href="/signup" className="text-white font-semibold hover:text-primary transition-colors underline underline-offset-4 decoration-white/20 hover:decoration-primary">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function RequirementCheck({ label, checked }: { label: string; checked: boolean }) {
  return (
    <div className={`flex items-center gap-2 text-xs transition-colors ${checked ? 'text-secondary' : 'text-white/30'}`}>
      <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${checked ? 'bg-secondary/20 border-secondary' : 'border-white/10'}`}>
        {checked && <Check className="w-3 h-3" />}
      </div>
      <span>{label}</span>
    </div>
  );
}
