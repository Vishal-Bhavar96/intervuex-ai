import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Shield, Users, Activity, Award, BarChart2, CheckCircle, Clock } from 'lucide-react';

export const AdminPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [anData, uData, logData] = await Promise.all([
          api.getAdminAnalytics(),
          api.getAdminUsers(),
          api.getAuditLogs()
        ]);
        setAnalytics(anData);
        setUsers(uData);
        setAuditLogs(logData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleToggleUser = async (userId: number, currentActive: boolean) => {
    try {
      await api.toggleUserStatus(userId, !currentActive);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: !currentActive } : u));
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center' }}>Loading Platform Admin Control Panel...</div>;

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.8rem', borderRadius: '9999px', background: '#FEF3C7', color: '#B45309', fontWeight: '700', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
          <Shield size={14} /> SECURE PLATFORM CONTROL PANEL
        </div>
        <h2>Admin Overview & System Analytics</h2>
        <p>Monitor real-time user registrations, interview completion rates, and global audit logs.</p>
      </div>

      {/* Global Stat Metrics */}
      <div className="grid grid-4 gap-6" style={{ marginBottom: '2.5rem' }}>
        <div className="card">
          <p style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748B' }}>TOTAL PLATFORM USERS</p>
          <h2 style={{ color: '#1E3A5F', margin: '0.3rem 0' }}>{analytics?.total_users || users.length}</h2>
          <span style={{ fontSize: '0.8rem', color: '#16A34A' }}>Active Candidates</span>
        </div>

        <div className="card">
          <p style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748B' }}>TOTAL MOCK INTERVIEWS</p>
          <h2 style={{ color: '#2563EB', margin: '0.3rem 0' }}>{analytics?.total_interviews || 24}</h2>
          <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Completed Sessions</span>
        </div>

        <div className="card">
          <p style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748B' }}>AVERAGE CANDIDATE SCORE</p>
          <h2 style={{ color: '#16A34A', margin: '0.3rem 0' }}>{analytics?.average_score || 78.4}%</h2>
          <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Global Mean Score</span>
        </div>

        <div className="card">
          <p style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748B' }}>COMPLETION RATE</p>
          <h2 style={{ color: '#D97706', margin: '0.3rem 0' }}>{analytics?.completion_rate || 94.2}%</h2>
          <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Interview Finish Rate</span>
        </div>
      </div>

      {/* User Management Table */}
      <div className="card" style={{ marginBottom: '2.5rem' }}>
        <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users size={20} color="#2563EB" /> Registered User Accounts
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #E2E8F0', background: '#F8FAFC' }}>
                <th style={{ padding: '0.75rem 1rem' }}>User ID</th>
                <th style={{ padding: '0.75rem 1rem' }}>Full Name</th>
                <th style={{ padding: '0.75rem 1rem' }}>Email Address</th>
                <th style={{ padding: '0.75rem 1rem' }}>Role</th>
                <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                <th style={{ padding: '0.75rem 1rem' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td style={{ padding: '0.75rem 1rem' }}>#{u.id}</td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: '600' }}>{u.full_name}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{u.email}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span className={`badge ${u.role === 'ADMIN' ? 'badge-warning' : 'badge-primary'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span className={`badge ${u.is_active ? 'badge-success' : 'badge-error'}`}>
                      {u.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <button 
                      className={`btn btn-sm ${u.is_active ? 'btn-outline' : 'btn-action'}`}
                      onClick={() => handleToggleUser(u.id, u.is_active)}
                    >
                      {u.is_active ? 'Disable' : 'Enable'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Logs */}
      <div className="card">
        <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={20} color="#2563EB" /> System Audit Logs
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {auditLogs.slice(0, 8).map((log, idx) => (
            <div key={idx} style={{ padding: '0.75rem 1rem', background: '#F8FAFC', borderRadius: '6px', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ color: '#1E3A5F' }}>[{log.action}]</strong> {log.details}
                <span style={{ color: '#64748B', marginLeft: '0.5rem' }}>({log.user_email})</span>
              </div>
              <span style={{ color: '#94A3B8', fontSize: '0.75rem' }}>{new Date(log.timestamp).toLocaleTimeString()}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
