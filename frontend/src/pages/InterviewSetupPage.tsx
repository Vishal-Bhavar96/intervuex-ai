import React, { useState } from 'react';
import { api } from '../services/api';
import { PlayCircle, Settings, Sliders, ToggleLeft, ToggleRight, Sparkles } from 'lucide-react';

interface InterviewSetupPageProps {
  initialJobId?: number;
  onInterviewCreated: (interviewId: number) => void;
}

export const InterviewSetupPage: React.FC<InterviewSetupPageProps> = ({ initialJobId, onInterviewCreated }) => {
  const [interviewType, setInterviewType] = useState('TECHNICAL');
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [instantFeedback, setInstantFeedback] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const created = await api.createInterview({
        job_description_id: initialJobId || null,
        type: interviewType,
        difficulty,
        total_questions: totalQuestions,
        instant_feedback_enabled: instantFeedback
      });
      onInterviewCreated(created.id);
    } catch (err) {
      console.error('Failed to create interview session', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', maxWidth: '800px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2>Configure AI Mock Interview</h2>
        <p>Customize interview dimensions, question types, difficulty, and instant feedback settings.</p>
      </div>

      <form onSubmit={handleStart} className="card">
        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sliders size={20} color="#2563EB" /> Interview Environment Configuration
        </h3>

        {/* Interview Type Selector */}
        <div className="form-group">
          <label className="form-label">Interview Type</label>
          <select className="form-select" value={interviewType} onChange={e => setInterviewType(e.target.value)}>
            <option value="TECHNICAL">1. Technical Fundamentals & Architecture</option>
            <option value="PROJECT_DEFENSE">2. Project Defense Interview (Resume-Driven)</option>
            <option value="CODING">3. Live Coding & Problem Solving IDE</option>
            <option value="JOB_SPECIFIC">4. Job-Specific Skills Assessment</option>
            <option value="HR">5. HR & Behavioral Interview</option>
            <option value="BEHAVIORAL">6. Behavioral STAR Method</option>
            <option value="RESUME_BASED">7. Resume Deep Dive</option>
            <option value="MIXED">8. Comprehensive Mixed Interview</option>
          </select>
        </div>

        {/* Difficulty Level */}
        <div className="form-group">
          <label className="form-label">Difficulty Level</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
            {['EASY', 'MEDIUM', 'HARD', 'EXPERT'].map((lvl) => (
              <button
                key={lvl}
                type="button"
                className={`btn ${difficulty === lvl ? 'btn-action' : 'btn-outline'}`}
                onClick={() => setDifficulty(lvl)}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Question Count */}
        <div className="form-group">
          <label className="form-label">Number of Questions</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
            {[5, 10, 15, 20].map((num) => (
              <button
                key={num}
                type="button"
                className={`btn ${totalQuestions === num ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setTotalQuestions(num)}
              >
                {num} Questions
              </button>
            ))}
          </div>
        </div>

        {/* Instant Feedback Toggle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
          <div>
            <strong style={{ color: '#1E3A5F', display: 'block' }}>Real-Time Instant Answer Feedback</strong>
            <span style={{ fontSize: '0.825rem', color: '#64748B' }}>
              {instantFeedback ? 'Feedback displayed after every answer submission.' : 'Feedback revealed only upon interview completion (Realistic Mode).'}
            </span>
          </div>

          <button 
            type="button" 
            className="btn btn-outline" 
            onClick={() => setInstantFeedback(!instantFeedback)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            {instantFeedback ? <ToggleRight size={28} color="#2563EB" /> : <ToggleLeft size={28} color="#64748B" />}
            {instantFeedback ? 'ON' : 'OFF'}
          </button>
        </div>

        <button type="submit" className="btn btn-action btn-lg" style={{ width: '100%' }} disabled={loading}>
          <Sparkles size={20} /> {loading ? 'Initializing Interviewer...' : 'Start AI Interview Session'}
        </button>
      </form>
    </div>
  );
};
