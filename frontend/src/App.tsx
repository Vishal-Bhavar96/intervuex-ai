import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
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

// Aptitude Assessment Imports
import { AptitudeLandingPage } from './pages/AptitudeLandingPage';
import { AptitudeSecurityCheckPage } from './pages/AptitudeSecurityCheckPage';
import { AptitudeTestPage } from './pages/AptitudeTestPage';
import { AptitudeResultPage } from './pages/AptitudeResultPage';
import { AptitudeHistoryPage } from './pages/AptitudeHistoryPage';
import { api } from './services/api';
import { AptitudeAttemptState, AptitudeResult } from './types/aptitude';

const MainContent: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>(user ? 'dashboard' : 'landing');
  const [activeInterviewId, setActiveInterviewId] = useState<number | null>(null);
  const [activeJobId, setActiveJobId] = useState<number | undefined>(undefined);

  // Aptitude State
  const [aptitudeCompanyPattern, setAptitudeCompanyPattern] = useState<string>('General MNC');
  const [aptitudeDifficultyMode, setAptitudeDifficultyMode] = useState<string>('Mixed');
  const [aptitudeAttemptState, setAptitudeAttemptState] = useState<AptitudeAttemptState | null>(null);
  const [aptitudeResult, setAptitudeResult] = useState<AptitudeResult | null>(null);
  const [aptitudeMediaStream, setAptitudeMediaStream] = useState<MediaStream | null>(null);

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

  // Aptitude Handlers
  const handleStartConfiguredAptitudeTest = (companyPattern: string, difficultyMode: string) => {
    setAptitudeCompanyPattern(companyPattern);
    setAptitudeDifficultyMode(difficultyMode);
    setActiveTab('aptitude_security');
  };

  const handleProceedToAptitudeTest = async (stream: MediaStream | null) => {
    setAptitudeMediaStream(stream);
    try {
      const state = await api.startAptitudeTest({
        company_pattern: aptitudeCompanyPattern,
        difficulty_mode: aptitudeDifficultyMode,
        total_questions: 40,
        duration_minutes: 45
      });
      setAptitudeAttemptState(state);
      setActiveTab('aptitude_test');
    } catch (e) {
      alert('Failed to start Aptitude Test. Please try again.');
    }
  };

  const handleAptitudeTestCompleted = async (attemptId: number) => {
    try {
      const res = await api.getAptitudeResult(attemptId);
      setAptitudeResult(res);
      setActiveTab('aptitude_result');
    } catch (e) {
      alert('Failed to load assessment result.');
    }
  };

  const handleViewAptitudeHistoryResult = async (attemptId: number) => {
    try {
      const res = await api.getAptitudeResult(attemptId);
      setAptitudeResult(res);
      setActiveTab('aptitude_result');
    } catch (e) {
      alert('Failed to load result details.');
    }
  };

  // Suppress top navbar during focused examination
  const isAssessmentTakingMode = activeTab === 'aptitude_test';

  return (
    <div className="app-root-layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-main)', color: 'var(--body-text)', transition: 'background-color 0.25s ease, color 0.25s ease' }}>
      {!isAssessmentTakingMode && <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />}

      <main style={{ flex: 1 }}>
        {activeTab === 'landing' && <LandingPage onStart={() => setActiveTab(user ? 'dashboard' : 'login')} />}
        {activeTab === 'login' && <LoginPage onSuccess={() => setActiveTab('dashboard')} onSwitchToRegister={() => setActiveTab('register')} />}
        {activeTab === 'register' && <RegisterPage onSuccess={() => setActiveTab('dashboard')} onSwitchToLogin={() => setActiveTab('login')} />}

        {!user && !['landing', 'login', 'register'].includes(activeTab) && (
          <LoginPage onSuccess={() => setActiveTab(activeTab === 'setup' ? 'setup' : 'dashboard')} onSwitchToRegister={() => setActiveTab('register')} />
        )}

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

            {/* APTITUDE ASSESSMENT MODULE ROUTES */}
            {activeTab === 'aptitude' && (
              <AptitudeLandingPage
                onStartConfiguredTest={handleStartConfiguredAptitudeTest}
                onViewHistory={() => setActiveTab('aptitude_history')}
              />
            )}
            {activeTab === 'aptitude_security' && (
              <AptitudeSecurityCheckPage
                companyPattern={aptitudeCompanyPattern}
                difficultyMode={aptitudeDifficultyMode}
                onProceedToTest={handleProceedToAptitudeTest}
                onCancel={() => setActiveTab('aptitude')}
              />
            )}
            {activeTab === 'aptitude_test' && aptitudeAttemptState && (
              <AptitudeTestPage
                attemptState={aptitudeAttemptState}
                mediaStream={aptitudeMediaStream}
                onComplete={handleAptitudeTestCompleted}
              />
            )}
            {activeTab === 'aptitude_result' && aptitudeResult && (
              <AptitudeResultPage
                result={aptitudeResult}
                onRetake={() => setActiveTab('aptitude')}
                onBackToDashboard={() => setActiveTab('dashboard')}
              />
            )}
            {activeTab === 'aptitude_history' && (
              <AptitudeHistoryPage
                onViewResult={handleViewAptitudeHistoryResult}
                onStartNewTest={() => setActiveTab('aptitude')}
              />
            )}
          </>
        )}
      </main>

      {/* Corporate Footer (Hidden during focused examination mode) */}
      {!isAssessmentTakingMode && (
        <footer style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--primary-border)', padding: '1.75rem 0', marginTop: 'auto', textAlign: 'center', transition: 'background-color 0.25s ease, border-color 0.25s ease' }}>
          <div className="container">
            <p style={{ color: 'var(--secondary-text)', fontSize: '0.875rem' }}>
              IntervueX © 2026. Adaptive AI Interview & Career Readiness SaaS Platform. All Rights Reserved.
            </p>
          </div>
        </footer>
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainContent />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
