import React from 'react';
import { Briefcase, CheckCircle, Cpu, FileText, Zap, Award, Target, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div style={{ background: '#F8FAFC', minHeight: 'calc(100vh - 70px)' }}>
      {/* Hero Section */}
      <section style={{ padding: '4.5rem 0 3.5rem', background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)', borderBottom: '1px solid #E2E8F0' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '900px' }}>
          <div style={{ 
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1rem', 
            borderRadius: '9999px', background: '#EFF6FF', border: '1px solid #BFDBFE', 
            color: '#1D4ED8', fontSize: '0.85rem', fontWeight: '700', marginBottom: '1.5rem' 
          }}>
            <Zap size={16} /> NEXT-GEN ADAPTIVE AI INTERVIEW PLATFORM
          </div>

          <h1 style={{ fontSize: '3rem', fontWeight: '800', color: '#1E3A5F', marginBottom: '1.25rem', lineHeight: '1.15' }}>
            Practice Smarter. Interview Better. <br />
            <span style={{ color: '#2563EB' }}>Get Career Ready.</span>
          </h1>

          <p style={{ fontSize: '1.2rem', color: '#475569', marginBottom: '2.5rem', lineHeight: '1.6' }}>
            An adaptive AI interviewer that understands your resume, targets your desired job, 
            challenges you with dynamic follow-up questions, evaluates your answers, and builds a measurable roadmap for improvement.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <button className="btn btn-action btn-lg" onClick={onStart} style={{ boxShadow: '0 4px 14px rgba(37,99,235,0.35)' }}>
              Start AI Mock Interview <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="container" style={{ padding: '4rem 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', color: '#1E3A5F', marginBottom: '0.5rem' }}>Realistic Software Company Simulation</h2>
          <p>Everything you need to crack technical, project defense, coding, and HR interviews.</p>
        </div>

        <div className="grid grid-3 gap-6">
          <div className="card card-hover">
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284C7', marginBottom: '1.25rem' }}>
              <FileText size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Smart Resume Analysis</h3>
            <p>Upload PDF/DOCX resumes to extract technical skills, projects, and receive detailed score breakdowns across 6 core metrics.</p>
          </div>

          <div className="card card-hover">
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16A34A', marginBottom: '1.25rem' }}>
              <Target size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Job Description Match</h3>
            <p>Paste target job descriptions to extract required technologies, identify matched vs missing skills, and calculate job readiness fit.</p>
          </div>

          <div className="card card-hover">
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB', marginBottom: '1.25rem' }}>
              <Cpu size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Adaptive Follow-Up AI</h3>
            <p>No fixed static questions. The AI evaluates answer depth in real-time, asking deeper technical follow-ups or foundational checks.</p>
          </div>
        </div>
      </section>
    </div>
  );
};
