import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { CandidateProfile } from '../types';
import { User, BookOpen, Code, FolderGit2, Award, Plus, Save, CheckCircle, Trash2, X } from 'lucide-react';

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

  // Add Skill state
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCat, setNewSkillCat] = useState('Language');

  // Add Project state
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
        setTargetRole(data.target_role || 'Python Backend Developer');
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
      const sk = await api.addSkill({ name: newSkillName.trim(), category: newSkillCat, proficiency: 'Intermediate' });
      setProfile(prev => prev ? { ...prev, skills: [...prev.skills, sk] } : null);
      setNewSkillName('');
      setMsg(`Skill "${sk.name}" added successfully.`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteSkill = async (skillId: number, skillName: string) => {
    try {
      await api.deleteSkill(skillId);
      setProfile(prev => prev ? { ...prev, skills: prev.skills.filter(s => s.id !== skillId) } : null);
      setMsg(`Skill "${skillName}" removed.`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddProject = async () => {
    if (!newProjTitle.trim()) return;
    try {
      const p = await api.addProject({
        title: newProjTitle.trim(),
        description: newProjDesc.trim() || 'Software engineering candidate project',
        technologies: newProjTech.trim() || 'Python, SQL',
        responsibilities: 'Designed core features and system architecture',
        features: 'User authentication, data processing'
      });
      setProfile(prev => prev ? { ...prev, projects: [...prev.projects, p] } : null);
      setNewProjTitle('');
      setNewProjDesc('');
      setNewProjTech('');
      setMsg(`Project "${p.title}" added and saved to your profile!`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteProject = async (projectId: number, projectTitle: string) => {
    try {
      await api.deleteProject(projectId);
      setProfile(prev => prev ? { ...prev, projects: prev.projects.filter(p => p.id !== projectId) } : null);
      setMsg(`Project "${projectTitle}" removed.`);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center' }}>Loading candidate profile...</div>;

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', maxWidth: '1000px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2>Candidate Profile & Portfolio</h2>
        <p>Save your personal candidate profile, technical skills stack, and projects. The AI interviewer will tailor questions directly to your saved data.</p>
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

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', marginBottom: '1.5rem' }}>
          {profile?.skills && profile.skills.length > 0 ? (
            profile.skills.map((s, idx) => (
              <span key={s.id || idx} className="badge badge-primary" style={{ fontSize: '0.85rem', padding: '0.45rem 0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                {s.name} ({s.category})
                <button 
                  type="button" 
                  onClick={() => handleDeleteSkill(s.id, s.name)} 
                  style={{ background: 'transparent', border: 'none', color: '#93C5FD', cursor: 'pointer', display: 'inline-flex', padding: 0 }}
                  title="Remove Skill"
                >
                  <X size={14} color="#FFFFFF" />
                </button>
              </span>
            ))
          ) : (
            <p style={{ color: '#64748B' }}>No skills added yet. Add your technical skills below.</p>
          )}
        </div>

        {/* Quick Add Skill Form */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', background: '#F8FAFC', padding: '1rem', borderRadius: '8px', flexWrap: 'wrap' }}>
          <input className="form-input" style={{ flex: 1, minWidth: '200px' }} placeholder="Add Skill Name (e.g. FastAPI, PostgreSQL, React)" value={newSkillName} onChange={e => setNewSkillName(e.target.value)} />
          <select className="form-select" value={newSkillCat} onChange={e => setNewSkillCat(e.target.value)} style={{ width: '160px' }}>
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
          <FolderGit2 size={20} color="#2563EB" /> Your Software Development Projects
        </h3>

        {profile?.projects && profile.projects.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            {profile.projects.map((p, idx) => (
              <div key={p.id || idx} style={{ padding: '1.25rem', border: '1px solid #E2E8F0', borderRadius: '10px', background: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ color: '#1E3A5F', marginBottom: '0.35rem', fontSize: '1.05rem' }}>{p.title}</h4>
                  <p style={{ fontSize: '0.9rem', color: '#334155', marginBottom: '0.6rem' }}>{p.description}</p>
                  <span className="badge badge-neutral" style={{ fontSize: '0.8rem' }}>Technologies: {p.technologies}</span>
                </div>
                <button 
                  type="button"
                  className="btn btn-sm btn-outline" 
                  style={{ borderColor: '#FECACA', color: '#DC2626' }}
                  onClick={() => handleDeleteProject(p.id, p.title)}
                  title="Delete Project"
                >
                  <Trash2 size={14} /> Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#64748B', marginBottom: '1.25rem' }}>No projects saved yet. Add your personal software projects below.</p>
        )}

        <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
          <h4 style={{ marginBottom: '0.85rem', color: '#1E3A5F' }}>Type and Save New Project</h4>
          <div className="form-group">
            <label className="form-label">Project Title</label>
            <input className="form-input" placeholder="e.g. E-Commerce Web Application / Smart File Sharing" value={newProjTitle} onChange={e => setNewProjTitle(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Project Description</label>
            <textarea className="form-textarea" placeholder="Describe the purpose, core modules, and architecture of your project..." value={newProjDesc} onChange={e => setNewProjDesc(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Technologies Used</label>
            <input className="form-input" placeholder="e.g. Python, FastAPI, PostgreSQL, Docker, React" value={newProjTech} onChange={e => setNewProjTech(e.target.value)} />
          </div>
          <button className="btn btn-action" onClick={handleAddProject} type="button">
            <Plus size={16} /> Save Project To Profile
          </button>
        </div>
      </div>
    </div>
  );
};

