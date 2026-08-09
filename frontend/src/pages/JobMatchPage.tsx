import React, { useState } from 'react';
import { api } from '../services/api';
import { JobDescription, JobMatchScore } from '../types';
import { Target, CheckCircle, AlertTriangle, HelpCircle, ArrowRight, Zap } from 'lucide-react';

interface JobMatchPageProps {
  onStartInterviewWithJob: (jobId: number) => void;
}

export const JobMatchPage: React.FC<JobMatchPageProps> = ({ onStartInterviewWithJob }) => {
  const [jobTitle, setJobTitle] = useState('Python Backend Developer');
  const [rawText, setRawText] = useState(
`Target Job Requirements:
We are seeking a Python Backend Developer with 1-3 years of experience.
Required Skills: Python, FastAPI, PostgreSQL, REST API, Docker, Git.
Preferred Skills: Redis, Celery, AWS, System Architecture.
Responsibilities:
- Design and maintain high-performance RESTful APIs using FastAPI and PostgreSQL.
- Write clean, unit-tested Python code.
- Containerize services with Docker and manage Git workflows.`
  );
  const [analyzing, setAnalyzing] = useState(false);
  const [job, setJob] = useState<JobDescription | null>(null);
  const [match, setMatch] = useState<JobMatchScore | null>(null);
  const [error, setError] = useState('');

  const handleAnalyzeAndMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim()) return;

    setError('');
    setAnalyzing(true);

    try {
      // 1. Analyze Job
      const parsedJob = await api.analyzeJob({ title: jobTitle, raw_text: rawText });
      setJob(parsedJob);

      // 2. Match with Resume
      const matchScore = await api.matchJob(parsedJob.id);
      setMatch(matchScore);
    } catch (err: any) {
      setError(err.message || 'Job match failed. Ensure you have uploaded a resume first.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', maxWidth: '1000px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2>Job Description Analysis & Resume Matching</h2>
        <p>Paste your target job description to analyze required skills, compare against your uploaded resume, and calculate your job fit score.</p>
      </div>

      <form onSubmit={handleAnalyzeAndMatch} className="card" style={{ marginBottom: '2.5rem' }}>
        <div className="form-group">
          <label className="form-label">Job Title / Target Role</label>
          <input className="form-input" value={jobTitle} onChange={e => setJobTitle(e.target.value)} required />
        </div>

        <div className="form-group">
          <label className="form-label">Paste Target Job Description</label>
          <textarea 
            className="form-textarea" 
            style={{ minHeight: '160px' }} 
            value={rawText} 
            onChange={e => setRawText(e.target.value)} 
            placeholder="Paste raw text of job post here..." 
            required 
          />
        </div>

        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#DC2626', padding: '0.75rem', borderRadius: '6px', fontSize: '0.875rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <button type="submit" className="btn btn-action btn-lg" disabled={analyzing}>
          <Target size={18} /> {analyzing ? 'Analyzing & Matching...' : 'Run Resume vs. Job Match'}
        </button>
      </form>

      {/* Match Results */}
      {match && job && (
        <div>
          {/* Match Score Banner */}
          <div className="card" style={{ background: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)', color: '#FFFFFF', padding: '2rem', borderRadius: '16px', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <p style={{ color: '#DCFCE7', fontWeight: '700', fontSize: '0.85rem' }}>JOB FIT MATCH SCORE</p>
                <h1 style={{ color: '#FFFFFF', fontSize: '3.5rem', margin: '0.2rem 0' }}>{match.match_percentage}%</h1>
                <p style={{ color: '#F0FDF4', maxWidth: '600px' }}>{match.explanation}</p>
              </div>

              <button className="btn" style={{ background: '#FFFFFF', color: '#15803D', fontWeight: '700' }} onClick={() => onStartInterviewWithJob(job.id)}>
                Start Job-Specific Mock Interview <ArrowRight size={18} />
              </button>
            </div>
          </div>

          {/* Skill Breakdown Grid */}
          <div className="grid grid-3 gap-6">
            {/* Matched Skills */}
            <div className="card">
              <h4 style={{ color: '#16A34A', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }}>
                <CheckCircle size={18} /> Matched Skills ({match.matched_skills.length})
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {match.matched_skills.map((s, idx) => (
                  <span key={idx} className="badge badge-success">{s}</span>
                ))}
              </div>
            </div>

            {/* Partially Matched Skills */}
            <div className="card">
              <h4 style={{ color: '#D97706', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }}>
                <HelpCircle size={18} /> Partial Match ({match.partial_skills.length})
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {match.partial_skills.map((s, idx) => (
                  <span key={idx} className="badge badge-warning">{s}</span>
                ))}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="card">
              <h4 style={{ color: '#DC2626', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }}>
                <AlertTriangle size={18} /> Missing Skills ({match.missing_skills.length})
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {match.missing_skills.map((s, idx) => (
                  <span key={idx} className="badge badge-error">{s}</span>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
