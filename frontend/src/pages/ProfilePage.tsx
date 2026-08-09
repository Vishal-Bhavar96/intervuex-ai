import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { CandidateProfile } from '../types';
import { User, BookOpen, Code, FolderGit2, Award, Plus, Save, CheckCircle } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  // Form states
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [expLevel, setExpLevel] = useState('Entry-Level');
  const [industry, setIndustry] = useState('');

  // Add Skill modal state
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCat, setNewSkillCat] = useState('Language');

  // Add Project modal state
  const [newProjTitle, setNewProjTitle] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newProjTech, setNewProjTech] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getProfile();
        setProfile(data);
        setPhone(data.phone || '');
        setLocation(data.location || '');
        setTargetRole(data.target_role || 'Python Backend Engineer');
        setExpLevel(data.experience_level || 'Entry-Level');
        setIndustry(data.preferred_industry || 'Software & SaaS');
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      const updated = await api.updateProfile({
        phone,
        location,
        target_role: targetRole,
        experience_level: expLevel,
        preferred_industry: industry
      });
      setProfile(updated);
      setMsg('Profile updated successfully!');
    } catch (err: any) {
      setMsg('Error saving profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = async () => {
    if (!newSkillName.trim()) return;
    try {
      const sk = await api.addSkill({ name: newSkillName, category: newSkillCat, proficiency: 'Intermediate' });
      setProfile(prev => prev ? { ...prev, skills: [...prev.skills, sk] } : null);
      setNewSkillName('');
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddProject = async () => {
    if (!newProjTitle.trim()) return;
    try {
      const p = await api.addProject({
        title: newProjTitle,
        description: newProjDesc,
        technologies: newProjTech,
        responsibilities: 'Implemented core logic',
        features: 'User authentication, data processing'
      });
      setProfile(prev => prev ? { ...prev, projects: [...prev.projects, p] } : null);
      setNewProjTitle('');
      setNewProjDesc('');
      setNewProjTech('');
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center' }}>Loading candidate profile...</div>;

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', maxWidth: '1000px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2>Candidate Profile</h2>
        <p>Keep your technical skills, projects, and target role updated for precise AI interview generation.</p>
      </div>

      {msg && (
        <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#16A34A', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={18} /> {msg}
        </div>
      )}

      {/* Personal & Career Information */}
      <form onSubmit={handleSaveProfile} className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <User size={20} color="#2563EB" /> Career & Contact Details
        </h3>

        <div className="grid grid-2 gap-4">
          <div className="form-group">
            <label className="form-label">Target Job Role</label>
            <input className="form-input" value={targetRole} onChange={e => setTargetRole(e.target.value)} placeholder="e.g. Python Backend Developer" required />
          </div>

          <div className="form-group">
            <label className="form-label">Experience Level</label>
            <select className="form-select" value={expLevel} onChange={e => setExpLevel(e.target.value)}>
              <option value="Entry-Level">Entry-Level / Fresher</option>
              <option value="Mid-Level">Mid-Level (2-5 Years)</option>
              <option value="Senior">Senior (5+ Years)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input className="form-input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" />
          </div>

          <div className="form-group">
            <label className="form-label">Location</label>
            <input className="form-input" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. San Francisco, CA" />
          </div>
        </div>

        <button type="submit" className="btn btn-action" disabled={saving} style={{ marginTop: '0.5rem' }}>
          <Save size={16} /> {saving ? 'Saving...' : 'Save Profile Changes'}
        </button>
      </form>

      {/* Technical Skills Section */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Code size={20} color="#2563EB" /> Technical Skills Stack
          </h3>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {profile?.skills && profile.skills.length > 0 ? (
            profile.skills.map((s, idx) => (
              <span key={idx} className="badge badge-primary" style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}>
                {s.name} ({s.category})
              </span>
            ))
          ) : (
            <p style={{ color: '#64748B' }}>No skills added yet. Upload resume or add manually below.</p>
          )}
        </div>

        {/* Quick Add Skill Form */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', background: '#F8FAFC', padding: '1rem', borderRadius: '8px' }}>
          <input className="form-input" placeholder="Add Skill Name (e.g. FastAPI, PostgreSQL)" value={newSkillName} onChange={e => setNewSkillName(e.target.value)} />
          <select className="form-select" value={newSkillCat} onChange={e => setNewSkillCat(e.target.value)} style={{ width: '180px' }}>
            <option value="Language">Language</option>
            <option value="Framework">Framework</option>
            <option value="Database">Database</option>
            <option value="DevOps">DevOps</option>
            <option value="Tool">Tool</option>
          </select>
          <button className="btn btn-action" onClick={handleAddSkill} type="button">
            <Plus size={16} /> Add Skill
          </button>
        </div>
      </div>

      {/* Projects Section */}
      <div className="card">
        <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FolderGit2 size={20} color="#2563EB" /> Software Development Projects
        </h3>

        {profile?.projects && profile.projects.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            {profile.projects.map((p, idx) => (
              <div key={idx} style={{ padding: '1rem', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
                <h4 style={{ color: '#1E3A5F', marginBottom: '0.25rem' }}>{p.title}</h4>
                <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>{p.description}</p>
                <span className="badge badge-neutral">Technologies: {p.technologies}</span>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#64748B', marginBottom: '1rem' }}>No projects added yet.</p>
        )}

        <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '8px' }}>
          <div className="form-group">
            <input className="form-input" placeholder="Project Title (e.g. Secure File Sharing Platform)" value={newProjTitle} onChange={e => setNewProjTitle(e.target.value)} />
          </div>
          <div className="form-group">
            <textarea className="form-textarea" placeholder="Project Description & Features" value={newProjDesc} onChange={e => setNewProjDesc(e.target.value)} />
          </div>
          <div className="form-group">
            <input className="form-input" placeholder="Technologies Used (e.g. Python, Django, SQL, Cryptography)" value={newProjTech} onChange={e => setNewProjTech(e.target.value)} />
          </div>
          <button className="btn btn-action" onClick={handleAddProject} type="button">
            <Plus size={16} /> Add Project
          </button>
        </div>
      </div>
    </div>
  );
};
