'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthActions } from '@convex-dev/auth/react';
import { useConvexAuth } from 'convex/react';

type Step = 'forgot' | { email: string };

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('forgot');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { signIn } = useAuthActions();
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const postAuthRedirected = useRef(false);

  useEffect(() => {
    if (authLoading || !isAuthenticated || postAuthRedirected.current) return;
    postAuthRedirected.current = true;
    const devBypass =
      process.env.NODE_ENV === 'development' &&
      process.env.NEXT_PUBLIC_DEV_BYPASS_SUBSCRIPTION === 'true';
    window.location.assign(devBypass ? '/dashboard' : '/sign-in');
  }, [isAuthenticated, authLoading]);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      const trimmed = email.trim();
      if (!trimmed) {
        setError('Please enter your email address');
        return;
      }

      await signIn('password', {
        email: trimmed,
        flow: 'reset',
      });
      setStep({ email: trimmed });
      setMessage('If an account exists for this email, we sent an 8-digit reset code.');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Could not send reset code';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (step === 'forgot') return;

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!code.trim()) {
      setError('Please enter the code from your email');
      return;
    }

    setIsLoading(true);
    try {
      await signIn('password', {
        email: step.email,
        code: code.trim(),
        newPassword,
        flow: 'reset-verification',
      });
      setMessage('Password updated. Signing you in…');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Could not reset password';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const resetEmail = step === 'forgot' ? email : step.email;

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-gray-50">
        <div className="w-full max-w-md">
          <Link
            href="/sign-in"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-8 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Sign In
          </Link>

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Image
                src="/logos-icons/pmIcon.png"
                alt="Papermind Icon"
                width={48}
                height={48}
                className="w-12 h-12"
              />
              <h1 className="text-4xl font-bold text-gray-900">Papermind</h1>
            </div>
            <p className="text-gray-600 text-lg">
              {step === 'forgot'
                ? 'Enter your email and we’ll send a reset code.'
                : 'Enter the code from your email and choose a new password.'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          {message && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700">{message}</p>
            </div>
          )}

          {step === 'forgot' ? (
            <form onSubmit={handleRequestCode} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  required
                  autoComplete="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
                  placeholder="you@school.edu"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !email.trim()}
                className="w-full text-white py-3 px-4 rounded-lg font-medium transition-all shadow-md flex items-center justify-center cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  backgroundColor: isLoading || !email.trim() ? '#FF539266' : '#FF5392',
                }}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    Sending…
                  </div>
                ) : (
                  'Send reset code'
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <p className="text-sm text-gray-600">
                Code sent to <span className="font-medium text-gray-900">{resetEmail}</span>
              </p>
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Reset code
                </label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    if (error) setError('');
                  }}
                  required
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all tracking-widest"
                  placeholder="12345678"
                />
              </div>
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                  New password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="newPassword"
                    name="newPassword"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (error) setError('');
                    }}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all pr-12"
                    placeholder="At least 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Confirm new password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (error) setError('');
                  }}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
                  placeholder="Repeat new password"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !code.trim() || !newPassword || !confirmPassword}
                className="w-full text-white py-3 px-4 rounded-lg font-medium transition-all shadow-md flex items-center justify-center cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  backgroundColor:
                    isLoading || !code.trim() || !newPassword || !confirmPassword
                      ? '#FF539266'
                      : '#FF5392',
                }}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    Updating…
                  </div>
                ) : (
                  'Reset password'
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep('forgot');
                  setCode('');
                  setNewPassword('');
                  setConfirmPassword('');
                  setError('');
                  setMessage('');
                }}
                className="w-full text-sm text-gray-600 hover:text-gray-900 py-2"
              >
                Use a different email
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden" style={{ backgroundColor: '#f0ecff' }}>
        <div
          className="absolute bottom-0 right-0 w-3/4 h-3/4 rounded-tl-full opacity-40"
          style={{ backgroundColor: '#e4dcff' }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://i.ibb.co/rKHCYgKJ/fox-Grad.png"
          alt="Study mascot"
          className="absolute bottom-0 left-0 object-contain object-bottom pointer-events-none select-none"
          style={{ height: '100%', width: '100%' }}
        />
      </div>
    </div>
  );
}
