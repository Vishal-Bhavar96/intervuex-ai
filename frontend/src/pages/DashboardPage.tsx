import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { DashboardMetrics } from '../types';
import { 
  FileText, Target, Activity, Award, ArrowRight, PlayCircle, 
  AlertTriangle, Upload, Briefcase, Map, Sparkles, CheckCircle
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (tab: string, extraId?: number) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await api.getDashboardMetrics();
        setMetrics(data);
      } catch (e) {
        console.error('Failed to load candidate metrics', e);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center', color: '#64748B' }}>
        Loading your IntervueX candidate workspace...
      </div>
    );
  }

  // Dynamic Parameter Calculations
  const resumeCompleted = Boolean(metrics?.resume_completed);
  const resumeScore = resumeCompleted ? (metrics?.resume_score ?? 0) : 0;

  const jobMatchCompleted = Boolean(metrics?.job_match_completed);
  const jobMatchScore = jobMatchCompleted ? (metrics?.job_match_score ?? 0) : 0;

  const aptitudeCompleted = Boolean(metrics?.aptitude_completed);
  const aptitudeScore = aptitudeCompleted ? (metrics?.aptitude_score ?? 0) : 0;

  const interviewCompleted = Boolean(metrics?.interview_completed);
  const interviewScore = interviewCompleted ? (metrics?.interview_score ?? 0) : 0;

  const completedCount = metrics?.completed_parameters_count ?? 0;
  const readinessScore = completedCount > 0 ? (metrics?.career_readiness_score ?? 0) : 0;
  const readinessCategory = completedCount > 0 ? (metrics?.readiness_category || 'Good Performance') : 'Pending Evaluation';

  const lastAptitudeDate = metrics?.last_aptitude_date;
  const bestAptitudeScore = metrics?.best_aptitude_score ?? 0;

  return (
    <div className="container" style={{ padding: '2rem 1.5rem 4rem 1.5rem' }}>
      
      {/* 1. HERO / WELCOME SECTION (Section 3: Solid Navy #1E3A5F) */}
      <div 
        className="card" 
        style={{ 
          background: '#1E3A5F', 
          color: '#FFFFFF', 
          padding: '2rem 2.25rem', 
          borderRadius: '16px', 
          marginBottom: '2rem',
          border: 'none',
          boxShadow: '0 4px 12px rgba(30, 58, 95, 0.15)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <span style={{ background: 'rgba(255, 255, 255, 0.12)', color: '#FFFFFF', padding: '0.35rem 0.85rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'inline-block', marginBottom: '0.75rem' }}>
              CANDIDATE WORKSPACE
            </span>
            <h1 style={{ color: '#FFFFFF', fontSize: '2rem', fontWeight: '800', marginTop: 0, marginBottom: '0.4rem' }}>
              Welcome back, {user?.full_name || 'Candidate'}!
            </h1>
            <p style={{ color: '#DCE6F2', fontSize: '0.95rem', maxWidth: '620px', lineHeight: 1.5 }}>
              Your AI career coach is ready. Prepare for realistic MNC-style aptitude assessments, technical interviews, and career readiness.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
            <button 
              onClick={() => onNavigate('aptitude')} 
              style={{ background: '#FFFFFF', color: '#1E3A5F', border: 'none', fontWeight: '700', padding: '0.75rem 1.4rem', borderRadius: '8px', fontSize: '0.9rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', transition: 'background 0.15s' }}
              onMouseOver={(e) => (e.currentTarget.style.background = '#F8FAFC')}
              onMouseOut={(e) => (e.currentTarget.style.background = '#FFFFFF')}
            >
              <Activity size={18} /> Take Aptitude Test
            </button>

            <button 
              onClick={() => onNavigate('setup')} 
              style={{ background: 'transparent', border: '1px solid #93A4BA', color: '#FFFFFF', fontWeight: '700', padding: '0.75rem 1.4rem', borderRadius: '8px', fontSize: '0.9rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', transition: 'background 0.15s' }}
              onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
              onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <PlayCircle size={18} /> Mock Interview
            </button>
          </div>
        </div>
      </div>

      {/* 2. KPI DASHBOARD CARDS (Sections 4 - 8) */}
      <div className="grid grid-4 gap-6" style={{ marginBottom: '2rem' }}>
        
        {/* Resume Score Card (Section 5: Accent #2563EB) */}
        <div className="card card-hover" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.4rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
            <div>
              <p style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>RESUME SCORE</p>
              <h2 style={{ fontSize: '2.1rem', color: resumeCompleted ? '#1E3A5F' : '#94A3B8', fontWeight: '800', marginTop: '0.2rem' }}>
                {resumeCompleted ? resumeScore : 0}<span style={{ fontSize: '1rem', color: '#94A3B8', fontWeight: '600' }}>/100</span>
              </h2>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={20} />
            </div>
          </div>
          
          <div className="progress-bar" style={{ marginBottom: '0.75rem' }}>
            <div className="progress-fill" style={{ width: `${resumeCompleted ? resumeScore : 0}%`, background: '#2563EB' }}></div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: resumeCompleted ? '#15803D' : '#64748B', fontWeight: resumeCompleted ? '700' : '500' }}>
              {resumeCompleted ? '✓ Resume Analyzed' : 'Extracted Skills'}
            </span>
            <button className="btn btn-outline btn-sm" onClick={() => onNavigate('resume')}>
              {resumeCompleted ? 'View' : 'Upload'}
            </button>
          </div>
        </div>

        {/* Job Match Fit Card (Section 6: Accent #15803D) */}
        <div className="card card-hover" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.4rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
            <div>
              <p style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>JOB MATCH FIT</p>
              <h2 style={{ fontSize: '2.1rem', color: jobMatchCompleted ? '#166534' : '#94A3B8', fontWeight: '800', marginTop: '0.2rem' }}>
                {jobMatchCompleted ? jobMatchScore : 0}%
              </h2>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#F0FDF4', color: '#15803D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Target size={20} />
            </div>
          </div>

          <div className="progress-bar" style={{ marginBottom: '0.75rem' }}>
            <div className="progress-fill" style={{ width: `${jobMatchCompleted ? jobMatchScore : 0}%`, background: '#16A34A' }}></div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: jobMatchCompleted ? '#15803D' : '#64748B', fontWeight: jobMatchCompleted ? '700' : '500' }}>
              {jobMatchCompleted ? '✓ Job Fit Calculated' : 'Skill Alignment'}
            </span>
            <button className="btn btn-outline btn-sm" onClick={() => onNavigate('job')}>
              {jobMatchCompleted ? 'View Fit' : 'Analyze'}
            </button>
          </div>
        </div>

        {/* Aptitude Readiness Card (Section 7: Teal Accent #0F766E) */}
        <div className="card card-hover" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.4rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
            <div>
              <p style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>APTITUDE READINESS</p>
              <h2 style={{ fontSize: '2.1rem', color: aptitudeCompleted ? '#0F766E' : '#94A3B8', fontWeight: '800', marginTop: '0.2rem' }}>
                {aptitudeCompleted ? aptitudeScore : 0}<span style={{ fontSize: '1rem', color: '#94A3B8', fontWeight: '600' }}>/100</span>
              </h2>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#F0FDFA', color: '#0F766E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={20} />
            </div>
          </div>

          <div className="progress-bar" style={{ marginBottom: '0.75rem' }}>
            <div className="progress-fill" style={{ width: `${aptitudeCompleted ? aptitudeScore : 0}%`, background: '#0D9488' }}></div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className={`badge ${aptitudeCompleted ? 'badge-success' : 'badge-neutral'}`} style={{ fontSize: '0.75rem' }}>
              {aptitudeCompleted ? (aptitudeScore >= 80 ? 'Excellent' : 'Good Performance') : 'Not Attempted'}
            </span>
            <button className="btn btn-action btn-sm" onClick={() => onNavigate('aptitude')} style={{ background: '#0F766E' }}>
              {aptitudeCompleted ? 'Retake Test' : 'Take Test'}
            </button>
          </div>
        </div>

        {/* Career Readiness Card (Section 8: Navy Accent #1E3A5F) */}
        <div className="card card-hover" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.4rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
            <div>
              <p style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>CAREER READINESS</p>
              <h2 style={{ fontSize: '2.1rem', color: completedCount > 0 ? '#1E3A5F' : '#94A3B8', fontWeight: '800', marginTop: '0.2rem' }}>
                {completedCount > 0 ? readinessScore : 0}%
              </h2>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={20} />
            </div>
          </div>

          <div className="progress-bar" style={{ marginBottom: '0.75rem' }}>
            <div className="progress-fill" style={{ width: `${completedCount > 0 ? readinessScore : 0}%`, background: '#1E3A5F' }}></div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className={`badge ${completedCount > 0 ? 'badge-primary' : 'badge-neutral'}`} style={{ fontSize: '0.75rem' }}>
              {readinessCategory}
            </span>
            <button className="btn btn-outline btn-sm" onClick={() => onNavigate('setup')}>
              Practice
            </button>
          </div>
        </div>

      </div>

      {/* 3. CAREER PERFORMANCE OVERVIEW (Section 14) */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', color: '#0F172A', fontWeight: '700' }}>Career Performance Overview</h3>
            <p style={{ color: '#64748B', fontSize: '0.85rem', marginTop: '0.15rem' }}>Visual comparison of candidate evaluation scores across core career dimensions.</p>
          </div>
          <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#15803D', background: '#F0FDF4', padding: '0.3rem 0.75rem', borderRadius: '9999px' }}>
            {completedCount} of 4 Modules Evaluated
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { label: 'Resume Score', val: resumeScore, max: 100, color: '#2563EB', isDone: resumeCompleted },
            { label: 'Job Match Fit', val: jobMatchScore, max: 100, color: '#15803D', isDone: jobMatchCompleted },
            { label: 'Aptitude Assessment', val: aptitudeScore, max: 100, color: '#0F766E', isDone: aptitudeCompleted },
            { label: 'Technical Mock Interview', val: interviewScore, max: 100, color: '#1E3A5F', isDone: interviewCompleted },
            { label: 'Combined Career Readiness', val: readinessScore, max: 100, color: '#2563EB', isDone: completedCount > 0 }
          ].map((item, idx) => (
            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '180px 1fr 60px', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1E3A5F' }}>{item.label}</span>
              <div className="progress-bar" style={{ height: '8px' }}>
                <div className="progress-fill" style={{ width: `${item.isDone ? item.val : 0}%`, background: item.color }}></div>
              </div>
              <span style={{ fontSize: '0.875rem', fontWeight: '700', color: item.isDone ? '#0F172A' : '#94A3B8', textAlign: 'right' }}>
                {item.isDone ? `${item.val}%` : 'Pending'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. IDENTIFIED SKILL GAPS & WEAK AREAS */}
      <div style={{ marginBottom: '2rem' }}>
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--warning-bg)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={19} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--main-heading)', margin: 0 }}>Identified Skill Gaps & Weak Areas</h3>
                <p style={{ fontSize: '0.825rem', color: 'var(--secondary-text)', margin: '0.15rem 0 0 0' }}>Automated gap analysis generated from candidate assessments & resume evaluations.</p>
              </div>
            </div>
            {metrics?.top_skill_gaps && metrics.top_skill_gaps.length > 0 && (
              <button className="btn btn-outline btn-sm" onClick={() => onNavigate('roadmap')}>
                View 4-Week Roadmap <ArrowRight size={14} />
              </button>
            )}
          </div>

          {metrics?.top_skill_gaps && metrics.top_skill_gaps.length > 0 ? (
            <div className="grid grid-2 gap-4">
              {metrics.top_skill_gaps.map((gap) => (
                <div key={gap.id} style={{ background: 'var(--bg-card-subtle)', padding: '1rem 1.2rem', borderRadius: '10px', border: '1px solid var(--primary-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.4rem' }}>
                    <strong style={{ color: 'var(--main-heading)' }}>{gap.skill_name}</strong>
                    <span className="badge badge-warning" style={{ fontSize: '0.725rem' }}>
                      Gap: {gap.gap_percentage.toFixed(0)}%
                    </span>
                  </div>
                  <div className="progress-bar" style={{ height: '6px' }}>
                    <div className="progress-fill" style={{ width: `${gap.demonstrated_level}%`, background: '#B45309' }}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '1.75rem', background: 'var(--bg-card-subtle)', borderRadius: '10px', color: 'var(--secondary-text)', fontSize: '0.875rem', textAlign: 'center', border: '1px dashed var(--primary-border)' }}>
              Complete an aptitude test, resume analysis, or mock interview to generate automated skill gap analysis and weak area identification.
            </div>
          )}
        </div>
      </div>

      {/* 5. CAREER READINESS BREAKDOWN (Section 15) */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1.75rem' }}>
        <h3 style={{ fontSize: '1.15rem', color: '#0F172A', marginBottom: '1.25rem', fontWeight: '700' }}>
          Career Readiness Breakdown
        </h3>

        <div className="grid grid-4 gap-6">
          {[
            { label: 'Resume Strength', val: resumeCompleted ? resumeScore : 0, color: '#2563EB', isDone: resumeCompleted },
            { label: 'Aptitude Performance', val: aptitudeCompleted ? aptitudeScore : 0, color: '#0F766E', isDone: aptitudeCompleted },
            { label: 'Technical Interview', val: interviewCompleted ? interviewScore : 0, color: '#15803D', isDone: interviewCompleted },
            { label: 'Job Alignment', val: jobMatchCompleted ? jobMatchScore : 0, color: '#1E3A5F', isDone: jobMatchCompleted }
          ].map((item, idx) => (
            <div key={idx} style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748B', marginBottom: '0.4rem' }}>{item.label}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: item.isDone ? '#0F172A' : '#94A3B8', marginBottom: '0.5rem' }}>
                {item.isDone ? `${item.val}%` : 'Pending'}
              </div>
              <div className="progress-bar" style={{ height: '5px' }}>
                <div className="progress-fill" style={{ width: `${item.isDone ? item.val : 0}%`, background: item.color }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. QUICK ACTIONS (Section 16) */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.15rem', color: '#0F172A', marginBottom: '1rem', fontWeight: '700' }}>Quick Actions</h3>

        <div className="grid grid-4 gap-4">
          <div 
            onClick={() => onNavigate('resume')}
            className="card card-hover" 
            style={{ padding: '1.1rem', cursor: 'pointer', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
          >
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Upload size={18} />
            </div>
            <div>
              <strong style={{ fontSize: '0.875rem', color: '#0F172A', display: 'block' }}>Upload / Analyze Resume</strong>
              <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Extract ATS skills</span>
            </div>
          </div>

          <div 
            onClick={() => onNavigate('aptitude')}
            className="card card-hover" 
            style={{ padding: '1.1rem', cursor: 'pointer', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
          >
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#F0FDFA', color: '#0F766E', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Activity size={18} />
            </div>
            <div>
              <strong style={{ fontSize: '0.875rem', color: '#0F172A', display: 'block' }}>Take Aptitude Test</strong>
              <span style={{ fontSize: '0.75rem', color: '#64748B' }}>MNC assessment test</span>
            </div>
          </div>

          <div 
            onClick={() => onNavigate('setup')}
            className="card card-hover" 
            style={{ padding: '1.1rem', cursor: 'pointer', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
          >
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#F0FDF4', color: '#15803D', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <PlayCircle size={18} />
            </div>
            <div>
              <strong style={{ fontSize: '0.875rem', color: '#0F172A', display: 'block' }}>Start Mock Interview</strong>
              <span style={{ fontSize: '0.75rem', color: '#64748B' }}>AI live interview</span>
            </div>
          </div>

          <div 
            onClick={() => onNavigate('job')}
            className="card card-hover" 
            style={{ padding: '1.1rem', cursor: 'pointer', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
          >
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#EFF6FF', color: '#1E3A5F', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Target size={18} />
            </div>
            <div>
              <strong style={{ fontSize: '0.875rem', color: '#0F172A', display: 'block' }}>Analyze Job Fit</strong>
              <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Match target roles</span>
            </div>
          </div>
        </div>
      </div>

      {/* 7. AI CAREER INSIGHT (Section 17) */}
      <div 
        style={{ 
          background: '#EFF6FF', 
          border: '1px solid #DBEAFE', 
          borderRadius: '12px', 
          padding: '1.25rem 1.5rem', 
          display: 'flex', 
          alignItems: 'flex-start', 
          gap: '1rem' 
        }}
      >
        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#FFFFFF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 1px 3px rgba(37, 99, 235, 0.1)' }}>
          <Sparkles size={20} />
        </div>
        <div>
          <strong style={{ fontSize: '0.95rem', color: '#1E3A5F', display: 'block', marginBottom: '0.2rem' }}>AI Career Insight</strong>
          <p style={{ color: '#475569', fontSize: '0.875rem', margin: 0, lineHeight: 1.5 }}>
            "Your technical interview performance is strong, but your verbal ability and SQL scores need improvement. Complete the recommended practice modules before your next mock interview."
          </p>
        </div>
      </div>

    </div>
  );
};
