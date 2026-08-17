import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Briefcase, User as UserIcon, FileText, Target, PlayCircle, 
  BarChart2, Shield, LogOut, Code, Map, ChevronDown
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { user, logout, isAdmin } = useAuth();
  const [careerOpen, setCareerOpen] = useState(false);
  const [practiceOpen, setPracticeOpen] = useState(false);

  const careerRef = useRef<HTMLDivElement>(null);
  const practiceRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (careerRef.current && !careerRef.current.contains(event.target as Node)) {
        setCareerOpen(false);
      }
      if (practiceRef.current && !practiceRef.current.contains(event.target as Node)) {
        setPracticeOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isCareerActive = ['resume', 'job', 'roadmap'].includes(activeTab);
  const isPracticeActive = ['setup', 'live', 'coding', 'aptitude', 'aptitude_landing', 'aptitude_test', 'aptitude_result', 'aptitude_history'].includes(activeTab);

  const getNavBtnStyle = (isActive: boolean) => ({
    background: isActive ? '#1E3A5F' : 'transparent',
    color: isActive ? '#FFFFFF' : '#0F172A',
    border: '1px solid ' + (isActive ? '#1E3A5F' : 'transparent'),
    fontWeight: isActive ? ('700' as const) : ('600' as const),
    padding: '0.5rem 0.95rem',
    borderRadius: '8px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.45rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    transition: 'all 0.15s ease'
  });

  return (
    <header style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', position: 'sticky', top: 0, zIndex: 100 }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '70px' }}>
        
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab(user ? 'dashboard' : 'landing')} 
          style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer' }}
        >
          <div style={{ 
            width: '36px', height: '36px', borderRadius: '8px', 
            background: '#2563EB', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF' 
          }}>
            <Briefcase size={20} />
          </div>
          <div>
            <span style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1E3A5F', letterSpacing: '-0.02em', display: 'block', lineHeight: 1 }}>INTERVUEX</span>
            <span style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: '700', letterSpacing: '0.06em', marginTop: '2px', display: 'block' }}>AI CAREER PLATFORM</span>
          </div>
        </div>

        {/* Navigation Links */}
        {user ? (
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {/* Dashboard */}
            <button 
              style={getNavBtnStyle(activeTab === 'dashboard')}
              onClick={() => {
                setActiveTab('dashboard');
                setCareerOpen(false);
                setPracticeOpen(false);
              }}
            >
              <BarChart2 size={16} /> Dashboard
            </button>

            {/* Profile */}
            <button 
              style={getNavBtnStyle(activeTab === 'profile')}
              onClick={() => {
                setActiveTab('profile');
                setCareerOpen(false);
                setPracticeOpen(false);
              }}
            >
              <UserIcon size={16} /> Profile
            </button>

            {/* Career Dropdown */}
            <div ref={careerRef} style={{ position: 'relative' }}>
              <button 
                style={getNavBtnStyle(isCareerActive)}
                onClick={() => {
                  setCareerOpen(!careerOpen);
                  setPracticeOpen(false);
                }}
              >
                <Briefcase size={16} /> Career <ChevronDown size={14} style={{ transform: careerOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>

              {careerOpen && (
                <div style={{
                  position: 'absolute', top: '115%', left: 0, background: '#FFFFFF', border: '1px solid #E2E8F0',
                  borderRadius: '10px', boxShadow: '0 4px 12px rgba(15,23,42,0.08)', padding: '0.4rem',
                  minWidth: '175px', display: 'flex', flexDirection: 'column', gap: '0.2rem', zIndex: 110
                }}>
                  <button 
                    className="btn"
                    style={{ justifyContent: 'flex-start', border: 'none', background: activeTab === 'resume' ? '#F1F5F9' : 'transparent', color: '#0F172A', fontWeight: activeTab === 'resume' ? '700' : '500', padding: '0.45rem 0.75rem' }}
                    onClick={() => { setActiveTab('resume'); setCareerOpen(false); }}
                  >
                    <FileText size={15} color="#2563EB" /> Resume
                  </button>
                  <button 
                    className="btn"
                    style={{ justifyContent: 'flex-start', border: 'none', background: activeTab === 'job' ? '#F1F5F9' : 'transparent', color: '#0F172A', fontWeight: activeTab === 'job' ? '700' : '500', padding: '0.45rem 0.75rem' }}
                    onClick={() => { setActiveTab('job'); setCareerOpen(false); }}
                  >
                    <Target size={15} color="#15803D" /> Job Match
                  </button>
                  <button 
                    className="btn"
                    style={{ justifyContent: 'flex-start', border: 'none', background: activeTab === 'roadmap' ? '#F1F5F9' : 'transparent', color: '#0F172A', fontWeight: activeTab === 'roadmap' ? '700' : '500', padding: '0.45rem 0.75rem' }}
                    onClick={() => { setActiveTab('roadmap'); setCareerOpen(false); }}
                  >
                    <Map size={15} color="#B45309" /> Roadmap
                  </button>
                </div>
              )}
            </div>

            {/* Practice Dropdown */}
            <div ref={practiceRef} style={{ position: 'relative' }}>
              <button 
                style={getNavBtnStyle(isPracticeActive)}
                onClick={() => {
                  setPracticeOpen(!practiceOpen);
                  setCareerOpen(false);
                }}
              >
                <PlayCircle size={16} /> Practice <ChevronDown size={14} style={{ transform: practiceOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>

              {practiceOpen && (
                <div style={{
                  position: 'absolute', top: '115%', left: 0, background: '#FFFFFF', border: '1px solid #E2E8F0',
                  borderRadius: '10px', boxShadow: '0 4px 12px rgba(15,23,42,0.08)', padding: '0.4rem',
                  minWidth: '185px', display: 'flex', flexDirection: 'column', gap: '0.2rem', zIndex: 110
                }}>
                  <button 
                    className="btn"
                    style={{ justifyContent: 'flex-start', border: 'none', background: activeTab === 'aptitude' || activeTab.startsWith('aptitude_') ? '#F1F5F9' : 'transparent', color: '#0F172A', fontWeight: activeTab === 'aptitude' || activeTab.startsWith('aptitude_') ? '700' : '500', padding: '0.45rem 0.75rem' }}
                    onClick={() => { setActiveTab('aptitude'); setPracticeOpen(false); }}
                  >
                    <BarChart2 size={15} color="#0F766E" /> Aptitude Test
                  </button>
                  <button 
                    className="btn"
                    style={{ justifyContent: 'flex-start', border: 'none', background: activeTab === 'setup' || activeTab === 'live' ? '#F1F5F9' : 'transparent', color: '#0F172A', fontWeight: activeTab === 'setup' || activeTab === 'live' ? '700' : '500', padding: '0.45rem 0.75rem' }}
                    onClick={() => { setActiveTab('setup'); setPracticeOpen(false); }}
                  >
                    <PlayCircle size={15} color="#2563EB" /> Mock Interview
                  </button>
                  <button 
                    className="btn"
                    style={{ justifyContent: 'flex-start', border: 'none', background: activeTab === 'coding' ? '#F1F5F9' : 'transparent', color: '#0F172A', fontWeight: activeTab === 'coding' ? '700' : '500', padding: '0.45rem 0.75rem' }}
                    onClick={() => { setActiveTab('coding'); setPracticeOpen(false); }}
                  >
                    <Code size={15} color="#1E3A5F" /> Coding IDE
                  </button>
                </div>
              )}
            </div>

            {/* Admin (if admin role) */}
            {isAdmin && (
              <button 
                style={getNavBtnStyle(activeTab === 'admin')}
                onClick={() => {
                  setActiveTab('admin');
                  setCareerOpen(false);
                  setPracticeOpen(false);
                }}
              >
                <Shield size={16} /> Admin
              </button>
            )}

            {/* Logout */}
            <button 
              className="btn btn-outline" 
              onClick={logout} 
              title="Logout" 
              style={{ gap: '0.35rem', color: '#475569', borderColor: '#E2E8F0', padding: '0.5rem 0.85rem' }}
            >
              <LogOut size={16} /> Logout
            </button>
          </nav>
        ) : (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-outline" onClick={() => setActiveTab('login')}>Sign In</button>
            <button className="btn btn-action" onClick={() => setActiveTab('register')}>Register</button>
          </div>
        )}

      </div>
    </header>
  );
};
