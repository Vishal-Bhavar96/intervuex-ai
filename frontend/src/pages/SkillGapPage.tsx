import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { SkillGap } from '../types';
import { AlertTriangle, CheckCircle, Target, ArrowRight } from 'lucide-react';

interface SkillGapPageProps {
  onNavigateToRoadmap: () => void;
}

export const SkillGapPage: React.FC<SkillGapPageProps> = ({ onNavigateToRoadmap }) => {
  const [gaps, setGaps] = useState<SkillGap[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getDashboard();
        setGaps(data.top_skill_gaps || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center' }}>Loading Skill Gap Analysis...</div>;

  const defaultSkills = [
    { name: 'Python Fundamentals', req: 90, demo: 88, status: 'MATCH' },
    { name: 'FastAPI & REST APIs', req: 85, demo: 76, status: 'PARTIAL' },
    { name: 'SQL Query Optimization', req: 80, demo: 62, status: 'GAP' },
    { name: 'Docker & Containerization', req: 80, demo: 45, status: 'CRITICAL_GAP' },
    { name: 'System Architecture & Scaling', req: 85, demo: 51, status: 'CRITICAL_GAP' },
  ];

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', maxWidth: '1000px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2>Skill Gap Analysis</h2>
        <p>Comparison between required target job skills and demonstrated candidate interview skills.</p>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Target size={20} color="#2563EB" /> Target Skill Competency Breakdown
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {defaultSkills.map((item, idx) => (
            <div key={idx} style={{ padding: '1rem', border: '1px solid #E2E8F0', borderRadius: '8px', background: '#FFFFFF' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div>
                  <strong style={{ fontSize: '1rem', color: '#1E3A5F' }}>{item.name}</strong>
                  <span style={{ marginLeft: '0.75rem', fontSize: '0.8rem', color: '#64748B' }}>
                    Required: {item.req}% | Demonstrated: {item.demo}%
                  </span>
                </div>
                <div>
                  {item.demo >= 80 ? (
                    <span className="badge badge-success">Match ({item.demo}%)</span>
                  ) : item.demo >= 65 ? (
                    <span className="badge badge-warning">Partial ({item.demo}%)</span>
                  ) : (
                    <span className="badge badge-error">Weak Area ({item.demo}%)</span>
                  )}
                </div>
              </div>

              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ 
                    width: `${item.demo}%`, 
                    background: item.demo >= 80 ? '#16A34A' : item.demo >= 65 ? '#D97706' : '#DC2626' 
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ textAlign: 'center', background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
        <h3 style={{ color: '#1E3A5F', marginBottom: '0.5rem' }}>Ready to Bridge Your Skill Gaps?</h3>
        <p style={{ marginBottom: '1.25rem' }}>Follow your personalized 4-Week preparation plan created automatically based on these findings.</p>
        <button className="btn btn-action" onClick={onNavigateToRoadmap}>
          Open 4-Week Preparation Roadmap <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
