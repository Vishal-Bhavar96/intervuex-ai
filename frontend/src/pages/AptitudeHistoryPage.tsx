import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { AptitudeHistoryItem } from '../types/aptitude';
import { 
  History, TrendingUp, Award, Calendar, Clock, ArrowRight, Play, Eye
} from 'lucide-react';

interface AptitudeHistoryPageProps {
  onViewResult: (attemptId: number) => void;
  onStartNewTest: () => void;
}

export const AptitudeHistoryPage: React.FC<AptitudeHistoryPageProps> = ({
  onViewResult,
  onStartNewTest,
}) => {
  const [history, setHistory] = useState<AptitudeHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const data = await api.getAptitudeHistory();
        setHistory(data);
      } catch (e) {
        console.error('Failed to load aptitude history');
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center' }}>Loading your aptitude history...</div>;
  }

  // Calculate improvement trend data
  const sortedAsc = [...history].sort((a, b) => a.id - b.id);
  const bestScore = history.length > 0 ? Math.max(...history.map((h) => h.percentage)) : 0;
  const avgScore = history.length > 0 ? Math.round(history.reduce((acc, h) => acc + h.percentage, 0) / history.length) : 0;

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', maxWidth: '1050px' }}>
      
      {/* Header Banner */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #1E3A5F 0%, #2563EB 100%)', color: '#FFFFFF', padding: '2rem', borderRadius: '16px', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ background: 'rgba(255,255,255,0.15)', padding: '0.3rem 0.8rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>
              APTITUDE TRACKING
            </span>
            <h1 style={{ color: '#FFFFFF', marginTop: '0.5rem', marginBottom: '0.25rem', fontSize: '2rem', fontWeight: '800' }}>
              Assessment History & Progress
            </h1>
            <p style={{ color: '#BFDBFE', fontSize: '0.95rem' }}>
              Track your score improvement across MNC-style practice attempts.
            </p>
          </div>

          <button className="btn btn-action" onClick={onStartNewTest} style={{ background: '#FFFFFF', color: '#1D4ED8', border: 'none', fontWeight: '800' }}>
            <Play size={18} /> Take New Assessment
          </button>
        </div>
      </div>

      {/* Analytics Highlights Cards */}
      <div className="grid grid-3 gap-6" style={{ marginBottom: '2.5rem' }}>
        <div className="card">
          <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>TOTAL TESTS TAKEN</span>
          <h2 style={{ fontSize: '2rem', color: '#1E3A5F', marginTop: '0.2rem' }}>{history.length}</h2>
        </div>
        <div className="card">
          <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>BEST SCORE</span>
          <h2 style={{ fontSize: '2rem', color: '#16A34A', marginTop: '0.2rem' }}>{bestScore}%</h2>
        </div>
        <div className="card">
          <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>AVERAGE SCORE</span>
          <h2 style={{ fontSize: '2rem', color: '#2563EB', marginTop: '0.2rem' }}>{avgScore}%</h2>
        </div>
      </div>

      {/* APTITUDE PROGRESS GROWTH CHART */}
      {sortedAsc.length > 0 && (
        <div className="card" style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ color: '#1E3A5F', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={20} color="#16A34A" /> Your Aptitude Progress Growth
            </h3>
            <span className="badge badge-success">Consistent Practice</span>
          </div>

          {/* Graphical Growth Bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: '#F8FAFC', padding: '1.25rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
            {sortedAsc.map((attempt, idx) => (
              <div key={attempt.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                  <span style={{ fontWeight: '700', color: '#1E3A5F' }}>Attempt {idx + 1} ({attempt.company_pattern}) – {attempt.date}</span>
                  <strong style={{ color: '#2563EB' }}>{attempt.percentage}%</strong>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${attempt.percentage}%`, background: attempt.percentage >= 75 ? '#16A34A' : '#2563EB' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ASSESSMENT HISTORY TABLE */}
      <div className="card">
        <h3 style={{ marginBottom: '1.25rem', color: '#1E3A5F', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <History size={20} color="#2563EB" /> Attempt Records Table
        </h3>

        {history.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #E2E8F0', color: '#64748B' }}>
                  <th style={{ padding: '0.75rem' }}>Date</th>
                  <th style={{ padding: '0.75rem' }}>Assessment Pattern</th>
                  <th style={{ padding: '0.75rem' }}>Score</th>
                  <th style={{ padding: '0.75rem' }}>Accuracy</th>
                  <th style={{ padding: '0.75rem' }}>Duration</th>
                  <th style={{ padding: '0.75rem' }}>Performance Level</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '0.85rem', color: '#1E3A5F', fontWeight: '600' }}>{item.date}</td>
                    <td style={{ padding: '0.85rem' }}>
                      <strong>{item.company_pattern}</strong>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748B' }}>{item.difficulty_mode} Mode</span>
                    </td>
                    <td style={{ padding: '0.85rem', fontWeight: '800', color: '#2563EB' }}>{item.percentage}%</td>
                    <td style={{ padding: '0.85rem', color: '#16A34A', fontWeight: '700' }}>{item.accuracy}%</td>
                    <td style={{ padding: '0.85rem', color: '#64748B' }}>{item.duration_minutes} min</td>
                    <td style={{ padding: '0.85rem' }}>
                      <span className="badge badge-info">{item.performance_level}</span>
                    </td>
                    <td style={{ padding: '0.85rem', textAlign: 'right' }}>
                      <button className="btn btn-outline btn-sm" onClick={() => onViewResult(item.id)}>
                        <Eye size={14} /> View Result
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', background: '#F8FAFC', borderRadius: '10px' }}>
            <p style={{ color: '#64748B', marginBottom: '1rem' }}>No aptitude test attempts recorded yet.</p>
            <button className="btn btn-action" onClick={onStartNewTest}>
              Start First Assessment
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
