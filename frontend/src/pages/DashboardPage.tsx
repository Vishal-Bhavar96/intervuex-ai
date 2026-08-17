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

  const resumeCompleted = Boolean(metrics?.resume_completed);
  const resumeScore = resumeCompleted ? (metrics?.resume_score ?? 0) : 0;

  const jobMatchCompleted = Boolean(metrics?.job_match_completed);
  const jobMatchScore = jobMatchCompleted ? (metrics?.job_match_score ?? 0) : 0;

  const aptitudeCompleted = Boolean(metrics?.aptitude_completed);
  const aptitudeScore = aptitudeCompleted ? (metrics?.aptitude_score ?? 0) : 0;

  const completedCount = metrics?.completed_parameters_count ?? 0;
  const readinessScore = completedCount > 0 ? (metrics?.career_readiness_score ?? 0) : 0;
  const readinessCategory = completedCount > 0 ? (metrics?.readiness_category || 'Good Performance') : 'Pending Evaluation';

  const lastAptitudeDate = metrics?.last_aptitude_date;
  const bestAptitudeScore = metrics?.best_aptitude_score ?? 0;

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
              Your AI career coach is ready. Prepare for realistic MNC aptitude assessments and AI mock interviews.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-action btn-lg" onClick={() => onNavigate('aptitude')} style={{ background: '#FFFFFF', color: '#1D4ED8', border: 'none', fontWeight: '700' }}>
              <Activity size={20} /> Take Aptitude Test
            </button>
            <button className="btn btn-outline btn-lg" onClick={() => onNavigate('setup')} style={{ borderColor: 'rgba(255,255,255,0.4)', color: '#FFFFFF', fontWeight: '700' }}>
              <PlayCircle size={20} /> Mock Interview
            </button>
          </div>
        </div>
      </div>

      {/* Top 4 Core Metrics */}
      <div className="grid grid-4 gap-6" style={{ marginBottom: '2.5rem' }}>
        {/* Resume Score */}
        <div className="card card-hover">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <p style={{ fontSize: '0.85rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>RESUME SCORE</p>
              <h2 style={{ fontSize: '2.2rem', color: resumeCompleted ? '#1E3A5F' : '#94A3B8', marginTop: '0.2rem' }}>
                {resumeCompleted ? resumeScore : 0}<span style={{ fontSize: '1.1rem', color: '#94A3B8' }}>/100</span>
              </h2>
            </div>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: resumeCompleted ? '#E0F2FE' : '#F1F5F9', color: resumeCompleted ? '#0284C7' : '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={22} />
            </div>
          </div>
          <div className="progress-bar" style={{ marginBottom: '0.75rem' }}>
            <div className="progress-fill" style={{ width: `${resumeCompleted ? resumeScore : 0}%`, background: resumeCompleted ? '#0284C7' : '#CBD5E1' }}></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: resumeCompleted ? '#16A34A' : '#64748B', fontWeight: resumeCompleted ? '700' : '400' }}>
              {resumeCompleted ? '✓ Resume Analyzed' : 'Pending Resume Upload'}
            </span>
            <button className="btn btn-outline btn-sm" onClick={() => onNavigate('resume')}>
              {resumeCompleted ? 'View Analysis' : 'Upload Resume'}
            </button>
          </div>
        </div>

        {/* Job Match Score */}
        <div className="card card-hover">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <p style={{ fontSize: '0.85rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>JOB MATCH FIT</p>
              <h2 style={{ fontSize: '2.2rem', color: jobMatchCompleted ? '#1E3A5F' : '#94A3B8', marginTop: '0.2rem' }}>
                {jobMatchCompleted ? jobMatchScore : 0}%
              </h2>
            </div>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: jobMatchCompleted ? '#F0FDF4' : '#F1F5F9', color: jobMatchCompleted ? '#16A34A' : '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Target size={22} />
            </div>
          </div>
          <div className="progress-bar" style={{ marginBottom: '0.75rem' }}>
            <div className="progress-fill" style={{ width: `${jobMatchCompleted ? jobMatchScore : 0}%`, background: jobMatchCompleted ? '#16A34A' : '#CBD5E1' }}></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: jobMatchCompleted ? '#16A34A' : '#64748B', fontWeight: jobMatchCompleted ? '700' : '400' }}>
              {jobMatchCompleted ? '✓ Job Fit Calculated' : 'Pending Job Analysis'}
            </span>
            <button className="btn btn-outline btn-sm" onClick={() => onNavigate('job')}>
              {jobMatchCompleted ? 'View Fit' : 'Analyze Fit'}
            </button>
          </div>
        </div>

        {/* Aptitude Readiness Card */}
        <div className="card card-hover">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <p style={{ fontSize: '0.85rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>APTITUDE READINESS</p>
              <h2 style={{ fontSize: '2.2rem', color: aptitudeCompleted ? '#1E3A5F' : '#94A3B8', marginTop: '0.2rem' }}>
                {aptitudeCompleted ? aptitudeScore : 0}<span style={{ fontSize: '1.1rem', color: '#94A3B8' }}>/100</span>
              </h2>
            </div>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: aptitudeCompleted ? '#DCFCE7' : '#F1F5F9', color: aptitudeCompleted ? '#15803D' : '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={22} />
            </div>
          </div>
          <div style={{ marginBottom: '0.75rem' }}>
            <span className={`badge ${aptitudeCompleted ? 'badge-success' : 'badge-neutral'}`} style={{ fontSize: '0.775rem' }}>
              {aptitudeCompleted ? (aptitudeScore >= 80 ? 'Excellent' : 'Good Performance') : 'Not Attempted'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
              {aptitudeCompleted ? `Last: ${lastAptitudeDate || 'Recently'} (Best: ${bestAptitudeScore}%)` : 'No test completed yet'}
            </span>
            <button className="btn btn-action btn-sm" onClick={() => onNavigate('aptitude')}>
              {aptitudeCompleted ? 'Retake Test' : 'Take Test'}
            </button>
          </div>
        </div>

        {/* Career Readiness Score */}
        <div className="card card-hover">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <p style={{ fontSize: '0.85rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>CAREER READINESS</p>
              <h2 style={{ fontSize: '2.2rem', color: completedCount > 0 ? '#1E3A5F' : '#94A3B8', marginTop: '0.2rem' }}>
                {completedCount > 0 ? readinessScore : 0}%
              </h2>
            </div>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: completedCount > 0 ? '#EFF6FF' : '#F1F5F9', color: completedCount > 0 ? '#2563EB' : '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={22} />
            </div>
          </div>
          <div style={{ marginBottom: '0.75rem' }}>
            <span className={`badge ${completedCount > 0 ? 'badge-primary' : 'badge-neutral'}`} style={{ fontSize: '0.775rem' }}>
              {readinessCategory}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
              {completedCount > 0 ? `${completedCount} of 4 modules evaluated` : 'Complete modules to evaluate'}
            </span>
            <button className="btn btn-outline btn-sm" onClick={() => onNavigate('setup')}>
              {completedCount > 0 ? 'Practice' : 'Get Started'}
            </button>
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

          {/* Interview Performance Graph (Score Improvement Over Time) */}
          <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <strong style={{ fontSize: '0.95rem', color: '#1E3A5F', display: 'block' }}>Interview Progress</strong>
                <span style={{ fontSize: '0.775rem', color: '#64748B' }}>Score growth across consecutive mock interview attempts</span>
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#16A34A', background: '#F0FDF4', padding: '0.25rem 0.65rem', borderRadius: '9999px' }}>
                +29% Growth 📈
              </span>
            </div>

            {/* Performance Graph Trend Lines */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>
              {[
                { score: '60%', line: '──●', label: 'Session #1 - Fundamentals & OOP', color: '#64748B' },
                { score: '70%', line: '─────●', label: 'Session #2 - Technical & Web Dev', color: '#0284C7' },
                { score: '75%', line: '─────────●', label: 'Session #3 - Project Architecture', color: '#2563EB' },
                { score: '82%', line: '─────────────●', label: 'Session #4 - REST API & SQL Schema', color: '#7C3AED' },
                { score: '89%', line: '─────────────────●', label: 'Session #5 - Placement Project Defense', color: '#16A34A' }
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <span style={{ fontWeight: '800', color: item.color, minWidth: '42px' }}>
                    {item.score}
                  </span>
                  <span style={{ color: item.color, fontWeight: '700', letterSpacing: '-1px' }}>
                    {item.line}
                  </span>
                  <span style={{ fontSize: '0.775rem', fontFamily: 'var(--font-main)', color: '#475569', fontWeight: '600' }}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

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
