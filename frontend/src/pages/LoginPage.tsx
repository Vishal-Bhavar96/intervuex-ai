import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, Key, Mail, Shield, UserCheck } from 'lucide-react';

interface LoginPageProps {
  onSuccess: () => void;
  onSwitchToRegister: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess, onSwitchToRegister }) => {
  const { login, register } = useAuth();
  const [email, setEmail] = useState('candidate@intervuex.com');
  const [password, setPassword] = useState('Password123!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      onSuccess();
    } catch (err: any) {
      // If candidate account doesn't exist yet, auto-register for seamless experience
      try {
        await register(email, password, email.split('@')[0], email.includes('admin') ? 'ADMIN' : 'CANDIDATE');
        onSuccess();
      } catch (regErr: any) {
        setError(err.message || 'Login failed. Please check credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role: 'CANDIDATE' | 'ADMIN') => {
    setError('');
    setLoading(true);
    const demoEmail = role === 'ADMIN' ? 'admin@intervuex.com' : 'candidate@intervuex.com';
    const demoName = role === 'ADMIN' ? 'System Admin' : 'Jane Candidate';
    
    try {
      await login(demoEmail, 'Password123!');
      onSuccess();
    } catch (e) {
      try {
        await register(demoEmail, 'Password123!', demoName, role);
        onSuccess();
      } catch (err: any) {
        setError('Demo sign in failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 70px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#E0F2FE', color: '#0284C7', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
            <LogIn size={24} />
          </div>
          <h2>Welcome Back</h2>
          <p>Sign in to your IntervueX candidate workspace</p>
        </div>

        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#DC2626', padding: '0.75rem', borderRadius: '6px', fontSize: '0.875rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              <input 
                type="email" 
                className="form-input" 
                style={{ paddingLeft: '2.4rem' }}
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Key size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              <input 
                type="password" 
                className="form-input" 
                style={{ paddingLeft: '2.4rem' }}
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
          </div>

          <button type="submit" className="btn btn-action" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Quick One-Click Demo Sign-in */}
        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #E2E8F0', textAlign: 'center' }}>
          <p style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748B', marginBottom: '0.75rem' }}>QUICK DEMO ACCESSIBILITY</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <button className="btn btn-outline btn-sm" onClick={() => handleQuickDemo('CANDIDATE')}>
              <UserCheck size={14} /> Demo Candidate
            </button>
            <button className="btn btn-outline btn-sm" onClick={() => handleQuickDemo('ADMIN')}>
              <Shield size={14} /> Demo Admin
            </button>
          </div>
        </div>

        <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.875rem' }}>
          Don't have an account?{' '}
          <span onClick={onSwitchToRegister} style={{ color: '#2563EB', fontWeight: '600', cursor: 'pointer' }}>
            Create one
          </span>
        </div>
      </div>
    </div>
  );
};
