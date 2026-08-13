import React, { useState } from 'react';
import { 
  Award, Clock, CheckCircle2, ShieldAlert, Cpu, Building2, 
  HelpCircle, ArrowRight, History, Play, AlertCircle
} from 'lucide-react';

interface AptitudeLandingPageProps {
  onStartConfiguredTest: (companyPattern: string, difficultyMode: string) => void;
  onViewHistory: () => void;
}

const COMPANY_PATTERNS = [
  { id: 'General MNC', name: 'General MNC Practice', badge: 'Recommended' },
  { id: 'TCS-style', name: 'TCS-style Pattern', badge: 'Placement Focus' },
  { id: 'Infosys-style', name: 'Infosys-style Pattern', badge: 'Logical Heavy' },
  { id: 'Wipro-style', name: 'Wipro-style Pattern', badge: 'Speed & Accuracy' },
  { id: 'Cognizant-style', name: 'Cognizant-style Pattern', badge: 'Quantitative' },
  { id: 'Capgemini-style', name: 'Capgemini-style Pattern', badge: 'Game/Reasoning' },
  { id: 'Accenture-style', name: 'Accenture-style Pattern', badge: 'Verbal & Critical' },
  { id: 'Tech Mahindra-style', name: 'Tech Mahindra-style Pattern', badge: 'Numerical' },
  { id: 'LTIMindtree-style', name: 'LTIMindtree-style Pattern', badge: 'Analytical' },
  { id: 'Persistent-style', name: 'Persistent-style Pattern', badge: 'Advanced Tech' },
];

const DIFFICULTY_OPTIONS = [
  { id: 'Mixed', label: 'Adaptive Mixed (Recommended)', desc: '30% Easy, 50% Medium, 20% Hard' },
  { id: 'Easy', label: 'Easy Level', desc: 'Basic calculations and core concepts' },
  { id: 'Medium', label: 'Medium Level', desc: 'Standard multi-step placement problems' },
  { id: 'Hard', label: 'Hard Level', desc: 'Advanced reasoning and complex data interpretation' },
];

