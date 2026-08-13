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

  return (
    <header style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', position: 'sticky', top: 0, zIndex: 100 }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '70px' }}>
        
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab(user ? 'dashboard' : 'landing')} 
          style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer' }}
        >
          <div style={{ 
            width: '38px', height: '38px', borderRadius: '10px', 
            background: 'linear-gradient(135deg, #1E3A5F 0%, #2563EB 100%)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' 
          }}>
            <Briefcase size={22} />
          </div>
          <div>
            <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1E3A5F', letterSpacing: '-0.03em' }}>INTERVUEX</span>
            <span style={{ fontSize: '0.65rem', display: 'block', color: '#64748B', fontWeight: '700', marginTop: '-4px', letterSpacing: '0.05em' }}>AI CAREER PLATFORM</span>
          </div>
        </div>

        {/* Navigation Links */}
        {user ? (
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* Dashboard */}
            <button 
              className={`btn ${activeTab === 'dashboard' ? 'btn-primary' : 'btn-outline'}`}
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
              className={`btn ${activeTab === 'profile' ? 'btn-primary' : 'btn-outline'}`}
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
                className={`btn ${isCareerActive ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => {
                  setCareerOpen(!careerOpen);
                  setPracticeOpen(false);
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <Briefcase size={16} /> Career <ChevronDown size={14} style={{ transform: careerOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>

              {careerOpen && (
                <div style={{
                  position: 'absolute', top: '110%', left: 0, background: '#FFFFFF', border: '1px solid #E2E8F0',
                  borderRadius: '10px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '0.5rem',
                  minWidth: '170px', display: 'flex', flexDirection: 'column', gap: '0.25rem', zIndex: 110
                }}>
                  <button 
                    className="btn btn-outline" 
                    style={{ justifyContent: 'flex-start', border: 'none', background: activeTab === 'resume' ? '#F1F5F9' : 'transparent', fontWeight: activeTab === 'resume' ? '700' : '500' }}
                    onClick={() => { setActiveTab('resume'); setCareerOpen(false); }}
                  >
                    <FileText size={15} color="#2563EB" /> Resume
                  </button>
                  <button 
                    className="btn btn-outline" 
                    style={{ justifyContent: 'flex-start', border: 'none', background: activeTab === 'job' ? '#F1F5F9' : 'transparent', fontWeight: activeTab === 'job' ? '700' : '500' }}
                    onClick={() => { setActiveTab('job'); setCareerOpen(false); }}
                  >
                    <Target size={15} color="#059669" /> Job Match
                  </button>
                  <button 
                    className="btn btn-outline" 
                    style={{ justifyContent: 'flex-start', border: 'none', background: activeTab === 'roadmap' ? '#F1F5F9' : 'transparent', fontWeight: activeTab === 'roadmap' ? '700' : '500' }}
                    onClick={() => { setActiveTab('roadmap'); setCareerOpen(false); }}
                  >
                    <Map size={15} color="#D97706" /> Roadmap
                  </button>
                </div>
              )}
            </div>

            {/* Practice Dropdown */}
            <div ref={practiceRef} style={{ position: 'relative' }}>
              <button 
                className={`btn ${isPracticeActive ? 'btn-action' : 'btn-outline'}`}
                onClick={() => {
                  setPracticeOpen(!practiceOpen);
                  setCareerOpen(false);
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <PlayCircle size={16} /> Practice <ChevronDown size={14} style={{ transform: practiceOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>

              {practiceOpen && (
                <div style={{
                  position: 'absolute', top: '110%', left: 0, background: '#FFFFFF', border: '1px solid #E2E8F0',
                  borderRadius: '10px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '0.5rem',
                  minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '0.25rem', zIndex: 110
                }}>
                  <button 
                    className="btn btn-outline" 
                    style={{ justifyContent: 'flex-start', border: 'none', background: activeTab === 'aptitude' || activeTab.startsWith('aptitude_') ? '#F1F5F9' : 'transparent', fontWeight: activeTab === 'aptitude' || activeTab.startsWith('aptitude_') ? '700' : '500' }}
                    onClick={() => { setActiveTab('aptitude'); setPracticeOpen(false); }}
                  >
                    <BarChart2 size={15} color="#059669" /> Aptitude Test
                  </button>
                  <button 
                    className="btn btn-outline" 
                    style={{ justifyContent: 'flex-start', border: 'none', background: activeTab === 'setup' || activeTab === 'live' ? '#F1F5F9' : 'transparent', fontWeight: activeTab === 'setup' || activeTab === 'live' ? '700' : '500' }}
                    onClick={() => { setActiveTab('setup'); setPracticeOpen(false); }}
                  >
                    <PlayCircle size={15} color="#2563EB" /> Mock Interview
                  </button>
                  <button 
                    className="btn btn-outline" 
                    style={{ justifyContent: 'flex-start', border: 'none', background: activeTab === 'coding' ? '#F1F5F9' : 'transparent', fontWeight: activeTab === 'coding' ? '700' : '500' }}
                    onClick={() => { setActiveTab('coding'); setPracticeOpen(false); }}
                  >
                    <Code size={15} color="#7C3AED" /> Coding IDE
                  </button>
                </div>
              )}
            </div>

            {/* Admin (if admin role) */}
            {isAdmin && (
              <button 
                className={`btn ${activeTab === 'admin' ? 'btn-action' : 'btn-outline'}`}
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
            <button className="btn btn-outline" onClick={logout} title="Logout" style={{ gap: '0.35rem' }}>
              <LogOut size={16} /> Logout
            </button>
          </nav>
        ) : (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-outline" onClick={() => setActiveTab('login')}>Sign In</button>
            <button className="btn btn-action" onClick={() => setActiveTab('register')}>Get Started</button>
          </div>
        )}

      </div>
    </header>
  );
};
