import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { DashboardMetrics } from '../types';
import { 
  Award, FileText, Target, PlayCircle, TrendingUp, AlertTriangle, 
  CheckCircle, ArrowRight, Activity, Calendar, MapPin
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (tab: string, extra?: any) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const data = await api.getDashboard();
        setMetrics(data);
      } catch (e) {
        console.error('Failed to load dashboard metrics');
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center' }}>Loading your IntervueX workspace...</div>;
  }

  const resumeScore = metrics?.resume_score || 78;
  const jobMatchScore = metrics?.job_match_score || 76;
  const readinessScore = metrics?.career_readiness_score || 81;
  const readinessCategory = metrics?.readiness_category || 'Interview Ready';

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      {/* Welcome Banner */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #1E3A5F 0%, #1D4ED8 100%)', color: '#FFFFFF', padding: '2rem', borderRadius: '16px', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ background: 'rgba(255,255,255,0.15)', padding: '0.3rem 0.8rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              CANDIDATE WORKSPACE
            </span>
            <h1 style={{ color: '#FFFFFF', marginTop: '0.5rem', marginBottom: '0.35rem' }}>
              Welcome back, {user?.full_name || 'Candidate'}!
            </h1>
            <p style={{ color: '#93C5FD', fontSize: '1rem' }}>
              Your AI career coach is ready. Prepare for realistic technical and project defense interviews.
            </p>
          </div>

          <button className="btn btn-action btn-lg" onClick={() => onNavigate('setup')} style={{ background: '#FFFFFF', color: '#1D4ED8', border: 'none', fontWeight: '700' }}>
            <PlayCircle size={20} /> Start Mock Interview
          </button>
        </div>
      </div>

      {/* Top 3 Core Metrics */}
      <div className="grid grid-3 gap-6" style={{ marginBottom: '2.5rem' }}>
        {/* Resume Score */}
        <div className="card card-hover">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <p style={{ fontSize: '0.85rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>RESUME SCORE</p>
              <h2 style={{ fontSize: '2.2rem', color: '#1E3A5F', marginTop: '0.2rem' }}>{resumeScore}<span style={{ fontSize: '1.1rem', color: '#94A3B8' }}>/100</span></h2>
            </div>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#E0F2FE', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={22} />
            </div>
          </div>
          <div className="progress-bar" style={{ marginBottom: '0.75rem' }}>
            <div className="progress-fill" style={{ width: `${resumeScore}%`, background: '#0284C7' }}></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Extracted Skills & Projects</span>
            <button className="btn btn-outline btn-sm" onClick={() => onNavigate('resume')}>Upload/View</button>
          </div>
        </div>

        {/* Job Match Score */}
        <div className="card card-hover">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <p style={{ fontSize: '0.85rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>JOB MATCH FIT</p>
              <h2 style={{ fontSize: '2.2rem', color: '#1E3A5F', marginTop: '0.2rem' }}>{jobMatchScore}%</h2>
            </div>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Target size={22} />
            </div>
          </div>
          <div className="progress-bar" style={{ marginBottom: '0.75rem' }}>
            <div className="progress-fill" style={{ width: `${jobMatchScore}%`, background: '#16A34A' }}></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Target Skill Alignment</span>
            <button className="btn btn-outline btn-sm" onClick={() => onNavigate('job')}>Analyze Job</button>
          </div>
        </div>

        {/* Career Readiness Score */}
        <div className="card card-hover">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <p style={{ fontSize: '0.85rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>CAREER READINESS</p>
              <h2 style={{ fontSize: '2.2rem', color: '#1E3A5F', marginTop: '0.2rem' }}>{readinessScore}%</h2>
            </div>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={22} />
            </div>
          </div>
          <div style={{ marginBottom: '0.75rem' }}>
            <span className="badge badge-success">{readinessCategory}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Interview Readiness Metric</span>
            <button className="btn btn-outline btn-sm" onClick={() => onNavigate('setup')}>Practice Now</button>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Activity & Skill Gaps */}
      <div className="grid grid-2 gap-6" style={{ marginBottom: '2.5rem' }}>
        
        {/* Quick Action Hub & Recent Interviews */}
        <div className="card">
          <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={20} color="#2563EB" /> Recent AI Interview Sessions
          </h3>

          {metrics?.recent_interviews && metrics.recent_interviews.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {metrics.recent_interviews.map((item) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
                  <div>
                    <strong style={{ color: '#1E3A5F', fontSize: '0.95rem' }}>{item.type} Interview</strong>
                    <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                      {item.difficulty} • {item.total_questions} Questions
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="badge badge-success" style={{ fontSize: '0.85rem' }}>
                      {item.score?.overall_score ? `${item.score.overall_score}/100` : 'In Progress'}
                    </span>
                    <button 
                      className="btn btn-outline btn-sm" 
                      style={{ marginLeft: '0.5rem' }}
                      onClick={() => onNavigate('result', item.id)}
                    >
                      View Report
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', background: '#F8FAFC', borderRadius: '8px', border: '1px dashed #CBD5E1' }}>
              <p style={{ marginBottom: '1rem', color: '#64748B' }}>No completed mock interviews yet.</p>
              <button className="btn btn-action" onClick={() => onNavigate('setup')}>
                <PlayCircle size={16} /> Start Your First Interview
              </button>
            </div>
          )}
        </div>

        {/* Identified Skill Gaps */}
        <div className="card">
          <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={20} color="#D97706" /> Identified Skill Gaps & Weak Areas
          </h3>

          {metrics?.top_skill_gaps && metrics.top_skill_gaps.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {metrics.top_skill_gaps.map((gap) => (
                <div key={gap.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.3rem' }}>
                    <strong style={{ color: '#1E3A5F' }}>{gap.skill_name}</strong>
                    <span style={{ color: '#DC2626', fontWeight: '600' }}>Gap: {gap.gap_percentage.toFixed(0)}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${gap.demonstrated_level}%`, background: '#D97706' }}></div>
                  </div>
                </div>
              ))}
              <button className="btn btn-outline btn-sm" onClick={() => onNavigate('roadmap')} style={{ marginTop: '0.75rem', alignSelf: 'flex-start' }}>
                View 4-Week Preparation Roadmap <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            <div style={{ padding: '1.5rem', background: '#F8FAFC', borderRadius: '8px' }}>
              <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
                Complete an AI mock interview to generate an automated skill gap analysis and custom preparation plan.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
