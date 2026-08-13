import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, Key, Mail, Shield, UserCheck, Eye, EyeOff, CheckCircle, AlertCircle, X, Sparkles, Lock } from 'lucide-react';

interface LoginPageProps {
  onSuccess: () => void;
  onSwitchToRegister: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess, onSwitchToRegister }) => {
  const { login, register } = useAuth();

  const [email, setEmail] = useState('candidate@intervuex.com');
  const [password, setPassword] = useState('Password123!');
  const [showPassword, setShowPassword] = useState(false);
  
  // Errors and validation states
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  // Rate limiting / failed attempts tracking
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  // Password recovery modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const validateForm = () => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');
    setError('');

    // Check account lockout
    if (isLocked || failedAttempts >= 5) {
      setError('Too many failed login attempts. Please wait 15 minutes before trying again.');
      return false;
    }

    const trimmedEmail = email.trim();
    // 1. Empty email check
    if (!trimmedEmail) {
      setEmailError('Please enter your email address.');
      isValid = false;
    } 
    // 2. Invalid email format check
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setEmailError('Please enter a valid email address.');
      isValid = false;
    }

    // 3. Empty password check
    if (!password) {
      setPasswordError('Please enter your password.');
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters.');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setError('');
    setLoading(true);

    try {
      await login(email.trim(), password);
      onSuccess();
    } catch (err: any) {
      const nextAttempts = failedAttempts + 1;
      setFailedAttempts(nextAttempts);

      if (nextAttempts >= 5) {
        setIsLocked(true);
        setError('Too many failed login attempts. Please wait 15 minutes before trying again.');
        setLoading(false);
        return;
      }

      const message = err.message || '';
      
      if (message.toLowerCase().includes('disabled') || message.toLowerCase().includes('not verified')) {
        setError('Account is disabled or not verified. Please contact administrator.');
      } else {
        // Clear explicit error message for incorrect credentials or invalid user
        setError('Incorrect password or invalid email address. Please check your credentials and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role: 'CANDIDATE' | 'ADMIN') => {
    if (isLocked) {
      setError('Too many failed login attempts. Please wait 15 minutes before trying again.');
      return;
    }

    setError('');
    setEmailError('');
    setPasswordError('');
    setLoading(true);

    const demoEmail = role === 'ADMIN' ? 'admin@intervuex.com' : 'candidate@intervuex.com';
    const demoName = role === 'ADMIN' ? 'System Admin' : 'Jane Candidate';
    
    setEmail(demoEmail);
    setPassword('Password123!');

    try {
      await login(demoEmail, 'Password123!');
      onSuccess();
    } catch (e) {
      try {
        await register(demoEmail, 'Password123!', demoName, role);
        onSuccess();
      } catch (err: any) {
        setError('Invalid email or password. Please check your credentials and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    const trimmed = forgotEmail.trim();
    if (!trimmed) {
      setForgotError('Please enter your email address.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setForgotError('Please enter a valid email address.');
      return;
    }

    setForgotLoading(true);
    setTimeout(() => {
      setForgotLoading(false);
      setForgotSuccess(`If an account exists for ${trimmed}, a password reset link has been sent to your inbox.`);
    }, 600);
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 120px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '1000px', width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2.5rem', alignItems: 'center' }}>
        
        {/* Left Column: Platform Branding & Value Props */}
        <div style={{ padding: '1rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#E0F2FE', color: '#0369A1', padding: '0.4rem 0.85rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: '700', letterSpacing: '0.05em', marginBottom: '1.25rem' }}>
            <Sparkles size={14} /> INTERVUEX AI CAREER PLATFORM
          </div>

          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', lineHeight: 1.15, color: '#0F172A', marginBottom: '1rem' }}>
            Prepare.<br />
            Practice.<br />
            <span style={{ color: '#2563EB' }}>Improve.</span>
          </h1>

          <p style={{ fontSize: '1.05rem', color: '#475569', lineHeight: 1.6, marginBottom: '2rem', maxWidth: '420px' }}>
            AI-powered interview preparation based on your resume and target job.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem', fontWeight: '600', color: '#1E293B' }}>
              <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#DCFCE7', color: '#15803D', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <CheckCircle size={16} />
              </div>
              <span>✓ Resume analysis</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem', fontWeight: '600', color: '#1E293B' }}>
              <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#DCFCE7', color: '#15803D', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <CheckCircle size={16} />
              </div>
              <span>✓ Adaptive interviews</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem', fontWeight: '600', color: '#1E293B' }}>
              <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#DCFCE7', color: '#15803D', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <CheckCircle size={16} />
              </div>
              <span>✓ Skill-gap analysis</span>
            </div>
          </div>
        </div>

        {/* Right Column: Sign In Card */}
        <div className="card" style={{ padding: '2.25rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)', borderRadius: '16px', border: '1px solid #E2E8F0', background: '#FFFFFF' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#EFF6FF', color: '#2563EB', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.85rem' }}>
              <LogIn size={26} />
            </div>
            <h2 style={{ fontSize: '1.6rem', color: '#0F172A' }}>Welcome Back</h2>
            <p style={{ fontSize: '0.9rem', color: '#64748B', marginTop: '0.25rem' }}>Sign in to your IntervueX workspace</p>
          </div>

          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#B91C1C', padding: '0.85rem 1rem', borderRadius: '8px', fontSize: '0.875rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontWeight: '700', marginBottom: '2px' }}>Authentication Error</div>
                <div>{error}</div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Email Field */}
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: emailError ? '#EF4444' : '#94A3B8' }} />
                <input 
                  type="email" 
                  className="form-input" 
                  style={{ paddingLeft: '2.6rem', borderColor: emailError ? '#EF4444' : undefined }}
                  placeholder="name@company.com"
                  value={email} 
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError('');
                  }} 
                />
              </div>
              {emailError && (
                <div style={{ color: '#DC2626', fontSize: '0.8rem', marginTop: '0.35rem', fontWeight: '500' }}>
                  ⚠ {emailError}
                </div>
              )}
            </div>

            {/* Password Field with Forgot Password? Link */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
                <button 
                  type="button" 
                  onClick={() => {
                    setForgotEmail(email);
                    setForgotError('');
                    setForgotSuccess('');
                    setShowForgotModal(true);
                  }}
                  style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: '0.825rem', fontWeight: '600', cursor: 'pointer', padding: 0 }}
                >
                  Forgot Password?
                </button>
              </div>

              {/* Password Input with Left Key Icon & Right Show/Hide Eye Toggle */}
              <div style={{ position: 'relative' }}>
                <Key size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: passwordError ? '#EF4444' : '#94A3B8' }} />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  className="form-input" 
                  style={{ paddingLeft: '2.6rem', paddingRight: '2.6rem', borderColor: passwordError ? '#EF4444' : undefined }}
                  placeholder="•••••••••••••"
                  value={password} 
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError('');
                  }} 
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {passwordError && (
                <div style={{ color: '#DC2626', fontSize: '0.8rem', marginTop: '0.35rem', fontWeight: '500' }}>
                  ⚠ {passwordError}
                </div>
              )}
            </div>

            <button type="submit" className="btn btn-action" style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', fontWeight: '700' }} disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          {/* Quick One-Click Demo Sign-in */}
          <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid #E2E8F0', textAlign: 'center' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>QUICK DEMO ACCESS</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button className="btn btn-outline btn-sm" onClick={() => handleQuickDemo('CANDIDATE')} disabled={loading}>
                <UserCheck size={14} /> Demo Candidate
              </button>
              <button className="btn btn-outline btn-sm" onClick={() => handleQuickDemo('ADMIN')} disabled={loading}>
                <Shield size={14} /> Demo Admin
              </button>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: '#64748B' }}>
            Don't have an account?{' '}
            <span onClick={onSwitchToRegister} style={{ color: '#2563EB', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}>
              Create one
            </span>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '440px', padding: '1.75rem', borderRadius: '16px', position: 'relative', animation: 'fadeIn 0.2s ease-out' }}>
            <button 
              onClick={() => setShowForgotModal(false)}
              style={{ position: 'absolute', right: '16px', top: '16px', background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '4px' }}
            >
              <X size={20} />
            </button>

            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#EFF6FF', color: '#2563EB', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                <Lock size={20} />
              </div>
              <h3 style={{ fontSize: '1.25rem' }}>Reset Password</h3>
              <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '0.25rem' }}>
                Enter your account email address and we'll send you instructions to reset your password.
              </p>
            </div>

            {forgotError && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#B91C1C', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                ⚠ {forgotError}
              </div>
            )}

            {forgotSuccess ? (
              <div>
                <div style={{ background: '#F0FDF4', border: '1px solid #86EFAC', color: '#166534', padding: '0.85rem', borderRadius: '8px', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                  ✓ {forgotSuccess}
                </div>
                <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => setShowForgotModal(false)}>
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit}>
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label">Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                    <input 
                      type="email" 
                      className="form-input" 
                      style={{ paddingLeft: '2.4rem' }}
                      placeholder="name@example.com"
                      value={forgotEmail}
                      onChange={(e) => {
                        setForgotEmail(e.target.value);
                        if (forgotError) setForgotError('');
                      }}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-outline" onClick={() => setShowForgotModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-action" disabled={forgotLoading}>
                    {forgotLoading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

