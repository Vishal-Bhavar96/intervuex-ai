import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LogIn, UserPlus, Key, Mail, User, Eye, EyeOff, CheckCircle2, 
  AlertCircle, X, Sparkles, Lock, ArrowRight, ShieldCheck, Zap,
  Check
} from 'lucide-react';

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
  const [rememberMe, setRememberMe] = useState(true);

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
    const score = (hasMinLength ? 1 : 0) + (hasLetter ? 1 : 0) + (hasNumber ? 1 : 0);
    return { hasMinLength, hasLetter, hasNumber, score, isValid: hasMinLength && hasLetter && hasNumber };
  };

  const pwdValidation = validatePasswordRules(password);

  const fillQuickDemo = (demoType: 'candidate' | 'admin') => {
    setError('');
    setEmailError('');
    setPasswordError('');
    setAuthMode('login');
    if (demoType === 'candidate') {
      setEmail('candidate@intervuex.com');
      setPassword('password123');
    } else {
      setEmail('admin@intervuex.com');
      setPassword('admin123');
    }
  };

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
        setError('Incorrect email or password. Please verify your credentials or register a new account.');
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
      setSuccessMsg('Account created successfully! Launching your candidate workspace...');
      setTimeout(() => {
        onSuccess();
      }, 600);
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
    <div style={{
      minHeight: 'calc(100vh - 70px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 1.25rem',
      position: 'relative',
      overflow: 'hidden'
    }}>

      {/* Creative Ambient Background Glow Orbs */}
      <div style={{
        position: 'absolute',
        top: '15%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '600px',
        height: '350px',
        background: 'radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, rgba(147, 51, 234, 0.05) 50%, transparent 70%)',
        filter: 'blur(60px)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '15%',
        width: '400px',
        height: '280px',
        background: 'radial-gradient(circle, rgba(14, 165, 233, 0.12) 0%, transparent 60%)',
        filter: 'blur(50px)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      {/* Main Centered Auth Container */}
      <div style={{ width: '100%', maxWidth: '480px', position: 'relative', zIndex: 1 }}>
        
        {/* Creative Top Branding Pill */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'var(--soft-blue)',
            color: 'var(--primary-blue)',
            padding: '0.4rem 0.95rem',
            borderRadius: '9999px',
            fontSize: '0.78rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            border: '1px solid rgba(37, 99, 235, 0.2)',
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.1)',
            marginBottom: '1rem'
          }}>
            <Sparkles size={14} /> AI-POWERED CAREER READINESS
          </div>

          <h1 style={{
            fontSize: '2rem',
            fontWeight: 800,
            color: 'var(--main-heading)',
            letterSpacing: '-0.03em',
            margin: '0 0 0.4rem 0'
          }}>
            {authMode === 'login' ? 'Welcome to IntervueX' : 'Create Your Account'}
          </h1>
          
          <p style={{
            fontSize: '0.925rem',
            color: 'var(--secondary-text)',
            margin: 0
          }}>
            {authMode === 'login' 
              ? 'Sign in to access your AI mock interviews & aptitude tests' 
              : 'Start practicing with adaptive AI mock interviews today'}
          </p>
        </div>

        {/* Auth Card */}
        <div 
          className="card" 
          style={{
            padding: '2.25rem',
            borderRadius: '20px',
            border: '1px solid var(--primary-border)',
            background: 'var(--bg-card)',
            boxShadow: 'var(--shadow-md)',
            backdropFilter: 'blur(10px)',
            position: 'relative'
          }}
        >
          {/* Segmented Mode Switcher */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            background: 'var(--bg-card-subtle)',
            padding: '0.35rem',
            borderRadius: '12px',
            marginBottom: '1.75rem',
            border: '1px solid var(--primary-border)'
          }}>
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setError('');
                setSuccessMsg('');
              }}
              style={{
                padding: '0.65rem',
                borderRadius: '9px',
                border: 'none',
                background: authMode === 'login' ? 'var(--bg-card)' : 'transparent',
                color: authMode === 'login' ? 'var(--primary-blue)' : 'var(--secondary-text)',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: authMode === 'login' ? '0 2px 6px rgba(0, 0, 0, 0.08)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
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
                borderRadius: '9px',
                border: 'none',
                background: authMode === 'register' ? 'var(--bg-card)' : 'transparent',
                color: authMode === 'register' ? 'var(--primary-blue)' : 'var(--secondary-text)',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: authMode === 'register' ? '0 2px 6px rgba(0, 0, 0, 0.08)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <UserPlus size={16} /> Register
            </button>
          </div>

          {/* Quick Demo Credentials Bar (Sign In Mode Only) */}
          {authMode === 'login' && (
            <div style={{
              background: 'var(--soft-blue)',
              border: '1px dashed rgba(37, 99, 235, 0.3)',
              borderRadius: '10px',
              padding: '0.75rem 0.9rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--primary-blue)', fontWeight: 700 }}>
                <Zap size={14} /> Quick Demo:
              </div>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button
                  type="button"
                  onClick={() => fillQuickDemo('candidate')}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--primary-border)',
                    color: 'var(--main-heading)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '0.25rem 0.65rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.color = '#2563EB'; }}
                  onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--primary-border)'; e.currentTarget.style.color = 'var(--main-heading)'; }}
                >
                  Candidate
                </button>
                <button
                  type="button"
                  onClick={() => fillQuickDemo('admin')}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--primary-border)',
                    color: 'var(--main-heading)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '0.25rem 0.65rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.color = '#2563EB'; }}
                  onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--primary-border)'; e.currentTarget.style.color = 'var(--main-heading)'; }}
                >
                  Admin
                </button>
              </div>
            </div>
          )}

          {/* Feedback Messages */}
          {error && (
            <div style={{
              background: 'var(--danger-bg)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: 'var(--danger)',
              padding: '0.85rem 1rem',
              borderRadius: '10px',
              fontSize: '0.875rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.65rem'
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontWeight: 700, marginBottom: '2px' }}>Authentication Error</div>
                <div>{error}</div>
              </div>
            </div>
          )}

          {successMsg && (
            <div style={{
              background: 'var(--success-bg)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              color: 'var(--success)',
              padding: '0.85rem 1rem',
              borderRadius: '10px',
              fontSize: '0.875rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem'
            }}>
              <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
              <div style={{ fontWeight: 700 }}>{successMsg}</div>
            </div>
          )}

          {/* SIGN IN FORM */}
          {authMode === 'login' ? (
            <form onSubmit={handleLoginSubmit} noValidate>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: emailError ? '#EF4444' : 'var(--placeholder)' }} />
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
                  <div style={{ color: '#DC2626', fontSize: '0.8rem', marginTop: '0.35rem', fontWeight: 500 }}>
                    ⚠ {emailError}
                  </div>
                )}
              </div>

              <div className="form-group" style={{ marginBottom: '1.35rem' }}>
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
                    style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: '0.825rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                  >
                    Forgot Password?
                  </button>
                </div>

                <div style={{ position: 'relative' }}>
                  <Key size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: passwordError ? '#EF4444' : 'var(--placeholder)' }} />
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
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--secondary-text)', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {passwordError && (
                  <div style={{ color: '#DC2626', fontSize: '0.8rem', marginTop: '0.35rem', fontWeight: 500 }}>
                    ⚠ {passwordError}
                  </div>
                )}
              </div>

              {/* Remember Me Checkbox */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '1.5rem' }}>
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#2563EB', cursor: 'pointer' }}
                />
                <label htmlFor="rememberMe" style={{ fontSize: '0.85rem', color: 'var(--secondary-text)', cursor: 'pointer', userSelect: 'none' }}>
                  Remember this device for 30 days
                </label>
              </div>

              <button 
                type="submit" 
                className="btn btn-action" 
                style={{ 
                  width: '100%', 
                  padding: '0.8rem', 
                  fontSize: '1rem', 
                  fontWeight: 700, 
                  borderRadius: '10px',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)' 
                }} 
                disabled={loading}
              >
                {loading ? 'Authenticating...' : (
                  <>
                    Sign In to Workspace <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegisterSubmit} noValidate>
              <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                <label className="form-label">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--placeholder)' }} />
                  <input 
                    type="text" 
                    className="form-input" 
                    style={{ paddingLeft: '2.6rem' }}
                    placeholder="e.g. Alex Candidate"
                    value={fullName} 
                    onChange={(e) => setFullName(e.target.value)} 
                    required 
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                <label className="form-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--placeholder)' }} />
                  <input 
                    type="email" 
                    className="form-input" 
                    style={{ paddingLeft: '2.6rem' }}
                    placeholder="alex@example.com"
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.35rem' }}>
                <label className="form-label">Create Password</label>
                <div style={{ position: 'relative' }}>
                  <Key size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--placeholder)' }} />
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    className="form-input" 
                    style={{ paddingLeft: '2.6rem', paddingRight: '2.6rem' }}
                    placeholder="Min. 8 characters (letters & numbers)"
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--secondary-text)', padding: '4px' }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Live Password Strength Indicator */}
                {password.length > 0 && (
                  <div style={{ marginTop: '0.6rem' }}>
                    <div style={{ display: 'flex', gap: '4px', marginBottom: '0.35rem' }}>
                      <div style={{ height: '4px', flex: 1, borderRadius: '2px', background: pwdValidation.score >= 1 ? '#EF4444' : 'var(--primary-border)' }} />
                      <div style={{ height: '4px', flex: 1, borderRadius: '2px', background: pwdValidation.score >= 2 ? '#F59E0B' : 'var(--primary-border)' }} />
                      <div style={{ height: '4px', flex: 1, borderRadius: '2px', background: pwdValidation.score >= 3 ? '#10B981' : 'var(--primary-border)' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--secondary-text)' }}>
                      <span>8+ chars {pwdValidation.hasMinLength ? '✓' : '•'}</span>
                      <span>Letters {pwdValidation.hasLetter ? '✓' : '•'}</span>
                      <span>Numbers {pwdValidation.hasNumber ? '✓' : '•'}</span>
                    </div>
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                className="btn btn-action" 
                style={{ 
                  width: '100%', 
                  padding: '0.8rem', 
                  fontSize: '1rem', 
                  fontWeight: 700, 
                  borderRadius: '10px',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)' 
                }} 
                disabled={loading}
              >
                {loading ? 'Creating Workspace...' : (
                  <>
                    Create Candidate Account <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Card Footer Switcher */}
          <div style={{
            marginTop: '1.75rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--primary-border)',
            textAlign: 'center',
            fontSize: '0.875rem',
            color: 'var(--secondary-text)'
          }}>
            {authMode === 'login' ? (
              <>
                New candidate on IntervueX?{' '}
                <button
                  type="button"
                  onClick={() => { setAuthMode('register'); setError(''); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#2563EB',
                    fontWeight: 700,
                    cursor: 'pointer',
                    padding: 0,
                    textDecoration: 'underline'
                  }}
                >
                  Create account
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setError(''); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#2563EB',
                    fontWeight: 700,
                    cursor: 'pointer',
                    padding: 0,
                    textDecoration: 'underline'
                  }}
                >
                  Sign in here
                </button>
              </>
            )}
          </div>
        </div>

        {/* Creative Micro-Feature Chips Below Card */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '0.65rem',
          marginTop: '1.75rem',
          padding: '0 0.5rem'
        }}>
          {[
            'MNC Aptitude Suites',
            'Adaptive AI Interviews',
            'ATS Resume Scoring',
            'Python Sandbox'
          ].map((item, i) => (
            <span
              key={i}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.76rem',
                fontWeight: 600,
                color: 'var(--secondary-text)',
                background: 'var(--bg-card)',
                border: '1px solid var(--primary-border)',
                padding: '0.3rem 0.65rem',
                borderRadius: '9999px',
                boxShadow: 'var(--shadow-subtle)'
              }}
            >
              <Check size={12} color="#22C55E" strokeWidth={3} /> {item}
            </span>
          ))}
        </div>

      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="card" style={{
            width: '100%',
            maxWidth: '440px',
            padding: '2rem',
            borderRadius: '20px',
            position: 'relative',
            border: '1px solid var(--primary-border)',
            background: 'var(--bg-card)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
          }}>
            <button 
              onClick={() => setShowForgotModal(false)}
              style={{
                position: 'absolute',
                right: '18px',
                top: '18px',
                background: 'none',
                border: 'none',
                color: 'var(--secondary-text)',
                cursor: 'pointer',
                display: 'flex',
                padding: '4px'
              }}
            >
              <X size={20} />
            </button>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'var(--soft-blue)',
                color: 'var(--primary-blue)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.85rem'
              }}>
                <Lock size={22} />
              </div>
              <h3 style={{ fontSize: '1.3rem', color: 'var(--main-heading)', margin: 0 }}>Reset Password</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--secondary-text)', marginTop: '0.35rem' }}>
                Enter your registered email address to receive secure reset instructions.
              </p>
            </div>

            {forgotError && (
              <div style={{
                background: 'var(--danger-bg)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: 'var(--danger)',
                padding: '0.75rem 0.9rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                marginBottom: '1rem'
              }}>
                ⚠ {forgotError}
              </div>
            )}

            {forgotSuccess ? (
              <div>
                <div style={{
                  background: 'var(--success-bg)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  color: 'var(--success)',
                  padding: '0.95rem',
                  borderRadius: '10px',
                  fontSize: '0.875rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <CheckCircle2 size={18} /> {forgotSuccess}
                </div>
                <button 
                  className="btn btn-outline" 
                  style={{ width: '100%', borderRadius: '10px' }} 
                  onClick={() => setShowForgotModal(false)}
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit}>
                <div className="form-group" style={{ marginBottom: '1.35rem' }}>
                  <label className="form-label">Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--placeholder)' }} />
                    <input 
                      type="email" 
                      className="form-input" 
                      style={{ paddingLeft: '2.6rem' }}
                      placeholder="name@example.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button 
                    type="button" 
                    className="btn btn-outline" 
                    style={{ borderRadius: '8px' }}
                    onClick={() => setShowForgotModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-action" 
                    style={{ borderRadius: '8px' }}
                    disabled={forgotLoading}
                  >
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
