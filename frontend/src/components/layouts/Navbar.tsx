import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from '../ThemeToggle';
import { 
  Briefcase, User as UserIcon, FileText, Target, PlayCircle, 
  BarChart2, Shield, LogOut, Code, Map, ChevronDown, History
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
  const isPracticeActive = ['setup', 'live', 'coding', 'history', 'result', 'aptitude', 'aptitude_landing', 'aptitude_test', 'aptitude_result', 'aptitude_history'].includes(activeTab);

  const getNavBtnClass = (isActive: boolean) => 
    `nav-item-btn ${isActive ? 'nav-item-btn-active' : ''}`;

  return (
    <header className="navbar-header" style={{ background: 'var(--bg-header)', borderBottom: '1px solid var(--primary-border)', position: 'sticky', top: 0, zIndex: 100, transition: 'background-color 0.2s ease, border-color 0.2s ease' }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '70px' }}>
        
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab(user ? 'dashboard' : 'landing')} 
          style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer' }}
        >
          <div style={{ 
            width: '36px', height: '36px', borderRadius: '8px', 
            background: '#2563EB', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF',
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)'
          }}>
            <Briefcase size={20} />
          </div>
          <div>
            <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--main-heading)', letterSpacing: '-0.02em', display: 'block', lineHeight: 1 }}>INTERVUEX</span>
            <span style={{ fontSize: '0.65rem', color: 'var(--secondary-text)', fontWeight: '700', letterSpacing: '0.06em', marginTop: '2px', display: 'block' }}>AI CAREER PLATFORM</span>
          </div>
        </div>

        {/* Navigation Links & Controls */}
        {user ? (
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {/* Dashboard */}
            <button 
              className={getNavBtnClass(activeTab === 'dashboard')}
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
              className={getNavBtnClass(activeTab === 'profile')}
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
                className={getNavBtnClass(isCareerActive)}
                onClick={() => {
                  setCareerOpen(!careerOpen);
                  setPracticeOpen(false);
                }}
              >
                <Briefcase size={16} /> Career <ChevronDown size={14} style={{ transform: careerOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>

              {careerOpen && (
                <div className="nav-dropdown-menu" style={{
                  position: 'absolute', top: '115%', left: 0, background: 'var(--bg-card)', border: '1px solid var(--primary-border)',
                  borderRadius: '10px', boxShadow: 'var(--shadow-md)', padding: '0.4rem',
                  minWidth: '175px', display: 'flex', flexDirection: 'column', gap: '0.2rem', zIndex: 110
                }}>
                  <button 
                    className="btn nav-dropdown-item"
                    style={{ justifyContent: 'flex-start', border: 'none', background: activeTab === 'resume' ? 'var(--soft-blue)' : 'transparent', color: 'var(--main-heading)', fontWeight: activeTab === 'resume' ? '700' : '500', padding: '0.45rem 0.75rem' }}
                    onClick={() => { setActiveTab('resume'); setCareerOpen(false); }}
                  >
                    <FileText size={15} color="#2563EB" /> Resume
                  </button>
                  <button 
                    className="btn nav-dropdown-item"
                    style={{ justifyContent: 'flex-start', border: 'none', background: activeTab === 'job' ? 'var(--soft-blue)' : 'transparent', color: 'var(--main-heading)', fontWeight: activeTab === 'job' ? '700' : '500', padding: '0.45rem 0.75rem' }}
                    onClick={() => { setActiveTab('job'); setCareerOpen(false); }}
                  >
                    <Target size={15} color="#15803D" /> Job Match
                  </button>
                  <button 
                    className="btn nav-dropdown-item"
                    style={{ justifyContent: 'flex-start', border: 'none', background: activeTab === 'roadmap' ? 'var(--soft-blue)' : 'transparent', color: 'var(--main-heading)', fontWeight: activeTab === 'roadmap' ? '700' : '500', padding: '0.45rem 0.75rem' }}
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
                className={getNavBtnClass(isPracticeActive)}
                onClick={() => {
                  setPracticeOpen(!practiceOpen);
                  setCareerOpen(false);
                }}
              >
                <PlayCircle size={16} /> Practice <ChevronDown size={14} style={{ transform: practiceOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>

              {practiceOpen && (
                <div className="nav-dropdown-menu" style={{
                  position: 'absolute', top: '115%', left: 0, background: 'var(--bg-card)', border: '1px solid var(--primary-border)',
                  borderRadius: '10px', boxShadow: 'var(--shadow-md)', padding: '0.4rem',
                  minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '0.2rem', zIndex: 110
                }}>
                  <button 
                    className="btn nav-dropdown-item"
                    style={{ justifyContent: 'flex-start', border: 'none', background: activeTab === 'aptitude' || activeTab.startsWith('aptitude_') ? 'var(--soft-blue)' : 'transparent', color: 'var(--main-heading)', fontWeight: activeTab === 'aptitude' || activeTab.startsWith('aptitude_') ? '700' : '500', padding: '0.45rem 0.75rem' }}
                    onClick={() => { setActiveTab('aptitude'); setPracticeOpen(false); }}
                  >
                    <BarChart2 size={15} color="#0F766E" /> Aptitude Test
                  </button>
                  <button 
                    className="btn nav-dropdown-item"
                    style={{ justifyContent: 'flex-start', border: 'none', background: activeTab === 'setup' || activeTab === 'live' ? 'var(--soft-blue)' : 'transparent', color: 'var(--main-heading)', fontWeight: activeTab === 'setup' || activeTab === 'live' ? '700' : '500', padding: '0.45rem 0.75rem' }}
                    onClick={() => { setActiveTab('setup'); setPracticeOpen(false); }}
                  >
                    <PlayCircle size={15} color="#2563EB" /> Mock Interview
                  </button>
                  <button 
                    className="btn nav-dropdown-item"
                    style={{ justifyContent: 'flex-start', border: 'none', background: activeTab === 'history' || activeTab === 'result' ? 'var(--soft-blue)' : 'transparent', color: 'var(--main-heading)', fontWeight: activeTab === 'history' ? '700' : '500', padding: '0.45rem 0.75rem' }}
                    onClick={() => { setActiveTab('history'); setPracticeOpen(false); }}
                  >
                    <History size={15} color="#8B5CF6" /> Interview Sessions
                  </button>
                  <button 
                    className="btn nav-dropdown-item"
                    style={{ justifyContent: 'flex-start', border: 'none', background: activeTab === 'coding' ? 'var(--soft-blue)' : 'transparent', color: 'var(--main-heading)', fontWeight: activeTab === 'coding' ? '700' : '500', padding: '0.45rem 0.75rem' }}
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
                className={getNavBtnClass(activeTab === 'admin')}
                onClick={() => {
                  setActiveTab('admin');
                  setCareerOpen(false);
                  setPracticeOpen(false);
                }}
              >
                <Shield size={16} /> Admin
              </button>
            )}

            {/* Theme Toggle Feature (Top Right) */}
            <div style={{ marginLeft: '0.35rem', marginRight: '0.15rem' }}>
              <ThemeToggle showLabel={false} />
            </div>

            {/* Logout */}
            <button 
              className="btn btn-outline nav-logout-btn" 
              onClick={logout} 
              title="Logout" 
              style={{ gap: '0.35rem', padding: '0.5rem 0.85rem', marginLeft: '0.25rem' }}
            >
              <LogOut size={16} /> Logout
            </button>
          </nav>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Theme Toggle in Guest Mode */}
            <ThemeToggle showLabel={false} />
            <button className="btn btn-outline" onClick={() => setActiveTab('login')}>Sign In</button>
            <button className="btn btn-action" onClick={() => setActiveTab('register')}>Register</button>
          </div>
        )}

      </div>
    </header>
  );
};