export const AptitudeLandingPage: React.FC<AptitudeLandingPageProps> = ({
  onStartConfiguredTest,
  onViewHistory,
}) => {
  const [selectedPattern, setSelectedPattern] = useState<string>('General MNC');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('Mixed');

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', maxWidth: '1100px' }}>
      
      {/* Header Banner */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #1E3A5F 0%, #2563EB 100%)', color: '#FFFFFF', padding: '2.5rem', borderRadius: '16px', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <span style={{ background: 'rgba(255,255,255,0.15)', padding: '0.35rem 0.85rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              PROCTORED ASSESSMENT MODULE
            </span>
            <h1 style={{ color: '#FFFFFF', marginTop: '0.65rem', marginBottom: '0.5rem', fontSize: '2.25rem', fontWeight: '800' }}>
              AI Aptitude Assessment
            </h1>
            <p style={{ color: '#BFDBFE', fontSize: '1.05rem', maxWidth: '650px', lineHeight: '1.5' }}>
              Evaluate your quantitative, logical, verbal and analytical skills with an MNC-style placement assessment.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-outline" onClick={onViewHistory} style={{ borderColor: 'rgba(255,255,255,0.4)', color: '#FFFFFF', padding: '0.75rem 1.25rem' }}>
              <History size={18} /> View Previous Results
            </button>
            <button 
              className="btn btn-action" 
              onClick={() => onStartConfiguredTest(selectedPattern, selectedDifficulty)}
              style={{ background: '#FFFFFF', color: '#1D4ED8', border: 'none', fontWeight: '800', padding: '0.75rem 1.5rem' }}
            >
              <Play size={18} /> Start Assessment
            </button>
          </div>
        </div>
      </div>

      {/* Assessment Specifications Overview Cards */}
      <div className="grid grid-4 gap-4" style={{ marginBottom: '2.5rem' }}>
        <div className="card" style={{ textAlign: 'center', padding: '1.25rem' }}>
          <div style={{ color: '#2563EB', fontSize: '1.8rem', fontWeight: '800' }}>40</div>
          <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: '700' }}>Total Questions</span>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '1.25rem' }}>
          <div style={{ color: '#059669', fontSize: '1.8rem', fontWeight: '800' }}>45 Min</div>
          <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: '700' }}>Assessment Duration</span>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '1.25rem' }}>
          <div style={{ color: '#D97706', fontSize: '1.8rem', fontWeight: '800' }}>5 Sections</div>
          <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: '700' }}>Quant, Logical, Verbal, DI, Analytical</span>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '1.25rem' }}>
          <div style={{ color: '#7C3AED', fontSize: '1.8rem', fontWeight: '800' }}>Adaptive</div>
          <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: '700' }}>Proctored Practice Mode</span>
        </div>
      </div>

      {/* Mandatory Disclaimer Alert */}
      <div style={{ background: '#EFF6FF', borderLeft: '4px solid #2563EB', padding: '1rem 1.25rem', borderRadius: '8px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <AlertCircle size={22} color="#2563EB" style={{ flexShrink: 0 }} />
        <span style={{ color: '#1E3A5F', fontSize: '0.875rem', fontWeight: '600' }}>
          <strong>MNC-Style Practice Questions:</strong> These are practice questions based on commonly observed placement-assessment patterns and are not official company examination questions.
        </span>
      </div>

      <div className="grid grid-2 gap-6" style={{ marginBottom: '2.5rem' }}>
        {/* Company Pattern Selection */}
        <div className="card">
          <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1E3A5F' }}>
            <Building2 size={20} color="#2563EB" /> Select Company-Style Preparation Pattern
          </h3>
          <p style={{ color: '#64748B', fontSize: '0.875rem', marginBottom: '1rem' }}>
            Choose a target MNC assessment structure associated with common recruitment standards:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: '340px', overflowY: 'auto', paddingRight: '0.5rem' }}>
            {COMPANY_PATTERNS.map((pattern) => (
              <div 
                key={pattern.id}
                onClick={() => setSelectedPattern(pattern.id)}
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '10px',
                  border: selectedPattern === pattern.id ? '2px solid #2563EB' : '1px solid #E2E8F0',
                  background: selectedPattern === pattern.id ? '#F0F6FF' : '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.15s ease'
                }}
              >
                <div>
                  <strong style={{ color: '#1E3A5F', fontSize: '0.95rem' }}>{pattern.name}</strong>
                  <span style={{ display: 'block', fontSize: '0.775rem', color: '#64748B' }}>
                    {pattern.id === 'General MNC' ? 'Balanced placement pattern across all sections' : `Tailored for ${pattern.id} practice structure`}
                  </span>
                </div>
                <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>{pattern.badge}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Difficulty Level Selection */}
        <div className="card">
          <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1E3A5F' }}>
            <Cpu size={20} color="#7C3AED" /> Assessment Difficulty Mode
          </h3>
          <p style={{ color: '#64748B', fontSize: '0.875rem', marginBottom: '1rem' }}>
            Adjust the question difficulty distribution according to your preparation goals:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {DIFFICULTY_OPTIONS.map((opt) => (
              <div
                key={opt.id}
                onClick={() => setSelectedDifficulty(opt.id)}
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '10px',
                  border: selectedDifficulty === opt.id ? '2px solid #7C3AED' : '1px solid #E2E8F0',
                  background: selectedDifficulty === opt.id ? '#F5F3FF' : '#FFFFFF',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                  <strong style={{ color: '#1E3A5F', fontSize: '0.95rem' }}>{opt.label}</strong>
                  {selectedDifficulty === opt.id && <CheckCircle2 size={18} color="#7C3AED" />}
                </div>
                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>{opt.desc}</span>
              </div>
            ))}
          </div>

          {/* Test Parameters Breakdown */}
          <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
            <h4 style={{ fontSize: '0.875rem', color: '#1E3A5F', marginBottom: '0.5rem' }}>Section Question Distribution</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem', color: '#475569' }}>
              <div>• Quantitative Aptitude: <strong>10 Qs</strong></div>
              <div>• Logical Reasoning: <strong>10 Qs</strong></div>
              <div>• Verbal Ability: <strong>10 Qs</strong></div>
              <div>• Data Interpretation: <strong>5 Qs</strong></div>
              <div>• Analytical Reasoning: <strong>5 Qs</strong></div>
              <div>• Marking Scheme: <strong>+1.0 / -0.25</strong></div>
            </div>
          </div>
        </div>
      </div>

      {/* Start Action Bar */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem', borderRadius: '14px', background: '#FFFFFF', border: '1px solid #CBD5E1' }}>
        <div>
          <strong style={{ color: '#1E3A5F', fontSize: '1.1rem', display: 'block' }}>Ready to test your aptitude readiness?</strong>
          <span style={{ fontSize: '0.85rem', color: '#64748B' }}>Selected: <strong>{selectedPattern}</strong> • Mode: <strong>{selectedDifficulty}</strong></span>
        </div>
        <button 
          className="btn btn-action btn-lg" 
          onClick={() => onStartConfiguredTest(selectedPattern, selectedDifficulty)}
          style={{ padding: '0.85rem 2rem', fontSize: '1rem', fontWeight: '800' }}
        >
          Start Assessment <ArrowRight size={18} />
        </button>
      </div>

    </div>
  );
};
