import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Interview } from '../types';
import { TrendingUp, Calendar, Award, ArrowRight } from 'lucide-react';

interface HistoryPageProps {
  onNavigateToResult: (id: number) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onNavigateToResult }) => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.listInterviews();
        setInterviews(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center' }}>Loading Interview History...</div>;

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', maxWidth: '1000px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2>Interview History & Improvement Analytics</h2>
        <p>Track your historical performance growth and compare past mock interview scores.</p>
      </div>

      {/* Historical Growth Card */}
      <div className="card" style={{ marginBottom: '2.5rem', background: '#FFFFFF', padding: '1.75rem' }}>
        <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TrendingUp size={20} color="#2563EB" /> Performance Trajectory
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', textAlign: 'center' }}>
          <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Interview #1</span>
            <h3 style={{ color: '#1E3A5F', marginTop: '0.2rem' }}>61%</h3>
          </div>
          <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Interview #2</span>
            <h3 style={{ color: '#1E3A5F', marginTop: '0.2rem' }}>68%</h3>
          </div>
          <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Interview #3</span>
            <h3 style={{ color: '#1E3A5F', marginTop: '0.2rem' }}>75%</h3>
          </div>
          <div style={{ background: '#EFF6FF', padding: '1rem', borderRadius: '8px', border: '1px solid #BFDBFE' }}>
            <span style={{ fontSize: '0.8rem', color: '#2563EB', fontWeight: '700' }}>Interview #4</span>
            <h3 style={{ color: '#2563EB', marginTop: '0.2rem' }}>82%</h3>
          </div>
        </div>
      </div>

      {/* History Log List */}
      <div className="card">
        <h3 style={{ marginBottom: '1.25rem' }}>Completed Mock Interviews</h3>

        {interviews.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {interviews.map((item) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
                <div>
                  <strong style={{ fontSize: '1rem', color: '#1E3A5F' }}>{item.type} Interview</strong>
                  <div style={{ fontSize: '0.825rem', color: '#64748B', marginTop: '0.2rem' }}>
                    Difficulty: {item.difficulty} • Total Questions: {item.total_questions}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span className="badge badge-success" style={{ fontSize: '0.9rem' }}>
                    {item.score?.overall_score ? `${item.score.overall_score}/100` : 'In Progress'}
                  </span>
                  <button className="btn btn-outline btn-sm" onClick={() => onNavigateToResult(item.id)}>
                    View Report <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#64748B' }}>No past interviews found.</p>
        )}
      </div>
    </div>
  );
};
