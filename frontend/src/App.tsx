import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layouts/Navbar';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { ResumePage } from './pages/ResumePage';
import { JobMatchPage } from './pages/JobMatchPage';
import { InterviewSetupPage } from './pages/InterviewSetupPage';
import { LiveInterviewPage } from './pages/LiveInterviewPage';
import { CodingInterviewPage } from './pages/CodingInterviewPage';
import { InterviewResultPage } from './pages/InterviewResultPage';
import { SkillGapPage } from './pages/SkillGapPage';
import { RoadmapPage } from './pages/RoadmapPage';
import { HistoryPage } from './pages/HistoryPage';
import { AdminPage } from './pages/AdminPage';

const MainContent: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>(user ? 'dashboard' : 'landing');
  const [activeInterviewId, setActiveInterviewId] = useState<number | null>(null);
  const [activeJobId, setActiveJobId] = useState<number | undefined>(undefined);

  const handleStartInterviewWithJob = (jobId: number) => {
    setActiveJobId(jobId);
    setActiveTab('setup');
  };

  const handleInterviewCreated = (interviewId: number) => {
    setActiveInterviewId(interviewId);
    setActiveTab('live');
  };

  const handleInterviewCompleted = (interviewId: number) => {
    setActiveInterviewId(interviewId);
    setActiveTab('result');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F8FAFC' }}>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main style={{ flex: 1 }}>
        {activeTab === 'landing' && <LandingPage onStart={() => setActiveTab(user ? 'dashboard' : 'login')} />}
        {activeTab === 'login' && <LoginPage onSuccess={() => setActiveTab('dashboard')} onSwitchToRegister={() => setActiveTab('register')} />}
        {activeTab === 'register' && <RegisterPage onSuccess={() => setActiveTab('dashboard')} onSwitchToLogin={() => setActiveTab('login')} />}

        {user && (
          <>
            {activeTab === 'dashboard' && (
              <DashboardPage onNavigate={(tab, extraId) => {
                if (tab === 'result' && extraId) setActiveInterviewId(extraId);
                setActiveTab(tab);
              }} />
            )}
            {activeTab === 'profile' && <ProfilePage />}
            {activeTab === 'resume' && <ResumePage />}
            {activeTab === 'job' && <JobMatchPage onStartInterviewWithJob={handleStartInterviewWithJob} />}
            {activeTab === 'setup' && <InterviewSetupPage initialJobId={activeJobId} onInterviewCreated={handleInterviewCreated} />}
            {activeTab === 'live' && activeInterviewId && (
              <LiveInterviewPage interviewId={activeInterviewId} onComplete={handleInterviewCompleted} />
            )}
            {activeTab === 'coding' && <CodingInterviewPage />}
            {activeTab === 'result' && activeInterviewId && (
              <InterviewResultPage interviewId={activeInterviewId} onNavigate={setActiveTab} />
            )}
            {activeTab === 'skillgap' && <SkillGapPage onNavigateToRoadmap={() => setActiveTab('roadmap')} />}
            {activeTab === 'roadmap' && <RoadmapPage />}
            {activeTab === 'history' && <HistoryPage onNavigateToResult={(id) => { setActiveInterviewId(id); setActiveTab('result'); }} />}
            {activeTab === 'admin' && <AdminPage />}
          </>
        )}
      </main>

      {/* Corporate Footer */}
      <footer style={{ background: '#FFFFFF', borderTop: '1px solid #E2E8F0', padding: '1.75rem 0', marginTop: 'auto', textAlign: 'center' }}>
        <div className="container">
          <p style={{ color: '#64748B', fontSize: '0.875rem' }}>
            IntervueX © 2026. Adaptive AI Interview & Career Readiness SaaS Platform. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
};

export default App;
