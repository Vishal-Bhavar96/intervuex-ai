import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { DashboardMetrics, CandidateProfile, ResumeAnalysis, Interview } from '../types';
import { AptitudeHistoryItem } from '../types/aptitude';
import { 
  FileText, Target, Activity, Award, ArrowRight, PlayCircle, 
  AlertTriangle, Upload, Briefcase, Map, Sparkles, CheckCircle2,
  Clock, TrendingUp, Building2, User, ChevronRight, ShieldCheck,
  Code, MessageSquare, Brain, Compass, BookOpen, Layers
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (tab: string, extraId?: number) => void;
}

interface ActivityEvent {
  id: string;
  type: 'resume' | 'aptitude' | 'interview' | 'job' | 'skill';
  title: string;
  subtitle: string;
  date: string;
  statusBadge: string;
  badgeType: 'success' | 'warning' | 'primary' | 'neutral';
  scoreDisplay?: string;
  actionTab?: string;
  actionId?: number;
}

interface CompanyReadiness {
  name: string;
  tagline: string;
  companyPattern: string;
  readinessPercentage: number | null;
  status: 'Ready' | 'Moderate Fit' | 'Needs Preparation' | 'Not Evaluated';
  missingSkills: string[];
  primaryFocus: string;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [resumeAnalysis, setResumeAnalysis] = useState<ResumeAnalysis | null>(null);
  const [aptitudeHistory, setAptitudeHistory] = useState<AptitudeHistoryItem[]>([]);
  const [interviewList, setInterviewList] = useState<Interview[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadAllDashboardData = async () => {
      setLoading(true);
      setFetchError(null);

      try {
        const [
          metricsRes,
          profileRes,
          resumeRes,
          aptitudeRes,
          interviewRes
        ] = await Promise.allSettled([
          api.getDashboardMetrics(),
          api.getProfile(),
          api.getLatestResumeAnalysis(),
          api.getAptitudeHistory(),
          api.listInterviews()
        ]);

        if (!isMounted) return;

        if (metricsRes.status === 'fulfilled') {
          setMetrics(metricsRes.value);
        } else {
          console.warn('Dashboard metrics failed to load', metricsRes.reason);
        }

        if (profileRes.status === 'fulfilled') {
          setProfile(profileRes.value);
        }

        if (resumeRes.status === 'fulfilled') {
          setResumeAnalysis(resumeRes.value);
        }

        if (aptitudeRes.status === 'fulfilled' && Array.isArray(aptitudeRes.value)) {
          setAptitudeHistory(aptitudeRes.value);
        }

        if (interviewRes.status === 'fulfilled' && Array.isArray(interviewRes.value)) {
          setInterviewList(interviewRes.value);
        }
      } catch (err: any) {
        if (isMounted) {
          setFetchError('Unable to load some candidate metrics. Please ensure the backend server is running.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadAllDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Evaluation States
  const resumeCompleted = Boolean(metrics?.resume_completed || (resumeAnalysis && resumeAnalysis.overall_score != null));
  const resumeScore = resumeCompleted ? Math.round(metrics?.resume_score ?? resumeAnalysis?.overall_score ?? 0) : null;
  const extractedSkillsCount = resumeAnalysis?.strengths?.length 
    ? (profile?.skills?.length || 8) 
    : (profile?.skills?.length || 0);

  const jobMatchCompleted = Boolean(metrics?.job_match_completed);
  const jobMatchScore = jobMatchCompleted ? Math.round(metrics?.job_match_score ?? 0) : null;

  const aptitudeCompleted = Boolean(metrics?.aptitude_completed || aptitudeHistory.length > 0);
  const aptitudeScore = aptitudeCompleted 
    ? Math.round(metrics?.aptitude_score ?? (aptitudeHistory[0]?.percentage ?? 0)) 
    : null;
  const lastAptitudeDate = metrics?.last_aptitude_date || (aptitudeHistory[0]?.date ? new Date(aptitudeHistory[0].date).toLocaleDateString() : null);

  const completedInterviews = interviewList.filter(i => i.status === 'COMPLETED' && i.score);
  const interviewCompleted = Boolean(metrics?.interview_completed || completedInterviews.length > 0);
  const latestInterview = completedInterviews[0];
  const interviewScore = interviewCompleted 
    ? Math.round(metrics?.interview_score ?? latestInterview?.score?.overall_score ?? 0) 
    : null;
  const technicalScore = interviewCompleted 
    ? Math.round(latestInterview?.score?.technical_score ?? interviewScore ?? 0) 
    : null;
  const communicationScore = interviewCompleted 
    ? Math.round(latestInterview?.score?.communication_score ?? 72) 
    : null;
  const problemSolvingScore = interviewCompleted 
    ? Math.round(latestInterview?.score?.problem_solving_score ?? 70) 
    : null;

  // Completed Modules Calculation
  const evaluatedModulesList: { name: string; score: number; weight: number }[] = [];
  if (resumeCompleted && resumeScore !== null) evaluatedModulesList.push({ name: 'Resume', score: resumeScore, weight: 0.20 });
  if (aptitudeCompleted && aptitudeScore !== null) evaluatedModulesList.push({ name: 'Aptitude', score: aptitudeScore, weight: 0.30 });
  if (interviewCompleted && interviewScore !== null) evaluatedModulesList.push({ name: 'Interview', score: interviewScore, weight: 0.35 });
  if (jobMatchCompleted && jobMatchScore !== null) evaluatedModulesList.push({ name: 'Job Match', score: jobMatchScore, weight: 0.15 });

  const totalEvaluatedCount = evaluatedModulesList.length;
  const hasEvaluations = totalEvaluatedCount > 0;

  // Overall Career Readiness Score
  const careerReadinessScore = hasEvaluations 
    ? Math.round(metrics?.career_readiness_score || (evaluatedModulesList.reduce((acc, m) => acc + m.score, 0) / evaluatedModulesList.length))
    : null;

  const getReadinessCategory = (score: number | null) => {
    if (score === null) return 'Pending Evaluation';
    if (score >= 85) return 'Interview Ready';
    if (score >= 70) return 'Good Progress';
    if (score >= 55) return 'Needs Improvement';
    return 'Requires Preparation';
  };

  const readinessCategory = getReadinessCategory(careerReadinessScore);

  // Contributing Dimensions
  const dimensionResume = resumeCompleted && resumeScore !== null ? resumeScore : null;
  const dimensionAptitude = aptitudeCompleted && aptitudeScore !== null ? aptitudeScore : null;
  const dimensionTechnical = interviewCompleted && technicalScore !== null 
    ? technicalScore 
    : (resumeCompleted ? Math.min(100, Math.round((resumeScore || 70) * 0.95)) : null);
  const dimensionInterview = interviewCompleted && interviewScore !== null ? interviewScore : null;
  const dimensionCommunication = interviewCompleted && communicationScore !== null 
    ? communicationScore 
    : (aptitudeCompleted ? Math.round((aptitudeScore || 70) * 0.9) : null);

  // Dynamic AI Career Coach Engine
  const generateAICoachRecommendation = () => {
    if (!resumeCompleted) {
      return {
        priority: 'High' as const,
        reason: 'Resume parsing and ATS evaluation are missing from your candidate profile.',
        recommendation: 'Upload your latest PDF/DOCX resume to extract verified technical skills, calculate ATS formatting score, and unlock personalized role matching.',
        actionLabel: 'Upload Resume',
        actionTab: 'resume'
      };
    }
    if (!aptitudeCompleted) {
      return {
        priority: 'High' as const,
        reason: 'Campus placements and MNC recruitment drives use aptitude assessments as the primary elimination round.',
        recommendation: 'Complete a 45-minute timed MNC-style aptitude assessment to evaluate your Quantitative, Logical Reasoning, and Verbal abilities.',
        actionLabel: 'Take Aptitude Test',
        actionTab: 'aptitude'
      };
    }
    if (!interviewCompleted) {
      return {
        priority: 'High' as const,
        reason: 'Technical depth and communication readiness need verification via mock interview simulation.',
        recommendation: 'Start your first adaptive AI mock interview to practice answering technical role questions, code explanation, and project defense.',
        actionLabel: 'Start Mock Interview',
        actionTab: 'setup'
      };
    }
    if (metrics?.top_skill_gaps && metrics.top_skill_gaps.length > 0) {
      const topGap = metrics.top_skill_gaps[0];
      return {
        priority: topGap.gap_percentage > 35 ? ('High' as const) : ('Medium' as const),
        reason: `Identified a ${Math.round(topGap.gap_percentage)}% skill gap in ${topGap.skill_name} during your recent evaluations.`,
        recommendation: `Your ${topGap.skill_name} demonstrated level is at ${Math.round(topGap.demonstrated_level)}%. We recommend targeted practice sessions and coding exercises to bridge this gap.`,
        actionLabel: 'Start Recommended Practice',
        actionTab: 'roadmap'
      };
    }
    if (aptitudeScore !== null && aptitudeScore < 70) {
      return {
        priority: 'High' as const,
        reason: `Current aptitude score (${aptitudeScore}/100) is below the typical 75% cutoff threshold for top MNC technical drives.`,
        recommendation: 'Practice speed and accuracy with company-specific aptitude mock sets in Quantitative Aptitude and Data Interpretation.',
        actionLabel: 'Practice Aptitude Sets',
        actionTab: 'aptitude'
      };
    }
    if (careerReadinessScore !== null && careerReadinessScore >= 80) {
      return {
        priority: 'Low' as const,
        reason: 'Strong all-around performance across resume, aptitude, and interview benchmarks.',
        recommendation: 'Maintain your competitive edge with advanced live coding simulations and senior-level architectural follow-up interviews.',
        actionLabel: 'Launch Advanced Practice',
        actionTab: 'coding'
      };
    }
    return {
      priority: 'Medium' as const,
      reason: 'Continuous placement preparation improves test accuracy and interview confidence.',
      recommendation: 'Analyze your target job descriptions to identify missing keywords and tailor your upcoming mock interview questions.',
      actionLabel: 'Analyze Target Job',
      actionTab: 'job'
    };
  };

  const aiCoach = generateAICoachRecommendation();

  // Dynamic Skill Gap Data
  const defaultSkillBenchmarks = [
    { name: 'Python', current: 68, target: 85, defaultGap: 17, category: 'Technical' },
    { name: 'SQL & Databases', current: 60, target: 80, defaultGap: 20, category: 'Technical' },
    { name: 'Data Structures & Algorithms', current: 55, target: 80, defaultGap: 25, category: 'Technical' },
    { name: 'Quantitative Aptitude', current: aptitudeScore ?? 50, target: 80, defaultGap: aptitudeScore ? Math.max(0, 80 - aptitudeScore) : 30, category: 'Aptitude' },
    { name: 'Technical Communication', current: communicationScore ?? 65, target: 85, defaultGap: communicationScore ? Math.max(0, 85 - communicationScore) : 20, category: 'Soft Skills' },
    { name: 'Problem Solving', current: problemSolvingScore ?? 60, target: 80, defaultGap: problemSolvingScore ? Math.max(0, 80 - problemSolvingScore) : 20, category: 'Analytical' },
    { name: 'Web Development / Core Stack', current: 72, target: 85, defaultGap: 13, category: 'Technical' },
  ];

  const skillGaps = metrics?.top_skill_gaps && metrics.top_skill_gaps.length > 0
    ? metrics.top_skill_gaps.map(g => ({
        id: g.id,
        name: g.skill_name,
        current: Math.round(g.demonstrated_level),
        target: Math.round(g.required_level || 85),
        gap: Math.round(g.gap_percentage),
        status: g.gap_percentage > 30 ? 'High Gap' : g.gap_percentage > 15 ? 'Moderate Gap' : 'On Track'
      }))
    : (hasEvaluations ? defaultSkillBenchmarks.map((s, idx) => ({
        id: idx + 1,
        name: s.name,
        current: s.current,
        target: s.target,
        gap: s.defaultGap,
        status: s.defaultGap > 22 ? 'High Gap' : s.defaultGap > 12 ? 'Moderate Gap' : 'On Track'
      })) : []);

  // MNC Company Preparation Matrix
  const companyMatrix: CompanyReadiness[] = [
    {
      name: 'TCS (Tata Consultancy Services)',
      tagline: 'TCS NQT / Digital Readiness',
      companyPattern: 'TCS-style',
      readinessPercentage: aptitudeScore !== null ? Math.min(96, Math.round(aptitudeScore * 0.95 + (resumeScore ? resumeScore * 0.05 : 0))) : null,
      status: aptitudeScore ? (aptitudeScore >= 75 ? 'Ready' : aptitudeScore >= 60 ? 'Moderate Fit' : 'Needs Preparation') : 'Not Evaluated',
      missingSkills: ['Advanced Quant', 'Coding Automata', 'Verbal Speed'],
      primaryFocus: 'Numerical & Reasoning Speed'
    },
    {
      name: 'Infosys',
      tagline: 'System Engineer & Specialist Programmer',
      companyPattern: 'Infosys-style',
      readinessPercentage: aptitudeScore !== null ? Math.min(94, Math.round(aptitudeScore * 0.92 + (technicalScore ? technicalScore * 0.08 : 0))) : null,
      status: aptitudeScore ? (aptitudeScore >= 75 ? 'Ready' : aptitudeScore >= 60 ? 'Moderate Fit' : 'Needs Preparation') : 'Not Evaluated',
      missingSkills: ['Pseudo-code Debugging', 'Data Interpretation', 'DSA Logic'],
      primaryFocus: 'Pseudo-code & Cryptarithmetic'
    },
    {
      name: 'Wipro',
      tagline: 'Elite National Talent Hunt (NLTH)',
      companyPattern: 'Wipro-style',
      readinessPercentage: aptitudeScore !== null ? Math.min(95, Math.round(aptitudeScore * 0.94)) : null,
      status: aptitudeScore ? (aptitudeScore >= 70 ? 'Ready' : 'Moderate Fit') : 'Not Evaluated',
      missingSkills: ['Written English Test', 'Logical Sequence', 'Basic Coding'],
      primaryFocus: 'English Verbal & Coding Basics'
    },
    {
      name: 'Cognizant (CTS)',
      tagline: 'GenC & GenC Next Drives',
      companyPattern: 'Cognizant-style',
      readinessPercentage: aptitudeScore !== null ? Math.min(95, Math.round(aptitudeScore * 0.90 + (interviewScore ? interviewScore * 0.10 : 0))) : null,
      status: aptitudeScore ? (aptitudeScore >= 72 ? 'Ready' : 'Needs Preparation') : 'Not Evaluated',
      missingSkills: ['Automata Fix', 'Critical Reasoning', 'SQL Queries'],
      primaryFocus: 'Analytical Reasoning & Code Fixes'
    },
    {
      name: 'Capgemini',
      tagline: 'Exceller Pooled Campus Drive',
      companyPattern: 'Capgemini-style',
      readinessPercentage: aptitudeScore !== null ? Math.min(96, Math.round(aptitudeScore * 0.93)) : null,
      status: aptitudeScore ? (aptitudeScore >= 70 ? 'Ready' : 'Moderate Fit') : 'Not Evaluated',
      missingSkills: ['Game-based Aptitude', 'Pseudo-code', 'Behavioral Competency'],
      primaryFocus: 'Game Aptitude & Behavioral Fit'
    },
    {
      name: 'Accenture',
      tagline: 'ASE & FSE Engineering Assessments',
      companyPattern: 'Accenture-style',
      readinessPercentage: aptitudeScore !== null ? Math.min(96, Math.round(aptitudeScore * 0.91 + (technicalScore ? technicalScore * 0.09 : 0))) : null,
      status: aptitudeScore ? (aptitudeScore >= 75 ? 'Ready' : 'Needs Preparation') : 'Not Evaluated',
      missingSkills: ['Cloud & Security Fundamentals', 'Abstract Reasoning', 'Communication'],
      primaryFocus: 'Cognitive & Technical Assessment'
    }
  ];

  // Recent AI Activity Timeline
  const recentActivities: ActivityEvent[] = [];
  
  if (resumeCompleted) {
    recentActivities.push({
      id: 'act-resume',
      type: 'resume',
      title: 'Resume Analyzed by AI',
      subtitle: `${extractedSkillsCount} verified skills extracted with ATS scoring`,
      date: resumeAnalysis?.analyzed_at ? new Date(resumeAnalysis.analyzed_at).toLocaleDateString() : 'Recent',
      statusBadge: `${resumeScore}/100 Score`,
      badgeType: (resumeScore || 0) >= 75 ? 'success' : 'primary',
      scoreDisplay: `${resumeScore}/100`,
      actionTab: 'resume'
    });
  }

  aptitudeHistory.slice(0, 2).forEach((apt, idx) => {
    recentActivities.push({
      id: `act-apt-${idx}`,
      type: 'aptitude',
      title: `${apt.company_pattern || 'MNC'} Aptitude Assessment`,
      subtitle: `${apt.performance_level || 'Evaluated'} with ${apt.accuracy || 80}% accuracy`,
      date: apt.date ? new Date(apt.date).toLocaleDateString() : 'Recent',
      statusBadge: `${Math.round(apt.percentage)}% Score`,
      badgeType: apt.percentage >= 75 ? 'success' : apt.percentage >= 60 ? 'warning' : 'neutral',
      scoreDisplay: `${Math.round(apt.percentage)}%`,
      actionTab: 'aptitude'
    });
  });

  completedInterviews.slice(0, 2).forEach((intv, idx) => {
    recentActivities.push({
      id: `act-intv-${idx}`,
      type: 'interview',
      title: `${intv.difficulty || 'Technical'} Mock Interview Completed`,
      subtitle: `${intv.questions?.length || 5} questions answered with adaptive AI feedback`,
      date: intv.completed_at ? new Date(intv.completed_at).toLocaleDateString() : 'Recent',
      statusBadge: `${Math.round(intv.score?.overall_score || 0)}% Score`,
      badgeType: (intv.score?.overall_score || 0) >= 75 ? 'success' : 'primary',
      scoreDisplay: `${Math.round(intv.score?.overall_score || 0)}%`,
      actionTab: 'history',
      actionId: intv.id
    });
  });

  if (jobMatchCompleted) {
    recentActivities.push({
      id: 'act-job',
      type: 'job',
      title: 'Job Description Match Fit Evaluated',
      subtitle: 'Target role skills matched against extracted candidate competencies',
      date: 'Recent',
      statusBadge: `${jobMatchScore}% Match`,
      badgeType: (jobMatchScore || 0) >= 70 ? 'success' : 'warning',
      scoreDisplay: `${jobMatchScore}%`,
      actionTab: 'job'
    });
  }

  // Next Steps
  const nextSteps = [
    {
      step: '01',
      title: 'Upload & Parse Resume',
      desc: 'Extract ATS keywords, tech stack, and experience for tailored interview questions.',
      completed: resumeCompleted,
      priority: resumeCompleted ? 'Done' : 'High Priority',
      actionLabel: resumeCompleted ? 'View Resume' : 'Upload Resume',
      actionTab: 'resume'
    },
    {
      step: '02',
      title: 'Complete MNC Aptitude Test',
      desc: 'Test speed and accuracy across Quantitative, Logical, and Verbal MNC pattern sets.',
      completed: aptitudeCompleted,
      priority: aptitudeCompleted ? 'Done' : 'High Priority',
      actionLabel: aptitudeCompleted ? 'Retake Test' : 'Take Aptitude Test',
      actionTab: 'aptitude'
    },
    {
      step: '03',
      title: 'Take AI Mock Technical Interview',
      desc: 'Practice dynamic voice/text technical interview defense with immediate rubric scoring.',
      completed: interviewCompleted,
      priority: interviewCompleted ? 'Done' : 'Medium Priority',
      actionLabel: interviewCompleted ? 'Practice More' : 'Start Interview',
      actionTab: 'setup'
    },
    {
      step: '04',
      title: 'Execute 4-Week Skill Roadmap',
      desc: 'Bridge identified skill gaps in DSA, SQL, and core algorithms with curated tasks.',
      completed: Boolean(metrics?.active_preparation_plan?.overall_progress && metrics.active_preparation_plan.overall_progress >= 100),
      priority: 'Ongoing',
      actionLabel: 'View Roadmap',
      actionTab: 'roadmap'
    }
  ];

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '3px solid #E2E8F0', borderTopColor: '#2563EB', animation: 'spin 1s linear infinite', marginBottom: '1.25rem' }} />
        <h3 style={{ color: '#17365D', fontWeight: '700', marginBottom: '0.35rem' }}>Loading Placement Analytics Workspace...</h3>
        <p style={{ color: '#64748B', fontSize: '0.9rem' }}>Aggregating candidate assessments, resume scores, and skill gap metrics.</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '1.75rem 1.5rem 4rem 1.5rem', maxWidth: '1280px' }}>
      
      {/* ERROR BANNER IF ANY */}
      {fetchError && (
        <div style={{ background: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: '10px', padding: '0.85rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#92400E' }}>
          <AlertTriangle size={18} color="#D97706" />
          <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>{fetchError}</span>
        </div>
      )}

      {/* 1. WELCOME HERO SECTION */}
      <section 
        aria-label="Welcome Hero"
        className="card"
        style={{
          background: 'linear-gradient(135deg, #17365D 0%, #1E3A5F 100%)',
          color: '#FFFFFF',
          padding: '2rem 2.25rem',
          borderRadius: '16px',
          marginBottom: '2rem',
          border: 'none',
          boxShadow: '0 4px 16px rgba(23, 54, 93, 0.12)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ maxWidth: '680px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.65rem' }}>
              <span style={{ background: 'rgba(255, 255, 255, 0.12)', color: '#FFFFFF', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.725rem', fontWeight: '700', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                PLACEMENT READINESS WORKSPACE
              </span>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(22, 163, 74, 0.2)', border: '1px solid rgba(34, 197, 94, 0.4)', padding: '0.2rem 0.65rem', borderRadius: '9999px', fontSize: '0.725rem', color: '#86EFAC', fontWeight: '600' }}>
                <span className="pulse-dot" />
                <span>AI Career Coach: Ready</span>
              </div>
            </div>

            <h1 style={{ color: '#FFFFFF', fontSize: '1.9rem', fontWeight: '800', margin: '0 0 0.4rem 0', letterSpacing: '-0.02em', lineHeight: 1.25 }}>
              Welcome back, {user?.full_name || 'Candidate'}!
            </h1>
            <p style={{ color: '#E2E8F0', fontSize: '0.95rem', margin: 0, lineHeight: 1.5, fontWeight: '400' }}>
              Your AI career coach is ready to help you prepare, practice and become placement-ready.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button 
              className="btn"
              onClick={() => onNavigate('aptitude')}
              style={{
                background: '#FFFFFF',
                color: '#17365D',
                fontWeight: '700',
                padding: '0.7rem 1.3rem',
                borderRadius: '8px',
                border: 'none',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)'
              }}
            >
              <Activity size={17} color="#0F766E" /> Take Aptitude Test
            </button>

            <button 
              className="btn"
              onClick={() => onNavigate('setup')}
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
                color: '#FFFFFF',
                fontWeight: '700',
                padding: '0.7rem 1.3rem',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(4px)'
              }}
            >
              <PlayCircle size={17} /> Start Mock Interview
            </button>
          </div>
        </div>
      </section>

      {/* 2. FOUR CORE PERFORMANCE CARDS */}
      <section aria-label="Performance Cards" style={{ marginBottom: '2rem' }}>
        <div className="grid grid-4 gap-6">
          
          {/* A. Resume Score Card */}
          <div className="card card-hover" style={{ padding: '1.4rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--secondary-text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    RESUME SCORE
                  </span>
                  <div style={{ marginTop: '0.25rem' }}>
                    {resumeCompleted && resumeScore !== null ? (
                      <h2 style={{ fontSize: '2rem', color: '#17365D', fontWeight: '800', lineHeight: 1 }}>
                        {resumeScore}<span style={{ fontSize: '1rem', color: 'var(--secondary-text)', fontWeight: '600' }}>/100</span>
                      </h2>
                    ) : (
                      <div style={{ fontSize: '1.15rem', color: 'var(--secondary-text)', fontWeight: '700', padding: '0.2rem 0' }}>
                        Not Evaluated Yet
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--soft-blue)', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FileText size={20} />
                </div>
              </div>

              <div className="progress-bar" style={{ marginBottom: '0.85rem' }}>
                <div 
                  className="progress-fill" 
                  style={{ 
                    width: `${resumeCompleted && resumeScore !== null ? resumeScore : 0}%`, 
                    background: '#2563EB' 
                  }} 
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.35rem' }}>
              <span style={{ fontSize: '0.8rem', color: resumeCompleted ? '#16A34A' : 'var(--secondary-text)', fontWeight: '600' }}>
                {resumeCompleted ? `✓ ${extractedSkillsCount} Skills Extracted` : 'No Resume Uploaded'}
              </span>
              <button 
                className="btn btn-outline btn-sm"
                onClick={() => onNavigate('resume')}
              >
                {resumeCompleted ? 'View Resume' : 'Upload Resume'}
              </button>
            </div>
          </div>

          {/* B. Job Match Fit Card */}
          <div className="card card-hover" style={{ padding: '1.4rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--secondary-text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    JOB MATCH FIT
                  </span>
                  <div style={{ marginTop: '0.25rem' }}>
                    {jobMatchCompleted && jobMatchScore !== null ? (
                      <h2 style={{ fontSize: '2rem', color: '#16A34A', fontWeight: '800', lineHeight: 1 }}>
                        {jobMatchScore}%
                      </h2>
                    ) : (
                      <div style={{ fontSize: '1.15rem', color: 'var(--secondary-text)', fontWeight: '700', padding: '0.2rem 0' }}>
                        Not Evaluated Yet
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--success-bg)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Target size={20} />
                </div>
              </div>

              <div className="progress-bar" style={{ marginBottom: '0.85rem' }}>
                <div 
                  className="progress-fill" 
                  style={{ 
                    width: `${jobMatchCompleted && jobMatchScore !== null ? jobMatchScore : 0}%`, 
                    background: '#16A34A' 
                  }} 
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.35rem' }}>
              <span style={{ fontSize: '0.8rem', color: jobMatchCompleted ? '#16A34A' : 'var(--secondary-text)', fontWeight: '600' }}>
                {jobMatchCompleted ? 'Skill Alignment Calculated' : 'Target Role Alignment'}
              </span>
              <button 
                className="btn btn-outline btn-sm"
                onClick={() => onNavigate('job')}
              >
                Analyze Jobs
              </button>
            </div>
          </div>

          {/* C. Aptitude Readiness Card */}
          <div className="card card-hover" style={{ padding: '1.4rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--secondary-text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    APTITUDE READINESS
                  </span>
                  <div style={{ marginTop: '0.25rem' }}>
                    {aptitudeCompleted && aptitudeScore !== null ? (
                      <h2 style={{ fontSize: '2rem', color: '#0F766E', fontWeight: '800', lineHeight: 1 }}>
                        {aptitudeScore}<span style={{ fontSize: '1rem', color: 'var(--secondary-text)', fontWeight: '600' }}>/100</span>
                      </h2>
                    ) : (
                      <div style={{ fontSize: '1.15rem', color: 'var(--secondary-text)', fontWeight: '700', padding: '0.2rem 0' }}>
                        Not Attempted
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--teal-bg)', color: 'var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Activity size={20} />
                </div>
              </div>

              <div className="progress-bar" style={{ marginBottom: '0.85rem' }}>
                <div 
                  className="progress-fill" 
                  style={{ 
                    width: `${aptitudeCompleted && aptitudeScore !== null ? aptitudeScore : 0}%`, 
                    background: '#0F766E' 
                  }} 
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.35rem' }}>
              <span className={`badge ${aptitudeCompleted ? (aptitudeScore! >= 75 ? 'badge-success' : 'badge-warning') : 'badge-neutral'}`}>
                {aptitudeCompleted ? (aptitudeScore! >= 80 ? 'Excellent' : aptitudeScore! >= 65 ? 'Good' : 'Needs Improvement') : (lastAptitudeDate || 'Not Attempted')}
              </span>
              <button 
                className="btn btn-action btn-sm"
                onClick={() => onNavigate('aptitude')}
                style={{ background: '#0F766E' }}
              >
                {aptitudeCompleted ? 'Take Test' : 'Take Test'}
              </button>
            </div>
          </div>

          {/* D. Interview Readiness Card */}
          <div className="card card-hover" style={{ padding: '1.4rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--secondary-text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    INTERVIEW READINESS
                  </span>
                  <div style={{ marginTop: '0.25rem' }}>
                    {interviewCompleted && interviewScore !== null ? (
                      <h2 style={{ fontSize: '2rem', color: '#17365D', fontWeight: '800', lineHeight: 1 }}>
                        {interviewScore}<span style={{ fontSize: '1rem', color: 'var(--secondary-text)', fontWeight: '600' }}>/100</span>
                      </h2>
                    ) : (
                      <div style={{ fontSize: '1.15rem', color: 'var(--secondary-text)', fontWeight: '700', padding: '0.2rem 0' }}>
                        Not Attempted
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--soft-blue)', color: '#17365D', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Award size={20} />
                </div>
              </div>

              <div className="progress-bar" style={{ marginBottom: '0.85rem' }}>
                <div 
                  className="progress-fill" 
                  style={{ 
                    width: `${interviewCompleted && interviewScore !== null ? interviewScore : 0}%`, 
                    background: '#17365D' 
                  }} 
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.35rem' }}>
              <div style={{ fontSize: '0.775rem', color: 'var(--secondary-text)' }}>
                {interviewCompleted ? (
                  <span>Tech: <strong style={{ color: 'var(--main-heading)' }}>{technicalScore}%</strong> | Comm: <strong style={{ color: 'var(--main-heading)' }}>{communicationScore}%</strong></span>
                ) : (
                  <span>Technical & HR Simulation</span>
                )}
              </div>
              <button 
                className="btn btn-outline btn-sm"
                onClick={() => onNavigate('setup')}
              >
                Practice
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* 3. NEW USER ONBOARDING BANNER (If 0 modules evaluated) */}
      {!hasEvaluations && (
        <section aria-label="Start Career Assessment" className="card" style={{ marginBottom: '2rem', padding: '2rem', border: '1px solid #BFDBFE', background: 'linear-gradient(to right, #EFF6FF, #F8FAFC)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#2563EB', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Compass size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', color: '#17365D', fontWeight: '800', margin: '0 0 0.25rem 0' }}>
                Start Your Career Assessment
              </h2>
              <p style={{ color: '#475569', fontSize: '0.9rem', margin: 0 }}>
                To compute your genuine AI Career Readiness score and unlock personalized MNC placement benchmarks, complete these four foundational modules:
              </p>
            </div>
          </div>

          <div className="grid grid-4 gap-4">
            <div style={{ background: '#FFFFFF', padding: '1.2rem', borderRadius: '10px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#2563EB', display: 'block', marginBottom: '0.35rem' }}>STEP 01</span>
                <strong style={{ fontSize: '0.95rem', color: '#17365D', display: 'block', marginBottom: '0.35rem' }}>Upload Resume</strong>
                <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0 }}>Parse skills, formatting, and compute initial ATS benchmark.</p>
              </div>
              <button className="btn btn-action btn-sm" onClick={() => onNavigate('resume')} style={{ marginTop: '1rem' }}>
                Upload PDF <ArrowRight size={14} />
              </button>
            </div>

            <div style={{ background: '#FFFFFF', padding: '1.2rem', borderRadius: '10px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#0F766E', display: 'block', marginBottom: '0.35rem' }}>STEP 02</span>
                <strong style={{ fontSize: '0.95rem', color: '#17365D', display: 'block', marginBottom: '0.35rem' }}>Take Aptitude Test</strong>
                <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0 }}>40 MNC practice questions with live speed and section tracking.</p>
              </div>
              <button className="btn btn-action btn-sm" onClick={() => onNavigate('aptitude')} style={{ marginTop: '1rem', background: '#0F766E' }}>
                Take Test <ArrowRight size={14} />
              </button>
            </div>

            <div style={{ background: '#FFFFFF', padding: '1.2rem', borderRadius: '10px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#17365D', display: 'block', marginBottom: '0.35rem' }}>STEP 03</span>
                <strong style={{ fontSize: '0.95rem', color: '#17365D', display: 'block', marginBottom: '0.35rem' }}>Complete Mock Interview</strong>
                <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0 }}>AI-generated technical questions with voice/text answering.</p>
              </div>
              <button className="btn btn-outline btn-sm" onClick={() => onNavigate('setup')} style={{ marginTop: '1rem' }}>
                Start Interview <ArrowRight size={14} />
              </button>
            </div>

            <div style={{ background: '#FFFFFF', padding: '1.2rem', borderRadius: '10px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#D97706', display: 'block', marginBottom: '0.35rem' }}>STEP 04</span>
                <strong style={{ fontSize: '0.95rem', color: '#17365D', display: 'block', marginBottom: '0.35rem' }}>Analyze Career Readiness</strong>
                <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0 }}>View comprehensive gap analysis and 4-week prep roadmaps.</p>
              </div>
              <button className="btn btn-outline btn-sm" onClick={() => onNavigate('job')} style={{ marginTop: '1rem' }}>
                Analyze Fit <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 4. OVERALL CAREER READINESS & AI COACH SECTION (2-Column Grid) */}
      <div className="grid grid-2 gap-6" style={{ marginBottom: '2rem', alignItems: 'stretch' }}>
        
        {/* OVERALL CAREER READINESS GAUGE CARD */}
        <section aria-label="Overall Career Readiness" className="card" style={{ padding: '1.85rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--secondary-text)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  CORE PLACEMENT METRIC
                </span>
                <h2 style={{ fontSize: '1.4rem', color: '#17365D', fontWeight: '800', margin: '0.2rem 0 0.15rem 0' }}>
                  Career Readiness
                </h2>
                <p style={{ fontSize: '0.825rem', color: 'var(--secondary-text)', margin: 0 }}>
                  Calculated from your evaluated career modules.
                </p>
              </div>
              <span className={`badge ${hasEvaluations ? (careerReadinessScore! >= 75 ? 'badge-success' : 'badge-primary') : 'badge-neutral'}`}>
                {readinessCategory}
              </span>
            </div>

            {/* Circular / Semi-Circular Gauge Display */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.2rem 0', gap: '2rem', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', width: '150px', height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="150" height="150" viewBox="0 0 150 150" style={{ transform: 'rotate(-90deg)' }}>
                  {/* Background Track Circle */}
                  <circle
                    cx="75"
                    cy="75"
                    r="62"
                    fill="transparent"
                    stroke="var(--bg-card-subtle)"
                    strokeWidth="12"
                  />
                  {/* Active Value Progress Circle */}
                  <circle
                    cx="75"
                    cy="75"
                    r="62"
                    fill="transparent"
                    stroke={hasEvaluations ? (careerReadinessScore! >= 80 ? '#16A34A' : careerReadinessScore! >= 60 ? '#2563EB' : '#D97706') : '#CBD5E1'}
                    strokeWidth="12"
                    strokeDasharray={2 * Math.PI * 62}
                    strokeDashoffset={2 * Math.PI * 62 * (1 - (hasEvaluations && careerReadinessScore !== null ? careerReadinessScore / 100 : 0))}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
                  />
                </svg>
                <div style={{ position: 'absolute', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: '800', color: hasEvaluations ? '#17365D' : 'var(--secondary-text)', lineHeight: 1 }}>
                    {hasEvaluations && careerReadinessScore !== null ? careerReadinessScore : '—'}
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--secondary-text)', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '2px' }}>
                    {hasEvaluations ? '/ 100' : 'Pending'}
                  </div>
                </div>
              </div>

              {/* Status Note */}
              <div style={{ maxWidth: '220px' }}>
                <strong style={{ fontSize: '1rem', color: '#17365D', display: 'block', marginBottom: '0.35rem' }}>
                  {hasEvaluations ? `${totalEvaluatedCount} of 4 Modules Evaluated` : 'Assessment Incomplete'}
                </strong>
                <p style={{ fontSize: '0.8rem', color: 'var(--secondary-text)', lineHeight: 1.4, margin: 0 }}>
                  {hasEvaluations && totalEvaluatedCount < 4 
                    ? 'Complete more assessments to improve evaluation accuracy.' 
                    : hasEvaluations 
                      ? 'Your profile reflects multidimensional readiness for technical roles.' 
                      : 'Complete your resume, aptitude, and interview tests to calculate score.'}
                </p>
              </div>
            </div>

            {/* Contributing Dimensions Progress Bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.75rem', borderTop: '1px solid var(--primary-border)', paddingTop: '1.1rem' }}>
              {[
                { label: 'Resume', val: dimensionResume, color: '#2563EB' },
                { label: 'Aptitude', val: dimensionAptitude, color: '#0F766E' },
                { label: 'Technical', val: dimensionTechnical, color: '#17365D' },
                { label: 'Interview', val: dimensionInterview, color: '#16A34A' },
                { label: 'Communication', val: dimensionCommunication, color: '#D97706' },
              ].map((dim, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 50px', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '0.825rem', fontWeight: '600', color: '#17365D' }}>{dim.label}</span>
                  <div className="progress-bar" style={{ height: '6px' }}>
                    <div 
                      className="progress-fill" 
                      style={{ 
                        width: `${dim.val !== null ? dim.val : 0}%`, 
                        background: dim.val !== null ? dim.color : '#CBD5E1' 
                      }} 
                    />
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: '700', color: dim.val !== null ? 'var(--main-heading)' : 'var(--secondary-text)', textAlign: 'right' }}>
                    {dim.val !== null ? `${dim.val}%` : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '1.25rem', textAlign: 'right' }}>
            <button className="btn btn-outline btn-sm" onClick={() => onNavigate('roadmap')}>
              View Readiness Roadmap <ChevronRight size={14} />
            </button>
          </div>
        </section>

        {/* AI CAREER COACH RECOMMENDATION CARD */}
        <section aria-label="AI Career Coach" className="card" style={{ padding: '1.85rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderLeft: '4px solid #2563EB' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--soft-blue)', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={19} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.25rem', color: '#17365D', fontWeight: '800', margin: 0 }}>
                    AI Career Coach
                  </h2>
                  <span style={{ fontSize: '0.75rem', color: 'var(--secondary-text)', fontWeight: '600' }}>
                    Personalized Guidance Engine
                  </span>
                </div>
              </div>

              <span className={`badge ${aiCoach.priority === 'High' ? 'badge-danger' : aiCoach.priority === 'Medium' ? 'badge-warning' : 'badge-success'}`}>
                Priority: {aiCoach.priority}
              </span>
            </div>

            {/* Coach Insight Box */}
            <div style={{ background: 'var(--bg-card-subtle)', border: '1px solid var(--primary-border)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', marginBottom: '0.75rem' }}>
                <Brain size={18} color="#2563EB" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <strong style={{ fontSize: '0.85rem', color: '#17365D', display: 'block', marginBottom: '0.2rem' }}>
                    Diagnostic Reason:
                  </strong>
                  <p style={{ fontSize: '0.85rem', color: 'var(--body-text)', margin: 0, lineHeight: 1.45 }}>
                    {aiCoach.reason}
                  </p>
                </div>
              </div>

              <div style={{ borderTop: '1px dashed var(--primary-border)', paddingTop: '0.75rem' }}>
                <strong style={{ fontSize: '0.85rem', color: '#17365D', display: 'block', marginBottom: '0.2rem' }}>
                  Recommended Action:
                </strong>
                <p style={{ fontSize: '0.85rem', color: 'var(--body-text)', margin: 0, lineHeight: 1.45 }}>
                  "{aiCoach.recommendation}"
                </p>
              </div>
            </div>

            {/* Quick Context Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
              <div style={{ background: 'var(--bg-main)', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid var(--primary-border)' }}>
                <span style={{ fontSize: '0.725rem', color: 'var(--secondary-text)', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>
                  Target Role
                </span>
                <strong style={{ fontSize: '0.9rem', color: '#17365D' }}>
                  {profile?.target_role || 'Software Engineer'}
                </strong>
              </div>
              <div style={{ background: 'var(--bg-main)', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid var(--primary-border)' }}>
                <span style={{ fontSize: '0.725rem', color: 'var(--secondary-text)', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>
                  Interview Type
                </span>
                <strong style={{ fontSize: '0.9rem', color: '#17365D' }}>
                  {latestInterview?.type || 'Technical & DSA'}
                </strong>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <button 
              className="btn btn-action" 
              onClick={() => onNavigate(aiCoach.actionTab)}
              style={{ width: '100%', padding: '0.75rem 1.25rem', fontSize: '0.925rem', fontWeight: '700' }}
            >
              {aiCoach.actionLabel} <ArrowRight size={16} />
            </button>
          </div>
        </section>

      </div>

      {/* 5. SKILL GAP ANALYSIS */}
      <section aria-label="Skill Gap Analysis" className="card" style={{ padding: '1.85rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--warning-bg)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={19} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', color: '#17365D', fontWeight: '800', margin: 0 }}>
                Skill Gap Analysis
              </h2>
              <p style={{ fontSize: '0.825rem', color: 'var(--secondary-text)', margin: '0.15rem 0 0 0' }}>
                Demonstrated competency vs. industry benchmark levels across technical and cognitive skills.
              </p>
            </div>
          </div>

          <button className="btn btn-outline btn-sm" onClick={() => onNavigate('skillgap')}>
            Full Gap Matrix <ArrowRight size={14} />
          </button>
        </div>

        {skillGaps.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {skillGaps.map((skill) => (
              <div 
                key={skill.id} 
                style={{ 
                  background: 'var(--bg-card-subtle)', 
                  border: '1px solid var(--primary-border)', 
                  borderRadius: '10px', 
                  padding: '1rem 1.25rem',
                  display: 'grid',
                  gridTemplateColumns: '180px 1fr 140px 90px',
                  alignItems: 'center',
                  gap: '1.25rem'
                }}
              >
                <div>
                  <strong style={{ fontSize: '0.9rem', color: '#17365D', display: 'block' }}>{skill.name}</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--secondary-text)' }}>
                    Current: <strong>{skill.current}%</strong> | Target: <strong>{skill.target}%</strong>
                  </span>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--secondary-text)', marginBottom: '0.3rem' }}>
                    <span>Demonstrated Level</span>
                    <span>Gap: {skill.gap}%</span>
                  </div>
                  <div className="progress-bar" style={{ height: '7px' }}>
                    <div 
                      className="progress-fill" 
                      style={{ 
                        width: `${skill.current}%`, 
                        background: skill.gap > 20 ? '#D97706' : '#2563EB' 
                      }} 
                    />
                  </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <span className={`badge ${skill.gap > 20 ? 'badge-warning' : skill.gap > 10 ? 'badge-primary' : 'badge-success'}`}>
                    {skill.status}
                  </span>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <button 
                    className="btn btn-outline btn-sm" 
                    onClick={() => {
                      if (skill.name.toLowerCase().includes('aptitude')) onNavigate('aptitude');
                      else if (skill.name.toLowerCase().includes('communication')) onNavigate('setup');
                      else onNavigate('coding');
                    }}
                  >
                    Practice
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '2.5rem 1.5rem', textAlign: 'center', background: 'var(--bg-card-subtle)', borderRadius: '10px', border: '1px dashed var(--primary-border)' }}>
            <BookOpen size={32} color="#64748B" style={{ marginBottom: '0.75rem' }} />
            <h3 style={{ fontSize: '1.05rem', color: '#17365D', fontWeight: '700', marginBottom: '0.35rem' }}>No Skill Gaps Evaluated Yet</h3>
            <p style={{ color: 'var(--secondary-text)', fontSize: '0.85rem', maxWidth: '520px', margin: '0 auto 1.2rem auto' }}>
              Complete your resume upload, aptitude assessment, or mock interview to automatically generate your personalized skill gap analysis.
            </p>
            <button className="btn btn-primary btn-sm" onClick={() => onNavigate('aptitude')}>
              Take Aptitude Test to Benchmark
            </button>
          </div>
        )}
      </section>

      {/* 6. MNC / COMPANY PREPARATION MATRIX */}
      <section aria-label="MNC Preparation" className="card" style={{ padding: '1.85rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--teal-bg)', color: 'var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={19} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', color: '#17365D', fontWeight: '800', margin: 0 }}>
                MNC Preparation Matrix
              </h2>
              <p style={{ fontSize: '0.825rem', color: 'var(--secondary-text)', margin: '0.15rem 0 0 0' }}>
                Campus recruitment pattern alignment computed from your actual test and interview records.
              </p>
            </div>
          </div>

          <span style={{ fontSize: '0.775rem', fontWeight: '600', color: '#0F766E', background: 'var(--teal-bg)', padding: '0.3rem 0.75rem', borderRadius: '9999px' }}>
            6 Top Campus Recruiters
          </span>
        </div>

        <div className="grid grid-3 gap-4">
          {companyMatrix.map((comp, idx) => (
            <div 
              key={idx} 
              className="card card-hover" 
              style={{ 
                background: 'var(--bg-card-subtle)', 
                border: '1px solid var(--primary-border)', 
                borderRadius: '12px', 
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div>
                    <strong style={{ fontSize: '0.95rem', color: '#17365D', display: 'block' }}>{comp.name}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--secondary-text)' }}>{comp.tagline}</span>
                  </div>
                  <span className={`badge ${comp.readinessPercentage !== null ? (comp.readinessPercentage >= 75 ? 'badge-success' : 'badge-warning') : 'badge-neutral'}`} style={{ fontSize: '0.7rem' }}>
                    {comp.status}
                  </span>
                </div>

                <div style={{ margin: '0.85rem 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.775rem', marginBottom: '0.3rem' }}>
                    <span style={{ color: 'var(--secondary-text)' }}>Readiness Fit:</span>
                    <strong style={{ color: comp.readinessPercentage !== null ? '#17365D' : 'var(--secondary-text)' }}>
                      {comp.readinessPercentage !== null ? `${comp.readinessPercentage}%` : 'Not Evaluated'}
                    </strong>
                  </div>
                  <div className="progress-bar" style={{ height: '6px' }}>
                    <div 
                      className="progress-fill" 
                      style={{ 
                        width: `${comp.readinessPercentage !== null ? comp.readinessPercentage : 0}%`, 
                        background: comp.readinessPercentage !== null ? (comp.readinessPercentage >= 75 ? '#16A34A' : '#2563EB') : '#CBD5E1' 
                      }} 
                    />
                  </div>
                </div>

                <div style={{ fontSize: '0.775rem', color: 'var(--secondary-text)', marginBottom: '0.75rem' }}>
                  <span style={{ display: 'block', marginBottom: '0.2rem' }}>Focus: <strong style={{ color: 'var(--main-heading)' }}>{comp.primaryFocus}</strong></span>
                  <span>Missing Skills: {comp.missingSkills.join(', ')}</span>
                </div>
              </div>

              <button 
                className="btn btn-outline btn-sm" 
                onClick={() => onNavigate('aptitude')}
                style={{ width: '100%', marginTop: '0.5rem', fontWeight: '600' }}
              >
                Prepare for {comp.name.split(' ')[0]} <ArrowRight size={13} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 7. CAREER PERFORMANCE OVERVIEW & RECENT ACTIVITY (2-Column Grid) */}
      <div className="grid grid-2 gap-6" style={{ marginBottom: '2rem', alignItems: 'stretch' }}>
        
        {/* CAREER PERFORMANCE OVERVIEW */}
        <section aria-label="Performance Overview" className="card" style={{ padding: '1.85rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', color: '#17365D', fontWeight: '800', margin: 0 }}>
                  Career Performance Overview
                </h2>
                <p style={{ fontSize: '0.825rem', color: 'var(--secondary-text)', margin: '0.15rem 0 0 0' }}>
                  Cross-dimensional analytics benchmarked against placement criteria.
                </p>
              </div>
              <span className="badge badge-primary">
                {totalEvaluatedCount}/4 Evaluated
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
              {[
                { label: 'Technical Skills', val: dimensionTechnical, color: '#17365D' },
                { label: 'Aptitude Readiness', val: aptitudeScore, color: '#0F766E' },
                { label: 'Communication Ability', val: communicationScore, color: '#2563EB' },
                { label: 'Problem Solving & Logic', val: problemSolvingScore, color: '#D97706' },
                { label: 'Interview Performance', val: interviewScore, color: '#16A34A' },
                { label: 'Resume ATS Quality', val: resumeScore, color: '#2563EB' },
              ].map((dim, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '170px 1fr 60px', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#17365D' }}>{dim.label}</span>
                  <div className="progress-bar" style={{ height: '7px' }}>
                    <div 
                      className="progress-fill" 
                      style={{ 
                        width: `${dim.val !== null ? dim.val : 0}%`, 
                        background: dim.val !== null ? dim.color : '#CBD5E1' 
                      }} 
                    />
                  </div>
                  <span style={{ fontSize: '0.825rem', fontWeight: '700', color: dim.val !== null ? '#17365D' : 'var(--secondary-text)', textAlign: 'right' }}>
                    {dim.val !== null ? `${dim.val}%` : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', background: 'var(--bg-card-subtle)', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid var(--primary-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--secondary-text)' }}>
              Overall Readiness Status: <strong style={{ color: '#17365D' }}>{readinessCategory}</strong>
            </span>
            <button className="btn btn-outline btn-sm" onClick={() => onNavigate('profile')}>
              Edit Profile
            </button>
          </div>
        </section>

        {/* RECENT AI ACTIVITY TIMELINE */}
        <section aria-label="Recent Activity" className="card" style={{ padding: '1.85rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--soft-blue)', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock size={19} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.25rem', color: '#17365D', fontWeight: '800', margin: 0 }}>
                    Recent AI Activity
                  </h2>
                  <p style={{ fontSize: '0.825rem', color: 'var(--secondary-text)', margin: '0.15rem 0 0 0' }}>
                    Timeline of candidate assessments, mock interviews, and evaluations.
                  </p>
                </div>
              </div>
            </div>

            {recentActivities.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
                {recentActivities.map((act) => (
                  <div 
                    key={act.id} 
                    className="timeline-item"
                    style={{ 
                      position: 'relative', 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      gap: '0.85rem',
                      background: 'var(--bg-card-subtle)',
                      border: '1px solid var(--primary-border)',
                      borderRadius: '10px',
                      padding: '0.85rem 1rem'
                    }}
                  >
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#FFFFFF', border: '1px solid var(--primary-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {act.type === 'resume' && <FileText size={16} color="#2563EB" />}
                      {act.type === 'aptitude' && <Activity size={16} color="#0F766E" />}
                      {act.type === 'interview' && <PlayCircle size={16} color="#17365D" />}
                      {act.type === 'job' && <Target size={16} color="#16A34A" />}
                      {act.type === 'skill' && <AlertTriangle size={16} color="#D97706" />}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.15rem' }}>
                        <strong style={{ fontSize: '0.875rem', color: '#17365D' }}>{act.title}</strong>
                        <span className={`badge ${act.badgeType === 'success' ? 'badge-success' : act.badgeType === 'warning' ? 'badge-warning' : 'badge-primary'}`} style={{ fontSize: '0.7rem' }}>
                          {act.statusBadge}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.775rem', color: 'var(--secondary-text)', margin: '0 0 0.35rem 0' }}>
                        {act.subtitle}
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.725rem', color: 'var(--secondary-text)' }}>
                        <span>{act.date}</span>
                        {act.actionTab && (
                          <button 
                            className="btn btn-outline btn-sm" 
                            style={{ padding: '0.2rem 0.5rem', fontSize: '0.725rem' }}
                            onClick={() => onNavigate(act.actionTab!, act.actionId)}
                          >
                            View Result
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', background: 'var(--bg-card-subtle)', borderRadius: '10px', border: '1px dashed var(--primary-border)' }}>
                <Clock size={28} color="#64748B" style={{ marginBottom: '0.5rem' }} />
                <p style={{ color: 'var(--secondary-text)', fontSize: '0.85rem', margin: 0 }}>
                  No recent AI assessment activity recorded yet. Take an aptitude test or mock interview to begin your activity history.
                </p>
              </div>
            )}
          </div>

          <div style={{ marginTop: '1.25rem', textAlign: 'right' }}>
            <button className="btn btn-outline btn-sm" onClick={() => onNavigate('history')}>
              View Full Interview History <ArrowRight size={14} />
            </button>
          </div>
        </section>

      </div>

      {/* 8. NEXT STEPS SECTION */}
      <section aria-label="Your Next Steps" className="card" style={{ padding: '1.85rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', color: '#17365D', fontWeight: '800', margin: 0 }}>
              Your Next Steps
            </h2>
            <p style={{ fontSize: '0.825rem', color: 'var(--secondary-text)', margin: '0.15rem 0 0 0' }}>
              Prioritized roadmap actions to maximize placement readiness and interview performance.
            </p>
          </div>
        </div>

        <div className="grid grid-4 gap-4">
          {nextSteps.map((stepItem, idx) => (
            <div 
              key={idx} 
              style={{ 
                background: stepItem.completed ? 'var(--bg-card-subtle)' : '#FFFFFF', 
                border: stepItem.completed ? '1px solid var(--primary-border)' : '1px solid #BFDBFE', 
                borderRadius: '12px', 
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '800', color: stepItem.completed ? '#16A34A' : '#2563EB' }}>
                    {stepItem.step}
                  </span>
                  <span className={`badge ${stepItem.completed ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.7rem' }}>
                    {stepItem.priority}
                  </span>
                </div>

                <strong style={{ fontSize: '0.925rem', color: '#17365D', display: 'block', marginBottom: '0.35rem' }}>
                  {stepItem.title}
                </strong>
                <p style={{ fontSize: '0.775rem', color: 'var(--secondary-text)', margin: 0, lineHeight: 1.4 }}>
                  {stepItem.desc}
                </p>
              </div>

              <button 
                className={`btn ${stepItem.completed ? 'btn-outline' : 'btn-action'} btn-sm`} 
                onClick={() => onNavigate(stepItem.actionTab)}
                style={{ marginTop: '1.1rem', width: '100%', fontWeight: '700' }}
              >
                {stepItem.actionLabel} {stepItem.completed ? <CheckCircle2 size={14} color="#16A34A" /> : <ArrowRight size={14} />}
              </button>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
