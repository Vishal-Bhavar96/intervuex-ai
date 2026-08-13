import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Key, User, Eye, EyeOff } from 'lucide-react';

interface RegisterPageProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onSuccess, onSwitchToLogin }) => {
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('CANDIDATE');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validatePasswordRules = (pwd: string) => {
    const hasMinLength = pwd.length >= 8;
    const hasLetter = /[a-zA-Z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    return { hasMinLength, hasLetter, hasNumber, isValid: hasMinLength && hasLetter && hasNumber };
  };

  const pwdValidation = validatePasswordRules(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!pwdValidation.isValid) {
      setError('Password must be at least 8 characters long and contain both letters and numbers.');
      return;
    }

    setLoading(true);
    try {
      await register(email, password, fullName, role);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Registration failed. Try a different email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 70px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: '460px' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#F0FDF4', color: '#16A34A', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
            <UserPlus size={24} />
          </div>
          <h2>Create Account</h2>
          <p>Join IntervueX to start your AI-powered career preparation</p>
        </div>

        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#DC2626', padding: '0.75rem', borderRadius: '6px', fontSize: '0.875rem', marginBottom: '1rem' }}>
            ⚠ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              <input 
                type="text" 
                className="form-input" 
                style={{ paddingLeft: '2.4rem' }}
                placeholder="Jane Candidate"
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              <input 
                type="email" 
                className="form-input" 
                style={{ paddingLeft: '2.4rem' }}
                placeholder="candidate@example.com"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Key size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              <input 
                type={showPassword ? 'text' : 'password'} 
                className="form-input" 
                style={{ paddingLeft: '2.4rem', paddingRight: '2.5rem' }}
                placeholder="At least 8 characters"
                value={password} 
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
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

            {/* Password Rules Checklist Box */}
            <div style={{ marginTop: '0.5rem', background: '#F8FAFC', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.78rem' }}>
              <div style={{ fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Password Requirements:</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <span style={{ color: pwdValidation.hasMinLength ? '#16A34A' : '#64748B', fontWeight: pwdValidation.hasMinLength ? '700' : '400' }}>
                  {pwdValidation.hasMinLength ? '✓' : '•'} Minimum 8 characters
                </span>
                <span style={{ color: pwdValidation.hasLetter ? '#16A34A' : '#64748B', fontWeight: pwdValidation.hasLetter ? '700' : '400' }}>
                  {pwdValidation.hasLetter ? '✓' : '•'} At least one letter (a-z, A-Z)
                </span>
                <span style={{ color: pwdValidation.hasNumber ? '#16A34A' : '#64748B', fontWeight: pwdValidation.hasNumber ? '700' : '400' }}>
                  {pwdValidation.hasNumber ? '✓' : '•'} At least one number (0-9)
                </span>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Account Role</label>
            <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="CANDIDATE">Student / Candidate</option>
              <option value="ADMIN">Platform Administrator</option>
            </select>
          </div>

          <button type="submit" className="btn btn-action" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.875rem' }}>
          Already have an account?{' '}
          <span onClick={onSwitchToLogin} style={{ color: '#2563EB', fontWeight: '600', cursor: 'pointer' }}>
            Sign In
          </span>
        </div>
      </div>
    </div>
  );
};
