'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { login, loginWithGoogle, resetPassword } from '@/lib/auth';
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

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    
    // Simulate Google Login (e.g., using a demo Google user)
    const result = loginWithGoogle('google.user@gmail.com', 'Google User');
    if (result.success) {
      router.push('/dashboard');
    } else {
      setError('Google login failed');
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

          {mode === 'login' && (
            <>
              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/10"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#111] px-4 text-white/40 font-medium tracking-widest">Or continue with</span>
                </div>
              </div>

              {/* Google Login Button */}
              <Button
                onClick={handleGoogleLogin}
                disabled={loading}
                variant="outline"
                className="w-full h-12 bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20 rounded-xl flex items-center justify-center gap-3 transition-all"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                  />
                </svg>
                Sign in with Google
              </Button>
            </>
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

        {/* Demo Hint */}
        <div className="mt-8 text-center animate-in fade-in duration-1000 delay-500">
          <p className="text-xs text-white/30 mb-2 font-medium tracking-widest uppercase">
            Demo Credentials
          </p>
          <div className="inline-flex items-center gap-4 bg-white/5 border border-white/10 px-4 py-2 rounded-full text-xs text-white/40">
            <span>demo@neurocare.com</span>
            <div className="w-[1px] h-3 bg-white/10" />
            <span>demo123</span>
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
