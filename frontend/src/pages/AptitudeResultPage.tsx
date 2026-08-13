import React, { useState } from 'react';
import { AptitudeResult } from '../types/aptitude';
import { 
  CheckCircle2, AlertTriangle, Award, Clock, ArrowRight, RefreshCw, 
  ChevronDown, ChevronUp, BookOpen, Target, Sparkles, Home
} from 'lucide-react';

interface AptitudeResultPageProps {
  result: AptitudeResult;
  onRetake: () => void;
  onBackToDashboard: () => void;
}

export const AptitudeResultPage: React.FC<AptitudeResultPageProps> = ({
  result,
  onRetake,
  onBackToDashboard,
}) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'REVIEW'>('OVERVIEW');
  const [expandedQuestionId, setExpandedQuestionId] = useState<number | null>(null);

  const getPerformanceBadgeColor = (level: string) => {
    switch (level) {
      case 'Excellent': return 'badge-success';
      case 'Strong': return 'badge-primary';
      case 'Good': return 'badge-info';
      case 'Needs Improvement': return 'badge-warning';
      default: return 'badge-danger';
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', maxWidth: '1050px' }}>
      
      {/* HEADER BANNER */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #1E3A5F 0%, #1D4ED8 100%)', color: '#FFFFFF', padding: '2.5rem', borderRadius: '16px', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
              <span className="badge badge-success" style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem' }}>
                Assessment Completed ✓
              </span>
              <span style={{ color: '#BFDBFE', fontSize: '0.85rem' }}>
                {result.company_pattern} ({result.difficulty_mode})
              </span>
            </div>
            <h1 style={{ color: '#FFFFFF', marginTop: '0.35rem', marginBottom: '0.35rem', fontSize: '2.25rem', fontWeight: '800' }}>
              Aptitude Score Breakdown
            </h1>
            <p style={{ color: '#93C5FD', fontSize: '0.975rem' }}>
              Candidate: <strong>{result.candidate_name}</strong> • Completed on {new Date(result.submitted_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>

          {/* Big Aptitude Score Card */}
          <div style={{ background: 'rgba(255, 255, 255, 0.12)', border: '1px solid rgba(255, 255, 255, 0.25)', padding: '1.25rem 2rem', borderRadius: '14px', textAlign: 'center', backdropFilter: 'blur(4px)' }}>
            <span style={{ fontSize: '0.75rem', color: '#BFDBFE', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '800', display: 'block' }}>
              APTITUDE SCORE
            </span>
            <div style={{ fontSize: '3rem', fontWeight: '900', color: '#FFFFFF', lineHeight: '1.1', margin: '0.2rem 0' }}>
              {result.percentage.toFixed(0)}<span style={{ fontSize: '1.5rem', color: '#BFDBFE' }}>%</span>
            </div>
            <span className={`badge ${getPerformanceBadgeColor(result.performance_level)}`} style={{ fontSize: '0.85rem' }}>
              {result.performance_level} Performance
            </span>
          </div>
        </div>
      </div>

      {/* METRIC HIGHLIGHTS CARDS */}
      <div className="grid grid-4 gap-4" style={{ marginBottom: '2.5rem' }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>OVERALL SCORE</span>
          <h3 style={{ fontSize: '1.8rem', color: '#1E3A5F', marginTop: '0.2rem' }}>{result.total_score} <span style={{ fontSize: '1rem', color: '#94A3B8' }}>/ {result.max_possible_score}</span></h3>
        </div>
        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>ACCURACY RATE</span>
          <h3 style={{ fontSize: '1.8rem', color: '#16A34A', marginTop: '0.2rem' }}>{result.accuracy}%</h3>
        </div>
        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>CORRECT / INCORRECT</span>
          <h3 style={{ fontSize: '1.8rem', color: '#1E3A5F', marginTop: '0.2rem' }}>
            <span style={{ color: '#16A34A' }}>{result.correct_count}</span> / <span style={{ color: '#DC2626' }}>{result.incorrect_count}</span>
          </h3>
        </div>
        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>TIME TAKEN</span>
          <h3 style={{ fontSize: '1.8rem', color: '#2563EB', marginTop: '0.2rem' }}>{Math.round(result.time_taken_seconds / 60)} min</h3>
        </div>
      </div>

      {/* TAB NAVIGATION: OVERVIEW vs QUESTION REVIEW */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '2px solid #E2E8F0', marginBottom: '2rem' }}>
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          style={{
            padding: '0.75rem 1.5rem',
            border: 'none',
            background: 'transparent',
            borderBottom: activeTab === 'OVERVIEW' ? '3px solid #2563EB' : '3px solid transparent',
            color: activeTab === 'OVERVIEW' ? '#2563EB' : '#64748B',
            fontWeight: '800',
            cursor: 'pointer',
            fontSize: '0.95rem'
          }}
        >
          Performance Analytics & Recommendations
        </button>
        <button
          onClick={() => setActiveTab('REVIEW')}
          style={{
            padding: '0.75rem 1.5rem',
            border: 'none',
            background: 'transparent',
            borderBottom: activeTab === 'REVIEW' ? '3px solid #2563EB' : '3px solid transparent',
            color: activeTab === 'REVIEW' ? '#2563EB' : '#64748B',
            fontWeight: '800',
            cursor: 'pointer',
            fontSize: '0.95rem'
          }}
        >
          Question Review & Explanations ({result.question_reviews.length})
        </button>
      </div>

      {/* OVERVIEW TAB CONTENT */}
      {activeTab === 'OVERVIEW' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Section-wise Performance Breakdown */}
          <div className="card">
            <h3 style={{ marginBottom: '1.25rem', color: '#1E3A5F', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Award size={20} color="#2563EB" /> Section-wise Performance Breakdown
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {result.section_performances.map((sec, idx) => (
                <div key={idx} style={{ padding: '1rem', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <strong style={{ color: '#1E3A5F', fontSize: '1rem' }}>{sec.section}</strong>
                    <span style={{ fontWeight: '800', color: sec.percentage >= 75 ? '#16A34A' : '#D97706' }}>
                      {sec.percentage.toFixed(0)}% Score
                    </span>
                  </div>

                  <div className="progress-bar" style={{ marginBottom: '0.65rem' }}>
                    <div 
                      className="progress-fill" 
                      style={{ 
                        width: `${sec.percentage}%`, 
                        background: sec.percentage >= 75 ? '#16A34A' : (sec.percentage >= 60 ? '#2563EB' : '#D97706') 
                      }} 
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748B' }}>
                    <span>Questions: <strong>{sec.total_questions}</strong> (Correct: {sec.correct}, Incorrect: {sec.incorrect})</span>
                    <span>Avg Speed: <strong>{sec.avg_time_per_question}s / question</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths & Weak Areas Grid */}
          <div className="grid grid-2 gap-6">
            
            {/* Strengths Card */}
            <div className="card">
              <h3 style={{ marginBottom: '1rem', color: '#16A34A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={20} color="#16A34A" /> Identified Key Strengths
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {result.strengths.map((str, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.65rem 0.85rem', background: '#F0FDF4', borderRadius: '8px', border: '1px solid #DCFCE7', color: '#15803D', fontWeight: '600', fontSize: '0.9rem' }}>
                    <CheckCircle2 size={16} /> {str}
                  </div>
                ))}
              </div>
            </div>

            {/* Weak Areas Card */}
            <div className="card">
              <h3 style={{ marginBottom: '1rem', color: '#D97706', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={20} color="#D97706" /> Areas for Improvement
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {result.weaknesses.map((weak, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.65rem 0.85rem', background: '#FEF3C7', borderRadius: '8px', border: '1px solid #FDE68A', color: '#92400E', fontWeight: '600', fontSize: '0.9rem' }}>
                    <AlertTriangle size={16} /> {weak}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Personalized Practice Recommendations */}
          <div className="card" style={{ background: '#F0F6FF', border: '1px solid #BFDBFE' }}>
            <h3 style={{ marginBottom: '1rem', color: '#1E3A5F', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={20} color="#2563EB" /> Personalized Recommended Practice Plan
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {result.recommendations.map((rec, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1rem', background: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <span style={{ fontWeight: '600', color: '#1E3A5F', fontSize: '0.925rem' }}>
                    {rec}
                  </span>
                  <button className="btn btn-outline btn-sm" onClick={onRetake}>
                    Practice Topic <ArrowRight size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button className="btn btn-action" onClick={onRetake} style={{ fontWeight: '700' }}>
                <RefreshCw size={16} /> Retake Assessment
              </button>
              <button className="btn btn-outline" onClick={onBackToDashboard} style={{ fontWeight: '700' }}>
                <Home size={16} /> Back to Dashboard
              </button>
            </div>
          </div>

        </div>
      )}

      {/* QUESTION REVIEW TAB CONTENT */}
      {activeTab === 'REVIEW' && (
        <div className="card">
          <h3 style={{ marginBottom: '1.25rem', color: '#1E3A5F', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={20} color="#2563EB" /> Question-by-Question Solution Review
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {result.question_reviews.map((qRev, idx) => {
              const isExpanded = expandedQuestionId === qRev.question_id;
              const isCorrect = qRev.is_correct;

              return (
                <div 
                  key={qRev.question_id}
                  style={{
                    border: '1px solid #E2E8F0',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    background: '#FFFFFF'
                  }}
                >
                  <div 
                    onClick={() => setExpandedQuestionId(isExpanded ? null : qRev.question_id)}
                    style={{
                      padding: '1rem 1.25rem',
                      background: isCorrect ? '#F0FDF4' : (qRev.candidate_answer === null ? '#F8FAFC' : '#FEF2F2'),
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#1E3A5F' }}>Q{idx + 1}.</span>
                        <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>{qRev.section}</span>
                        <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Topic: {qRev.topic}</span>
                      </div>
                      <strong style={{ color: '#1E3A5F', fontSize: '0.95rem' }}>{qRev.question_text}</strong>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span className={`badge ${isCorrect ? 'badge-success' : (qRev.candidate_answer === null ? 'badge-warning' : 'badge-danger')}`}>
                        {isCorrect ? 'Correct ✓' : (qRev.candidate_answer === null ? 'Unanswered' : 'Incorrect ✗')}
                      </span>
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={{ padding: '1.25rem', borderTop: '1px solid #E2E8F0', background: '#FFFFFF' }}>
                      
                      {/* Options Grid */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
                        {qRev.options.map((opt, oIdx) => {
                          const isCand = qRev.candidate_answer === oIdx;
                          const isCorr = qRev.correct_answer === oIdx;

                          let borderStr = '1px solid #E2E8F0';
                          let bgStr = '#F8FAFC';
                          let label = '';

                          if (isCorr) {
                            borderStr = '2px solid #16A34A';
                            bgStr = '#F0FDF4';
                            label = ' (Correct Answer)';
                          } else if (isCand && !isCorr) {
                            borderStr = '2px solid #DC2626';
                            bgStr = '#FEF2F2';
                            label = ' (Your Answer)';
                          }

                          return (
                            <div key={oIdx} style={{ padding: '0.65rem 0.85rem', borderRadius: '6px', border: borderStr, background: bgStr, fontSize: '0.875rem', display: 'flex', justifyContent: 'space-between' }}>
                              <span>{opt}</span>
                              <strong style={{ color: isCorr ? '#16A34A' : '#DC2626' }}>{label}</strong>
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation Box */}
                      <div style={{ background: '#EFF6FF', borderLeft: '4px solid #2563EB', padding: '0.85rem 1rem', borderRadius: '6px', fontSize: '0.875rem', color: '#1E3A5F' }}>
                        <strong>Explanation:</strong> {qRev.explanation}
                      </div>

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
