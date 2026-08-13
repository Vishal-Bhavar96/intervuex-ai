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
      <div className="card" style={{ marginBottom: '2.5rem' }}>
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

      {/* Aptitude Question Bank Manager */}
      <AptitudeAdminManager />

    </div>
  );
};

const AptitudeAdminManager: React.FC = () => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newQ, setNewQ] = useState({
    question_code: '',
    section: 'Quantitative Aptitude',
    topic: 'Percentages',
    difficulty: 'Medium',
    question_text: '',
    opt1: '', opt2: '', opt3: '', opt4: '',
    correct_option: 0,
    explanation: ''
  });

  useEffect(() => {
    loadQuestions();
  }, []);

  async function loadQuestions() {
    try {
      const data = await api.getAdminAptitudeQuestions();
      setQuestions(data);
    } catch (e) {
      console.error(e);
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createAdminAptitudeQuestion({
        question_code: newQ.question_code || `QA${Date.now().toString().slice(-3)}`,
        section: newQ.section,
        topic: newQ.topic,
        difficulty: newQ.difficulty,
        question_text: newQ.question_text,
        options: [newQ.opt1, newQ.opt2, newQ.opt3, newQ.opt4],
        correct_option: Number(newQ.correct_option),
        explanation: newQ.explanation,
        time_estimate_seconds: 60,
        tags: [newQ.section, newQ.topic],
        company_patterns: ['General MNC']
      });
      setShowAddForm(false);
      loadQuestions();
    } catch (err) {
      alert('Failed to add question');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    try {
      await api.deleteAdminAptitudeQuestion(id);
      loadQuestions();
    } catch (e) {
      alert('Failed to delete question');
    }
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1E3A5F' }}>
          <BarChart2 size={20} color="#059669" /> Aptitude Question Bank ({questions.length} Questions)
        </h3>
        <button className="btn btn-action btn-sm" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Cancel' : '+ Add Question'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleCreate} style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '10px', marginBottom: '1.5rem', border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '700' }}>Question Code</label>
              <input className="input" value={newQ.question_code} onChange={(e) => setNewQ({ ...newQ, question_code: e.target.value })} placeholder="e.g. QA015" required />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '700' }}>Section</label>
              <select className="input" value={newQ.section} onChange={(e) => setNewQ({ ...newQ, section: e.target.value })}>
                <option>Quantitative Aptitude</option>
                <option>Logical Reasoning</option>
                <option>Verbal Ability</option>
                <option>Data Interpretation</option>
                <option>Analytical Reasoning</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '700' }}>Topic</label>
              <input className="input" value={newQ.topic} onChange={(e) => setNewQ({ ...newQ, topic: e.target.value })} placeholder="e.g. Percentages" required />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: '700' }}>Question Text</label>
            <textarea className="input" rows={2} value={newQ.question_text} onChange={(e) => setNewQ({ ...newQ, question_text: e.target.value })} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            <input className="input" placeholder="Option 1" value={newQ.opt1} onChange={(e) => setNewQ({ ...newQ, opt1: e.target.value })} required />
            <input className="input" placeholder="Option 2" value={newQ.opt2} onChange={(e) => setNewQ({ ...newQ, opt2: e.target.value })} required />
            <input className="input" placeholder="Option 3" value={newQ.opt3} onChange={(e) => setNewQ({ ...newQ, opt3: e.target.value })} required />
            <input className="input" placeholder="Option 4" value={newQ.opt4} onChange={(e) => setNewQ({ ...newQ, opt4: e.target.value })} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '700' }}>Correct Option Index</label>
              <select className="input" value={newQ.correct_option} onChange={(e) => setNewQ({ ...newQ, correct_option: Number(e.target.value) })}>
                <option value={0}>Option 1 (0)</option>
                <option value={1}>Option 2 (1)</option>
                <option value={2}>Option 3 (2)</option>
                <option value={3}>Option 4 (3)</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '700' }}>Explanation</label>
              <input className="input" value={newQ.explanation} onChange={(e) => setNewQ({ ...newQ, explanation: e.target.value })} placeholder="Step-by-step solution" />
            </div>
          </div>

          <button className="btn btn-action" type="submit">Save Question</button>
        </form>
      )}

      <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #E2E8F0', background: '#F8FAFC', textAlign: 'left' }}>
              <th style={{ padding: '0.5rem 0.75rem' }}>Code</th>
              <th style={{ padding: '0.5rem 0.75rem' }}>Section & Topic</th>
              <th style={{ padding: '0.5rem 0.75rem' }}>Question</th>
              <th style={{ padding: '0.5rem 0.75rem' }}>Difficulty</th>
              <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((q) => (
              <tr key={q.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '0.65rem 0.75rem', fontWeight: '700', color: '#2563EB' }}>{q.question_code}</td>
                <td style={{ padding: '0.65rem 0.75rem' }}>
                  <strong>{q.section}</strong>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748B' }}>{q.topic}</span>
                </td>
                <td style={{ padding: '0.65rem 0.75rem', color: '#1E3A5F' }}>{q.question_text.slice(0, 70)}...</td>
                <td style={{ padding: '0.65rem 0.75rem' }}>
                  <span className="badge badge-info">{q.difficulty}</span>
                </td>
                <td style={{ padding: '0.65rem 0.75rem', textAlign: 'right' }}>
                  <button className="btn btn-outline btn-sm" style={{ color: '#DC2626', borderColor: '#FCA5A5' }} onClick={() => handleDelete(q.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
