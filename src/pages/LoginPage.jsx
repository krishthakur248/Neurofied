import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { insforgeClient } from '../lib/insforge';
import { Brain, ArrowLeft, Mail, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginMode, setLoginMode] = useState('google'); // 'google' or 'email'

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error: err } = await insforgeClient.auth.signInWithOAuth({
        provider: 'google',
        redirectTo: `${window.location.origin}/`,
      });
      if (err) {
        setError(err.message || 'Failed to initiate Google sign-in');
        setLoading(false);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data, error: err } = await insforgeClient.auth.signInWithPassword({
        email,
        password,
      });

      if (err) {
        setError(err.message || 'Failed to sign in');
        setLoading(false);
      } else {
        navigate('/');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface-container-lowest to-background flex flex-col overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
      </div>

      {/* Back button */}
      <div className="p-6 relative z-10">
        <button
          onClick={() => navigate('/landing')}
          className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      {/* Login Card */}
      <div className="flex-1 flex items-center justify-center px-6 pb-20 relative z-10">
        <div className="w-full max-w-md">
          {/* Logo & Header */}
          <div className="text-center mb-12 animate-fade-in-up">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-outline-variant/30">
              <img src="/images/LOGO.jpeg" alt="Neurofied Logo" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-4xl font-bold text-on-surface mb-3">Welcome to Neurofied</h1>
            <p className="text-on-surface-variant text-base">Understand Today, Protect Tomorrow</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-error-container/20 border border-error/30 rounded-xl text-error text-sm animate-fade-in flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-error/20 flex-shrink-0 mt-0.5"></div>
              <span>{error}</span>
            </div>
          )}

          {/* Login Mode Tabs */}
          <div className="flex gap-3 mb-8 bg-surface-container-lowest rounded-xl p-1 border border-outline-variant/30">
            <button
              onClick={() => setLoginMode('google')}
              className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all duration-300 ${
                loginMode === 'google'
                  ? 'bg-primary text-on-primary shadow-md'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Google
            </button>
            <button
              onClick={() => setLoginMode('email')}
              className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all duration-300 ${
                loginMode === 'email'
                  ? 'bg-primary text-on-primary shadow-md'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Email
            </button>
          </div>

          {/* Google Sign In */}
          {loginMode === 'google' && (
            <div className="animate-fade-in-up">
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-3.5 px-6 bg-surface-container border border-outline-variant hover:border-outline hover:bg-surface-container/80 transition-all duration-300 rounded-2xl
                           font-semibold text-on-surface flex items-center justify-center gap-3
                           disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] shadow-sm hover:shadow-md"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                )}
                {loading ? 'Signing in...' : 'Continue with Google'}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-outline-variant/30"></div>
                <span className="text-xs text-on-surface-variant font-medium">OR</span>
                <div className="flex-1 h-px bg-outline-variant/30"></div>
              </div>

              {/* Switch to Email */}
              <p className="text-center text-on-surface-variant text-sm">
                Don't have a Google account?{' '}
                <button
                  onClick={() => setLoginMode('email')}
                  className="text-primary font-semibold hover:underline"
                >
                  Sign in with email
                </button>
              </p>
            </div>
          )}

          {/* Email Sign In */}
          {loginMode === 'email' && (
            <form onSubmit={handleEmailLogin} className="animate-fade-in-up space-y-4">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-on-surface-variant pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-surface-container border border-outline-variant rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-on-surface placeholder-on-surface-variant transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-on-surface-variant pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 bg-surface-container border border-outline-variant rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-on-surface placeholder-on-surface-variant transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 bg-primary hover:bg-primary/90 active:bg-primary/80 rounded-2xl
                           font-semibold text-on-primary transition-all duration-300 flex items-center justify-center gap-2
                           disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] shadow-md hover:shadow-lg mt-6"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin"></div>
                    Signing in...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Sign In
                  </>
                )}
              </button>

              {/* Switch to Google */}
              <p className="text-center text-on-surface-variant text-sm mt-4">
                Prefer Google?{' '}
                <button
                  onClick={() => setLoginMode('google')}
                  className="text-primary font-semibold hover:underline"
                >
                  Sign in with Google
                </button>
              </p>
            </form>
          )}

          {/* Trust Indicators */}
          <div className="mt-10 pt-8 border-t border-outline-variant/30 space-y-3">
            <div className="flex items-center gap-3 text-sm text-on-surface-variant">
              <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
              <span>Secure & encrypted connection</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-on-surface-variant">
              <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
              <span>Your data is protected</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-on-surface-variant">
              <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
              <span>Privacy first approach</span>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-on-surface-variant/60 text-xs mt-8 leading-relaxed">
            By continuing, you agree to our Terms of Service and Privacy Policy.
            <br />
            Neurofied.ai is a wellness tool, not a medical device.
          </p>
        </div>
      </div>
    </div>
  );
}
