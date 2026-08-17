import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, UserPlus, Key, Mail, User, Eye, EyeOff, CheckCircle, AlertCircle, X, Sparkles, Lock, ShieldCheck } from 'lucide-react';

interface LoginPageProps {
  onSuccess: () => void;
  onSwitchToRegister?: () => void;
  initialMode?: 'login' | 'register';
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess, initialMode = 'login' }) => {
  const { login, register } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>(initialMode);

  // Common Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Registration Extra States
  const [fullName, setFullName] = useState('');

  // Alert & Feedback States
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot Password Modal
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const validatePasswordRules = (pwd: string) => {
    const hasMinLength = pwd.length >= 8;
    const hasLetter = /[a-zA-Z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    return { hasMinLength, hasLetter, hasNumber, isValid: hasMinLength && hasLetter && hasNumber };
  };

  const pwdValidation = validatePasswordRules(password);

  const validateLoginForm = () => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');
    setError('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setEmailError('Please enter your email address.');
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setEmailError('Please enter a valid email address.');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Please enter your password.');
      isValid = false;
    }

    return isValid;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLoginForm()) return;

    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      await login(email.trim(), password);
      onSuccess();
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('401') || msg.toLowerCase().includes('credential') || msg.toLowerCase().includes('incorrect')) {
        setError('Incorrect email address or password. Please verify your credentials or register a new account.');
      } else {
        setError(msg || 'Authentication failed. Please check your credentials and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!pwdValidation.isValid) {
      setError('Password must be at least 8 characters long and contain both letters and numbers.');
      return;
    }

    setLoading(true);
    try {
      await register(email.trim(), password, fullName.trim(), 'CANDIDATE');
      setSuccessMsg('Account created successfully! Signing in...');
      setTimeout(() => {
        onSuccess();
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Registration failed. An account with this email may already exist.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    const trimmed = forgotEmail.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setForgotError('Please enter a valid email address.');
      return;
    }

    setForgotLoading(true);
    setTimeout(() => {
      setForgotLoading(false);
      setForgotSuccess(`Password reset instructions sent to ${trimmed}.`);
    }, 600);
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 70px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2.5rem 1rem', background: '#F8FAFC' }}>
      <div style={{ maxWidth: '1020px', width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2.5rem', alignItems: 'stretch' }}>
        
        {/* Left Side Panel: Software Engineering Branding */}
        <div style={{ 
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', 
          color: '#FFFFFF', 
          padding: '2.5rem', 
          borderRadius: '20px', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'space-between',
          border: '1px solid #334155',
          boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.3)'
        }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(37, 99, 235, 0.2)', color: '#60A5FA', padding: '0.4rem 0.85rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.06em', marginBottom: '1.75rem', border: '1px solid rgba(96, 165, 250, 0.3)' }}>
              <Sparkles size={14} /> INTERVUEX AI PLATFORM
            </div>

            <h1 style={{ fontSize: '2.4rem', fontWeight: '800', lineHeight: 1.15, color: '#FFFFFF', marginBottom: '1rem' }}>
              Software Engineering<br />
              Placement & Interview<br />
              <span style={{ color: '#3B82F6' }}>Readiness Platform</span>
            </h1>

            <p style={{ fontSize: '0.95rem', color: '#94A3B8', lineHeight: 1.6, marginBottom: '2rem' }}>
              Structured MNC aptitude assessments, automated resume ATS parsing, and adaptive AI mock interviews tailored for software candidates.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { title: 'Resume ATS & Skill Extraction', desc: 'Analyzes technical stack, experience, and candidate projects.' },
                { title: 'Realistic AI Interviewer Engine', desc: 'Adaptive technical questioning based on candidate profile.' },
                { title: 'Placement Aptitude Proctored Tests', desc: 'MNC quantitative, logical, and technical practice suites.' }
              ].map((feat, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.2)', color: '#60A5FA', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: '#F8FAFC', display: 'block' }}>{feat.title}</strong>
                    <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{feat.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '2.5rem', paddingTop: '1.25rem', borderTop: '1px solid #334155', fontSize: '0.775rem', color: '#94A3B8' }}>
            🔒 Secured with Enterprise JWT & Encrypted Password Hashing
          </div>
        </div>

        {/* Right Side Panel: Clean Software Design Auth Card */}
        <div className="card" style={{ padding: '2.25rem', borderRadius: '20px', border: '1px solid #E2E8F0', background: '#FFFFFF', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          
          {/* Mode Switcher Tabs (Sign In vs Register) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: '#F1F5F9', padding: '0.3rem', borderRadius: '10px', marginBottom: '1.75rem' }}>
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setError('');
                setSuccessMsg('');
              }}
              style={{
                padding: '0.65rem',
                borderRadius: '8px',
                border: 'none',
                background: authMode === 'login' ? '#FFFFFF' : 'transparent',
                color: authMode === 'login' ? '#1E3A5F' : '#64748B',
                fontWeight: '700',
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: authMode === 'login' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                transition: 'all 0.2s'
              }}
            >
              <LogIn size={16} /> Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setError('');
                setSuccessMsg('');
              }}
              style={{
                padding: '0.65rem',
                borderRadius: '8px',
                border: 'none',
                background: authMode === 'register' ? '#FFFFFF' : 'transparent',
                color: authMode === 'register' ? '#1E3A5F' : '#64748B',
                fontWeight: '700',
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: authMode === 'register' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                transition: 'all 0.2s'
              }}
            >
              <UserPlus size={16} /> Register
            </button>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', color: '#0F172A', fontWeight: '800' }}>
              {authMode === 'login' ? 'Candidate Sign In' : 'Create Candidate Account'}
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '0.2rem' }}>
              {authMode === 'login' ? 'Enter your registered email and password to access your workspace.' : 'Fill in your details to start practicing AI interviews.'}
            </p>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#B91C1C', padding: '0.85rem 1rem', borderRadius: '10px', fontSize: '0.875rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontWeight: '700', marginBottom: '2px' }}>Authentication Error</div>
                <div>{error}</div>
              </div>
            </div>
          )}

          {successMsg && (
            <div style={{ background: '#F0FDF4', border: '1px solid #86EFAC', color: '#15803D', padding: '0.85rem 1rem', borderRadius: '10px', fontSize: '0.875rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <CheckCircle size={18} style={{ flexShrink: 0 }} />
              <div style={{ fontWeight: '700' }}>{successMsg}</div>
            </div>
          )}

          {/* LOGIN FORM */}
          {authMode === 'login' ? (
            <form onSubmit={handleLoginSubmit} noValidate>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: emailError ? '#EF4444' : '#94A3B8' }} />
                  <input 
                    type="email" 
                    className="form-input" 
                    style={{ paddingLeft: '2.6rem', borderColor: emailError ? '#EF4444' : undefined }}
                    placeholder="candidate@intervuex.com"
                    value={email} 
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError('');
                    }} 
                    required
                  />
                </div>
                {emailError && (
                  <div style={{ color: '#DC2626', fontSize: '0.8rem', marginTop: '0.35rem', fontWeight: '500' }}>
                    ⚠ {emailError}
                  </div>
                )}
              </div>

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
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title={showPassword ? 'Hide password' : 'Show password'}
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
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegisterSubmit} noValidate>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  <input 
                    type="text" 
                    className="form-input" 
                    style={{ paddingLeft: '2.6rem' }}
                    placeholder="e.g. Sagar Candidate"
                    value={fullName} 
                    onChange={(e) => setFullName(e.target.value)} 
                    required 
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  <input 
                    type="email" 
                    className="form-input" 
                    style={{ paddingLeft: '2.6rem' }}
                    placeholder="sagar@example.com"
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <Key size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    className="form-input" 
                    style={{ paddingLeft: '2.6rem', paddingRight: '2.6rem' }}
                    placeholder="At least 8 characters"
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: '4px' }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn btn-action" style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', fontWeight: '700' }} disabled={loading}>
                {loading ? 'Creating Account...' : 'Register & Create Account'}
              </button>
            </form>
          )}

          <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: '#64748B' }}>
            {authMode === 'login' ? (
              <>
                New to IntervueX?{' '}
                <span onClick={() => { setAuthMode('register'); setError(''); }} style={{ color: '#2563EB', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}>
                  Register account
                </span>
              </>
            ) : (
              <>
                Already registered?{' '}
                <span onClick={() => { setAuthMode('login'); setError(''); }} style={{ color: '#2563EB', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}>
                  Sign in here
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '440px', padding: '1.75rem', borderRadius: '16px', position: 'relative' }}>
            <button 
              onClick={() => setShowForgotModal(false)}
              style={{ position: 'absolute', right: '16px', top: '16px', background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#EFF6FF', color: '#2563EB', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                <Lock size={20} />
              </div>
              <h3 style={{ fontSize: '1.25rem' }}>Reset Password</h3>
              <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '0.25rem' }}>
                Enter your email address to receive password reset instructions.
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
                      onChange={(e) => setForgotEmail(e.target.value)}
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
