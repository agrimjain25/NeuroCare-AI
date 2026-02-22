'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signup } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, User, Mail, Lock, Calendar, Check, AlertCircle } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);

  // Validation checks
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isLongEnough = password.length >= 8;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum)) {
      setError('Please enter a valid age.');
      return;
    }

    if (!isLongEnough || !hasSpecialChar) {
      setError('Please ensure your password meets all requirements.');
      return;
    }

    setLoading(true);
    const result = signup(email, password, firstName, lastName, ageNum);
    if (result.success) {
      router.push('/dashboard');
    } else {
      setError(result.error || 'Signup failed');
    }

    setLoading(false);
  };

  return (
    <div className="h-full relative flex items-center justify-center px-4 overflow-hidden">
      {/* Content Container */}
      <div className="relative z-10 w-full max-w-[480px] page-transition py-8">
        {/* Logo & Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-20 w-auto mb-6">
            <img src="/web_logo.png" alt="NeuroCare Logo" className="h-full w-auto object-contain" />
          </div>
          <p className="text-muted-foreground text-lg">Start your journey to better cognitive health</p>
        </div>

        {/* Signup Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden group">
          {/* Subtle top light effect */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          
          <form onSubmit={handleSignup} className="space-y-5">
            {/* Name and Age Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70 ml-1">First Name</label>
                <div className="relative group/input">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within/input:text-primary transition-colors">
                    <User className="w-5 h-5" />
                  </div>
                  <Input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    className="w-full h-12 pl-12 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-primary/50 rounded-xl"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70 ml-1">Last Name</label>
                <div className="relative group/input">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within/input:text-primary transition-colors">
                    <User className="w-5 h-5" />
                  </div>
                  <Input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    className="w-full h-12 pl-12 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-primary/50 rounded-xl"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Email and Age Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-2">
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
                    className="w-full h-12 pl-12 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-primary/50 rounded-xl"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70 ml-1">Age</label>
                <div className="relative group/input">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within/input:text-primary transition-colors">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <Input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="65"
                    className="w-full h-12 pl-12 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-primary/50 rounded-xl"
                    min="18"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70 ml-1">Create Password</label>
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
                  className="w-full h-12 pl-12 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-primary/50 rounded-xl"
                  required
                />
              </div>
            </div>

            {/* Password Requirements - Elegant Feedback */}
            {(passwordFocus || password.length > 0) && (
              <div className="grid grid-cols-2 gap-2 pt-1 animate-in fade-in slide-in-from-top-2 duration-300">
                <RequirementCheck label="8+ Characters" checked={isLongEnough} />
                <RequirementCheck label="Special Char" checked={hasSpecialChar} />
                <RequirementCheck label="At least one number" checked={hasNumber} />
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-3 bg-destructive/10 border border-destructive/20 text-destructive-foreground p-4 rounded-xl text-sm animate-in zoom-in-95 duration-200">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {/* Signup Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary hover:to-secondary text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-[1.02]"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating Account...</span>
                </div>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          {/* Login Footer */}
          <div className="text-center mt-8">
            <p className="text-white/50 text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-white font-semibold hover:text-primary transition-colors underline underline-offset-4 decoration-white/20 hover:decoration-primary">
                Sign In
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
