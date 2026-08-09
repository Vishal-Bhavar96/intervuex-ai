import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Briefcase, User as UserIcon, FileText, Target, PlayCircle, 
  BarChart2, Shield, LogOut, Code, Map
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { user, logout, isAdmin } = useAuth();

  return (
    <header style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', sticky: 'top', zIndex: 100 }}>
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
            <button 
              className={`btn ${activeTab === 'dashboard' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <BarChart2 size={16} /> Dashboard
            </button>

            <button 
              className={`btn ${activeTab === 'profile' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab('profile')}
            >
              <UserIcon size={16} /> Profile
            </button>

            <button 
              className={`btn ${activeTab === 'resume' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab('resume')}
            >
              <FileText size={16} /> Resume
            </button>

            <button 
              className={`btn ${activeTab === 'job' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab('job')}
            >
              <Target size={16} /> Job Match
            </button>

            <button 
              className={`btn ${activeTab === 'setup' || activeTab === 'live' ? 'btn-action' : 'btn-outline'}`}
              onClick={() => setActiveTab('setup')}
            >
              <PlayCircle size={16} /> Mock Interview
            </button>

            <button 
              className={`btn ${activeTab === 'coding' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab('coding')}
            >
              <Code size={16} /> Coding IDE
            </button>

            <button 
              className={`btn ${activeTab === 'roadmap' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab('roadmap')}
            >
              <Map size={16} /> Roadmap
            </button>

            {isAdmin && (
              <button 
                className={`btn ${activeTab === 'admin' ? 'btn-action' : 'btn-outline'}`}
                onClick={() => setActiveTab('admin')}
              >
                <Shield size={16} /> Admin
              </button>
            )}

            <button className="btn btn-outline" onClick={logout} title="Sign Out">
              <LogOut size={16} />
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
