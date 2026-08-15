import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Sliders, Sparkles, Mic, Clock, Target, CheckSquare, Square, Layers, MessageSquare, ArrowRight, ShieldCheck } from 'lucide-react';

interface InterviewSetupPageProps {
  initialJobId?: number;
  onInterviewCreated: (interviewId: number) => void;
}

export const InterviewSetupPage: React.FC<InterviewSetupPageProps> = ({ initialJobId, onInterviewCreated }) => {
  const [interviewType, setInterviewType] = useState('JOB_SPECIFIC');
  const [difficulty, setDifficulty] = useState('ADAPTIVE');
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null); // null = auto calculate
  
  // Feedback Mode: 'INSTANT' | 'END_OF_INTERVIEW' | 'HIDDEN'
  const [feedbackMode, setFeedbackMode] = useState<'INSTANT' | 'END_OF_INTERVIEW' | 'HIDDEN'>('END_OF_INTERVIEW');

  // Focus Categories Checkboxes
  const [focusCategories, setFocusCategories] = useState<{ [key: string]: boolean }>({
    'Resume Projects': true,
    'Technical Skills': true,
    'Job Requirements': true,
    'Problem Solving': true,
    'System Design': false,
    'Behavioral Questions': false,
  });

  // Selectable Skill Chips
  const [availableChips] = useState<string[]>([
    'Python', 'Django', 'SQL', 'REST API', 'Projects', 'DSA', 'System Design', 'React', 'FastAPI', 'PostgreSQL'
  ]);
  const [selectedChips, setSelectedChips] = useState<string[]>(['Python', 'Django', 'SQL', 'Projects']);
  const [customChipInput, setCustomChipInput] = useState('');

  // Voice Mode Toggle
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  // Profile data for preview card
  const [candidateRole, setCandidateRole] = useState('Python Developer');
  const [resumeMatchScore, setResumeMatchScore] = useState(78);

  useEffect(() => {
    // Fetch candidate profile to get target role and match score
    const loadProfile = async () => {
      try {
        const prof = await api.getProfile();
        if (prof && prof.target_role) {
          setCandidateRole(prof.target_role);
        }
        const resAnalysis = await api.getLatestResumeAnalysis().catch(() => null);
        if (resAnalysis && resAnalysis.overall_score) {
          setResumeMatchScore(Math.round(resAnalysis.overall_score));
        }
      } catch (e) {
        // Fallback default role
      }
    };
    loadProfile();
  }, []);

  // Calculate estimated duration based on question count
  const calculatedMinutes = selectedDuration || Math.round(totalQuestions * 2.5);

  const toggleFocusCategory = (cat: string) => {
    setFocusCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const toggleChip = (chip: string) => {
    if (selectedChips.includes(chip)) {
      setSelectedChips(selectedChips.filter(c => c !== chip));
    } else {
      setSelectedChips([...selectedChips, chip]);
    }
  };

  const handleAddCustomChip = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customChipInput.trim()) {
      e.preventDefault();
      const newChip = customChipInput.trim();
      if (!selectedChips.includes(newChip)) {
        setSelectedChips([...selectedChips, newChip]);
      }
      setCustomChipInput('');
    }
  };

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Concatenate focus areas
    const activeCategories = Object.keys(focusCategories).filter(k => focusCategories[k]);
    const allFocus = Array.from(new Set([...selectedChips, ...activeCategories]));

    try {
      const created = await api.createInterview({
        job_description_id: initialJobId || null,
        type: interviewType,
        difficulty: difficulty === 'ADAPTIVE' ? 'MEDIUM' : difficulty,
        total_questions: totalQuestions,
        instant_feedback_enabled: feedbackMode === 'INSTANT',
      });
      onInterviewCreated(created.id);
    } catch (err) {
      console.error('Failed to create interview session', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper for displaying active focus string
  const displayFocusAreas = selectedChips.length > 0 
    ? selectedChips.slice(0, 4).join(' • ') 
    : Object.keys(focusCategories).filter(k => focusCategories[k]).slice(0, 3).join(' • ');

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', maxWidth: '1140px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.85rem', color: '#0F172A' }}>Configure AI Mock Interview</h2>
        <p style={{ color: '#64748B' }}>Customize interview dimensions, question types, focus areas, duration, and feedback preferences.</p>
      </div>

      {/* Featured Project Defense Banner Card */}
      <div 
        className="card" 
        style={{ 
          marginBottom: '2rem', 
          background: 'linear-gradient(135deg, #4C1D95 0%, #1E1B4B 100%)', 
          color: '#FFFFFF', 
          padding: '1.5rem 2rem', 
          borderRadius: '16px',
          border: '1px solid #6D28D9',
          boxShadow: '0 10px 25px -5px rgba(76, 29, 149, 0.3)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span className="badge" style={{ background: '#F3E8FF', color: '#6B21A8', fontWeight: '800', fontSize: '0.8rem' }}>
                ⭐⭐⭐⭐⭐ FEATURED MODE
              </span>
              <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#C084FC' }}>
                FOR FINAL-YEAR STUDENTS & FRESHERS
              </span>
            </div>
            <h3 style={{ color: '#FFFFFF', fontSize: '1.35rem', margin: '0.2rem 0' }}>
              Project Defense Mode — <span style={{ color: '#E9D5FF' }}>Secure File Sharing System</span>
            </h3>
            <p style={{ color: '#DDD6FE', fontSize: '0.875rem', marginTop: '0.2rem' }}>
              Evaluates 8 core dimensions: Project Understanding • Architecture • Tech Selection • Database Schema • Security • Implementation • Challenges • Scalability
            </p>
          </div>

          <button 
            type="button" 
            className="btn btn-action"
            style={{ background: '#FFFFFF', color: '#6B21A8', border: 'none', fontWeight: '800', fontSize: '0.9rem', padding: '0.75rem 1.25rem' }}
            onClick={() => setInterviewType('PROJECT_DEFENSE')}
          >
            Select Project Defense Mode →
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem', alignItems: 'start' }}>
        
        {/* Left Column: Form Controls */}
        <form onSubmit={handleStart} className="card" style={{ padding: '2rem', borderRadius: '16px' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '1.2rem', color: '#1E3A5F' }}>
            <Sliders size={22} color="#2563EB" /> Interview Environment Configuration
          </h3>

          {/* 1. Interview Type */}
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Interview Type</label>
            <select className="form-select" value={interviewType} onChange={e => setInterviewType(e.target.value)}>
              <option value="JOB_SPECIFIC">1. Job-Specific Skills Assessment</option>
              <option value="TECHNICAL">2. Technical Fundamentals & Architecture</option>
              <option value="PROJECT_DEFENSE">3. Project Defense (Resume-Driven)</option>
              <option value="CODING">4. Live Coding & Problem Solving IDE</option>
              <option value="HR">5. HR & Behavioral Interview</option>
              <option value="BEHAVIORAL">6. Behavioral STAR Method</option>
              <option value="RESUME_BASED">7. Resume Deep Dive</option>
              <option value="MIXED">8. Comprehensive Mixed Interview</option>
            </select>
          </div>

          {/* 2. Difficulty Level */}
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Difficulty Level</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.4rem' }}>
              {['EASY', 'MEDIUM', 'HARD', 'EXPERT', 'ADAPTIVE'].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  className={`btn ${difficulty === lvl ? 'btn-action' : 'btn-outline'}`}
                  style={{ fontSize: '0.75rem', padding: '0.5rem 0.2rem' }}
                  onClick={() => setDifficulty(lvl)}
                >
                  {lvl === 'ADAPTIVE' ? 'Adaptive AI' : lvl}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Number of Questions */}
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
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

          {/* 4. Interview Duration */}
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Interview Duration</label>
              <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#2563EB', background: '#EFF6FF', padding: '0.2rem 0.65rem', borderRadius: '9999px' }}>
                Estimated duration: ~{calculatedMinutes} minutes
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
              {[15, 30, 45, 60].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  className={`btn ${selectedDuration === mins ? 'btn-action' : 'btn-outline'}`}
                  onClick={() => setSelectedDuration(mins)}
                >
                  {mins} min
                </button>
              ))}
            </div>
          </div>

          {/* 5. Interview Focus */}
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Target size={16} color="#2563EB" /> Interview Focus
            </label>
            <p style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '0.75rem' }}>
              Give the AI control over what areas to concentrate on during question generation.
            </p>

            {/* Checkboxes Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.6rem', marginBottom: '1rem' }}>
              {Object.keys(focusCategories).map((cat) => (
                <div 
                  key={cat} 
                  onClick={() => toggleFocusCategory(cat)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '500', color: '#334155', userSelect: 'none' }}
                >
                  {focusCategories[cat] ? (
                    <CheckSquare size={18} color="#2563EB" />
                  ) : (
                    <Square size={18} color="#94A3B8" />
                  )}
                  <span>{cat}</span>
                </div>
              ))}
            </div>

            {/* Selectable Skill Chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
              {availableChips.map((chip) => {
                const isSelected = selectedChips.includes(chip);
                return (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => toggleChip(chip)}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      border: isSelected ? '1px solid #2563EB' : '1px solid #CBD5E1',
                      background: isSelected ? '#EFF6FF' : '#F8FAFC',
                      color: isSelected ? '#1D4ED8' : '#475569',
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    {isSelected ? `✓ ${chip}` : `+ ${chip}`}
                  </button>
                );
              })}
            </div>
            
            <input 
              type="text"
              className="form-input"
              style={{ marginTop: '0.65rem', fontSize: '0.825rem', padding: '0.45rem 0.75rem' }}
              placeholder="Type custom skill tag and press Enter (e.g. Docker, GraphQL)..."
              value={customChipInput}
              onChange={(e) => setCustomChipInput(e.target.value)}
              onKeyDown={handleAddCustomChip}
            />
          </div>

          {/* 6. Feedback Mode */}
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageSquare size={16} color="#2563EB" /> Feedback Mode
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              
              <div 
                onClick={() => setFeedbackMode('INSTANT')}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem 1rem',
                  border: feedbackMode === 'INSTANT' ? '2px solid #2563EB' : '1px solid #E2E8F0',
                  borderRadius: '10px', background: feedbackMode === 'INSTANT' ? '#EFF6FF' : '#FFFFFF', cursor: 'pointer'
                }}
              >
                <input type="radio" checked={feedbackMode === 'INSTANT'} readOnly style={{ marginTop: '3px' }} />
                <div>
                  <strong style={{ fontSize: '0.9rem', color: '#0F172A', display: 'block' }}>○ Instant</strong>
                  <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Feedback displayed immediately after every answer submission</span>
                </div>
              </div>

              <div 
                onClick={() => setFeedbackMode('END_OF_INTERVIEW')}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem 1rem',
                  border: feedbackMode === 'END_OF_INTERVIEW' ? '2px solid #2563EB' : '1px solid #E2E8F0',
                  borderRadius: '10px', background: feedbackMode === 'END_OF_INTERVIEW' ? '#EFF6FF' : '#FFFFFF', cursor: 'pointer'
                }}
              >
                <input type="radio" checked={feedbackMode === 'END_OF_INTERVIEW'} readOnly style={{ marginTop: '3px' }} />
                <div>
                  <strong style={{ fontSize: '0.9rem', color: '#0F172A', display: 'block' }}>● End of Interview</strong>
                  <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Full multi-dimensional score & evaluation revealed after completion</span>
                </div>
              </div>

              <div 
                onClick={() => setFeedbackMode('HIDDEN')}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem 1rem',
                  border: feedbackMode === 'HIDDEN' ? '2px solid #2563EB' : '1px solid #E2E8F0',
                  borderRadius: '10px', background: feedbackMode === 'HIDDEN' ? '#EFF6FF' : '#FFFFFF', cursor: 'pointer'
                }}
              >
                <input type="radio" checked={feedbackMode === 'HIDDEN'} readOnly style={{ marginTop: '3px' }} />
                <div>
                  <strong style={{ fontSize: '0.9rem', color: '#0F172A', display: 'block' }}>○ Hidden</strong>
                  <span style={{ fontSize: '0.8rem', color: '#64748B' }}>No feedback until the interview ends (Realistic Exam Simulation)</span>
                </div>
              </div>

            </div>
          </div>

          {/* 7. Optional Voice Interview Mode */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', padding: '1rem', borderRadius: '10px', marginBottom: '1.75rem', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: voiceEnabled ? '#DCFCE7' : '#E2E8F0', color: voiceEnabled ? '#15803D' : '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Mic size={20} />
              </div>
              <div>
                <strong style={{ color: '#1E3A5F', display: 'block', fontSize: '0.9rem' }}>Voice Interview</strong>
                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                  Optional speech-to-text & voice synthesis for realistic spoken practice.
                </span>
              </div>
            </div>

            <button 
              type="button"
              className={`btn ${voiceEnabled ? 'btn-action' : 'btn-outline'}`}
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}
              onClick={() => setVoiceEnabled(!voiceEnabled)}
            >
              {voiceEnabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          <button type="submit" className="btn btn-action btn-lg" style={{ width: '100%' }} disabled={loading}>
            <Sparkles size={20} /> {loading ? 'Initializing Interviewer...' : 'Start AI Interview Session'}
          </button>
        </form>

        {/* Right Column: Live INTERVIEW PREVIEW Card */}
        <div style={{ position: 'sticky', top: '90px' }}>
          <div 
            className="card" 
            style={{ 
              background: '#0F172A', 
              color: '#F8FAFC', 
              borderRadius: '20px', 
              padding: '2.25rem', 
              border: '1px solid #334155',
              boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)' 
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', paddingBottom: '1rem', borderBottom: '1px solid #334155' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 10px #22C55E' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: '800', letterSpacing: '0.08em', color: '#94A3B8' }}>INTERVIEW PREVIEW</span>
              </div>
              <span className="badge badge-primary" style={{ background: '#1E293B', color: '#38BDF8', border: '1px solid #0284C7' }}>
                {difficulty === 'ADAPTIVE' ? 'Adaptive AI' : difficulty}
              </span>
            </div>

            {/* Spec Table */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.75rem' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#94A3B8', fontSize: '0.9rem' }}>Role</span>
                <span style={{ fontWeight: '700', color: '#F8FAFC', fontSize: '0.95rem' }}>{candidateRole}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#94A3B8', fontSize: '0.9rem' }}>Type</span>
                <span style={{ fontWeight: '600', color: '#CBD5E1', fontSize: '0.9rem' }}>
                  {interviewType.replace('_', ' ')}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#94A3B8', fontSize: '0.9rem' }}>Difficulty</span>
                <span style={{ fontWeight: '600', color: '#CBD5E1', fontSize: '0.9rem' }}>
                  {difficulty === 'ADAPTIVE' ? 'Adaptive AI' : difficulty}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#94A3B8', fontSize: '0.9rem' }}>Questions</span>
                <span style={{ fontWeight: '700', color: '#38BDF8', fontSize: '0.95rem' }}>{totalQuestions}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#94A3B8', fontSize: '0.9rem' }}>Duration</span>
                <span style={{ fontWeight: '600', color: '#CBD5E1', fontSize: '0.9rem' }}>~{calculatedMinutes} min</span>
              </div>

            </div>

            {/* Focus Areas Section */}
            <div style={{ marginBottom: '1.75rem', paddingTop: '1rem', borderTop: '1px solid #1E293B' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#94A3B8', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                Focus Areas
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: '600', color: '#38BDF8', lineHeight: 1.4 }}>
                {displayFocusAreas || 'General Technical Practice'}
              </div>
            </div>

            {/* Resume Match Score */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1rem', background: '#1E293B', borderRadius: '12px', marginBottom: '2rem', border: '1px solid #334155' }}>
              <span style={{ color: '#CBD5E1', fontSize: '0.9rem', fontWeight: '600' }}>Resume Match</span>
              <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#22C55E' }}>{resumeMatchScore}%</span>
            </div>

            {/* Primary Action Button */}
            <button 
              type="button" 
              className="btn btn-action btn-lg" 
              style={{ width: '100%', background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)', boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.4)', borderRadius: '12px', fontSize: '1.05rem' }} 
              onClick={handleStart}
              disabled={loading}
            >
              {loading ? 'Initializing...' : 'Start AI Interview →'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

