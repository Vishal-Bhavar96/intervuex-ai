import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { ResumeAnalysis } from '../types';
import { UploadCloud, CheckCircle, AlertTriangle, FileText, Award, BarChart2 } from 'lucide-react';

export const ResumePage: React.FC = () => {
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function loadAnalysis() {
      try {
        const data = await api.getLatestResumeAnalysis();
        setAnalysis(data);
      } catch (e) {
        // No resume yet
      } finally {
        setLoading(false);
      }
    }
    loadAnalysis();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setSuccess('');
    setUploading(true);

    try {
      const res = await api.uploadResume(file);
      setAnalysis(res.analysis);
      setSuccess(`Resume '${file.name}' uploaded and parsed successfully!`);
    } catch (err: any) {
      setError(err.message || 'Failed to parse resume file.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center' }}>Loading resume analysis...</div>;

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', maxWidth: '1000px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2>Resume Upload & AI Parsing</h2>
        <p>Upload your PDF or DOCX resume to extract technical skills, projects, and receive an instant multi-category score breakdown.</p>
      </div>

      {/* File Upload Box */}
      <div className="card" style={{ padding: '2.5rem', textAlign: 'center', background: '#FFFFFF', border: '2px dashed #CBD5E1', marginBottom: '2.5rem' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: '#EFF6FF', color: '#2563EB', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
          <UploadCloud size={28} />
        </div>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Upload PDF or DOCX Resume</h3>
        <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Maximum file size: 10MB. Text extraction and AI skill parsing are automatic.</p>

        <label className="btn btn-action btn-lg" style={{ cursor: 'pointer' }}>
          {uploading ? 'Parsing Resume...' : 'Select Resume File'}
          <input type="file" accept=".pdf,.docx" onChange={handleFileUpload} style={{ display: 'none' }} disabled={uploading} />
        </label>

        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#DC2626', padding: '0.75rem', borderRadius: '6px', fontSize: '0.875rem', marginTop: '1.25rem' }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#16A34A', padding: '0.75rem', borderRadius: '6px', fontSize: '0.875rem', marginTop: '1.25rem' }}>
            {success}
          </div>
        )}
      </div>

      {/* Resume Analysis Output */}
      {analysis && (
        <div>
          <div className="card" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, #1E3A5F 0%, #0F172A 100%)', color: '#FFFFFF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
              <div>
                <p style={{ color: '#93C5FD', fontWeight: '700', fontSize: '0.85rem' }}>OVERALL RESUME SCORE</p>
                <h1 style={{ color: '#FFFFFF', fontSize: '3.5rem', margin: '0.2rem 0' }}>
                  {analysis.overall_score}<span style={{ fontSize: '1.5rem', color: '#94A3B8' }}>/100</span>
                </h1>
                <p style={{ color: '#CBD5E1' }}>Score computed based on industry standards for technical candidate profiles.</p>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1.25rem', borderRadius: '12px', minWidth: '220px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span>Technical Stack:</span>
                  <strong>{analysis.tech_skills_score}/100</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span>Project Strength:</span>
                  <strong>{analysis.project_score}/100</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Completeness:</span>
                  <strong>{analysis.completeness_score}/100</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Breakdown Grid */}
          <div className="grid grid-3 gap-6" style={{ marginBottom: '2rem' }}>
            <div className="card">
              <h4>Technical Skills Score</h4>
              <h2 style={{ color: '#2563EB', margin: '0.5rem 0' }}>{analysis.tech_skills_score}/100</h2>
              <p style={{ fontSize: '0.85rem' }}>Measures depth and variety of programming languages, frameworks, and tools.</p>
            </div>

            <div className="card">
              <h4>Project Strength</h4>
              <h2 style={{ color: '#16A34A', margin: '0.5rem 0' }}>{analysis.project_score}/100</h2>
              <p style={{ fontSize: '0.85rem' }}>Evaluates practical software projects, architectural details, and features.</p>
            </div>

            <div className="card">
              <h4>Completeness Metric</h4>
              <h2 style={{ color: '#D97706', margin: '0.5rem 0' }}>{analysis.completeness_score}/100</h2>
              <p style={{ fontSize: '0.85rem' }}>Checks presence of contact info, education, degree, and skills section.</p>
            </div>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-2 gap-6">
            <div className="card">
              <h3 style={{ marginBottom: '1rem', color: '#16A34A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={20} /> Resume Strengths
              </h3>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.925rem' }}>
                {analysis.strengths.map((st, i) => (
                  <li key={i} style={{ marginBottom: '0.5rem' }}>{st}</li>
                ))}
              </ul>
            </div>

            <div className="card">
              <h3 style={{ marginBottom: '1rem', color: '#D97706', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={20} /> Recommendations for Improvement
              </h3>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.925rem' }}>
                {analysis.weaknesses.map((w, i) => (
                  <li key={i} style={{ marginBottom: '0.5rem' }}>{w}</li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
