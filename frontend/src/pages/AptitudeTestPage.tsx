import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { AptitudeAttemptState, CandidateAptitudeQuestion } from '../types/aptitude';
import { 
  Clock, AlertTriangle, CheckCircle, Bookmark, ArrowLeft, ArrowRight, 
  Send, Camera, ShieldAlert, Wifi, Maximize2, RefreshCw,
  CameraOff, Mic, MicOff
} from 'lucide-react';

interface AptitudeTestPageProps {
  attemptState: AptitudeAttemptState;
  mediaStream: MediaStream | null;
  onComplete: (attemptId: number) => void;
}

export const AptitudeTestPage: React.FC<AptitudeTestPageProps> = ({
  attemptState: initialAttempt,
  mediaStream: propsMediaStream,
  onComplete,
}) => {
  const [attempt, setAttempt] = useState<AptitudeAttemptState>(initialAttempt);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(initialAttempt.remaining_seconds);
  const [answers, setAnswers] = useState<Record<number, { selected_option: number | null; is_marked_for_review: boolean; time_spent: number }>>({});
  const [visited, setVisited] = useState<Set<number>>(new Set([0]));
  const [autoSaveStatus, setAutoSaveStatus] = useState<string>('Answer saved ✓');
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // Monitoring Events State & Live Stream State
  const [activeStream, setActiveStream] = useState<MediaStream | null>(propsMediaStream);
  const [monitoringCount, setMonitoringCount] = useState<number>(0);
  const [latestEventMsg, setLatestEventMsg] = useState<string | null>(null);
  const [cameraConnected, setCameraConnected] = useState<boolean>(false);
  const [isCameraOff, setIsCameraOff] = useState<boolean>(false);
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);

  const miniVideoRef = useRef<HTMLVideoElement>(null);
  const timerIntervalRef = useRef<any>(null);
  const questionStartTimeRef = useRef<number>(Date.now());
  const prevFrameDataRef = useRef<Uint8ClampedArray | null>(null);

  // Toggle Camera On/Off
  const handleToggleCamera = () => {
    const nextState = !isCameraOff;
    setIsCameraOff(nextState);
    if (activeStream) {
      activeStream.getVideoTracks().forEach((track) => {
        track.enabled = !nextState;
      });
    }
  };

  // Toggle Mic On/Off
  const handleToggleMic = () => {
    const nextState = !isMicMuted;
    setIsMicMuted(nextState);
    if (activeStream) {
      activeStream.getAudioTracks().forEach((track) => {
        track.enabled = !nextState;
      });
    }
  };

  // Initialize or fallback camera stream if missing
  useEffect(() => {
    let unmounted = false;
    async function ensureCamera() {
      if (activeStream && activeStream.active && activeStream.getVideoTracks().length > 0) {
        setCameraConnected(true);
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 400 }, height: { ideal: 300 } },
          audio: true
        }).catch(async () => {
          return await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 400 }, height: { ideal: 300 } },
            audio: false
          });
        });
        if (!unmounted) {
          setActiveStream(stream);
          setCameraConnected(true);
        }
      } catch (err) {
        console.error('Camera fallback initialization error:', err);
        setCameraConnected(false);
      }
    }
    ensureCamera();
    return () => {
      unmounted = true;
    };
  }, []);

  // Attach and play activeStream on miniVideoRef
  useEffect(() => {
    if (activeStream && miniVideoRef.current) {
      miniVideoRef.current.srcObject = activeStream;
      miniVideoRef.current.play().catch(() => {});
      setCameraConnected(true);

      const videoTrack = activeStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.onended = () => {
          setCameraConnected(false);
          handleRecordEvent('CAMERA_DISCONNECTED', { reason: 'Track ended' });
        };
      }
    }
  }, [activeStream]);

  // Initialize answer state map from attempt response
  useEffect(() => {
    const map: Record<number, { selected_option: number | null; is_marked_for_review: boolean; time_spent: number }> = {};
    initialAttempt.questions.forEach((q) => {
      map[q.id] = {
        selected_option: q.selected_option !== undefined ? q.selected_option : null,
        is_marked_for_review: !!q.is_marked_for_review,
        time_spent: 0,
      };
    });
    setAnswers(map);
  }, [initialAttempt]);

  // Record Proctoring Events
  const handleRecordEvent = async (eventType: string, metadata?: any) => {
    setMonitoringCount((prev) => prev + 1);
    
    let userFriendlyMsg = `Assessment monitoring alert: ${eventType.replace(/_/g, ' ')}`;
    if (eventType === 'COPY_ATTEMPT' || eventType === 'PASTE_ATTEMPT') {
      userFriendlyMsg = '⚠️ PROCTORING ALERT: Copying text or using mobile phone search is strictly prohibited!';
    } else if (eventType === 'HEAD_MOVEMENT_LOOKAWAY') {
      userFriendlyMsg = '⚠️ PROCTORING ALERT: Head movement or looking away detected! Please stay focused on the screen.';
    } else if (eventType === 'TAB_SWITCH' || eventType === 'WINDOW_BLUR') {
      userFriendlyMsg = '⚠️ PROCTORING ALERT: Tab switch or window blur detected!';
    }

    setLatestEventMsg(userFriendlyMsg);

    try {
      await api.recordAptitudeMonitoringEvent({
        attempt_id: attempt.attempt_id,
        event_type: eventType,
        metadata: metadata || {}
      });
    } catch (e) {
      console.error('Failed to log proctoring event');
    }
  };

  // Setup Anti-Cheating Listeners: Copy/Paste, Context Menu, Shortcuts & Window Blur
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleRecordEvent('TAB_SWITCH', { timestamp: new Date().toISOString() });
      }
    };
    const handleBlur = () => {
      handleRecordEvent('WINDOW_BLUR', { timestamp: new Date().toISOString() });
    };

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      handleRecordEvent('COPY_ATTEMPT', { timestamp: new Date().toISOString() });
    };

    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
      handleRecordEvent('COPY_ATTEMPT', { type: 'cut', timestamp: new Date().toISOString() });
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      handleRecordEvent('PASTE_ATTEMPT', { timestamp: new Date().toISOString() });
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      handleRecordEvent('COPY_ATTEMPT', { type: 'contextmenu', timestamp: new Date().toISOString() });
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+U, F12, Alt+Tab
      if (
        (e.ctrlKey || e.metaKey) && ['c', 'v', 'x', 'u', 'a'].includes(e.key.toLowerCase()) ||
        e.key === 'F12' || e.key === 'PrintScreen'
      ) {
        e.preventDefault();
        handleRecordEvent('COPY_ATTEMPT', { key: e.key, timestamp: new Date().toISOString() });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('cut', handleCut);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('cut', handleCut);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [attempt.attempt_id]);

  // Motion & Head Direction Sampling via Video Canvas
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 80;
    canvas.height = 60;
    const ctx = canvas.getContext('2d');

    const motionInterval = setInterval(() => {
      if (!miniVideoRef.current || !ctx || !cameraConnected || isCameraOff) return;
      try {
        ctx.drawImage(miniVideoRef.current, 0, 0, 80, 60);
        const frame = ctx.getImageData(0, 0, 80, 60);
        const data = frame.data;

        if (prevFrameDataRef.current) {
          let diffSum = 0;
          const prev = prevFrameDataRef.current;
          for (let i = 0; i < data.length; i += 8) { // sample every 2nd pixel
            const diffR = Math.abs(data[i] - prev[i]);
            const diffG = Math.abs(data[i+1] - prev[i+1]);
            const diffB = Math.abs(data[i+2] - prev[i+2]);
            diffSum += (diffR + diffG + diffB) / 3;
          }
          const avgDiff = diffSum / (data.length / 8);
          // If significant sudden movement / turning head away / holding up mobile
          if (avgDiff > 28) {
            handleRecordEvent('HEAD_MOVEMENT_LOOKAWAY', { avgDiff: Math.round(avgDiff) });
          }
        }
        prevFrameDataRef.current = new Uint8ClampedArray(data);
      } catch (err) {
        // canvas CORS/read error fallback
      }
    }, 1500);

    return () => {
      clearInterval(motionInterval);
    };
  }, [cameraConnected, isCameraOff, attempt.attempt_id]);

  // Countdown Timer & Auto-Submit on Expiration
  useEffect(() => {
    timerIntervalRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current);
          handleFinalSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [attempt.attempt_id]);

  // Track Visited Questions
  useEffect(() => {
    setVisited((prev) => new Set(prev).add(currentIndex));
    questionStartTimeRef.current = Date.now();
  }, [currentIndex]);

  const currentQ: CandidateAptitudeQuestion = attempt.questions[currentIndex];
  const currentAns = answers[currentQ?.id] || { selected_option: null, is_marked_for_review: false, time_spent: 0 };

  // Handle Option Select (Auto Saves immediately to Backend)
  const handleOptionSelect = async (optIdx: number) => {
    const qId = currentQ.id;
    const updatedAns = { ...currentAns, selected_option: optIdx };

    setAnswers((prev) => ({ ...prev, [qId]: updatedAns }));
    setAutoSaveStatus('Saving answer...');

    try {
      await api.saveAptitudeAnswer(attempt.attempt_id, {
        question_id: qId,
        selected_option: optIdx,
        is_marked_for_review: updatedAns.is_marked_for_review,
        time_spent_seconds: Math.round((Date.now() - questionStartTimeRef.current) / 1000)
      });
      setAutoSaveStatus('Answer saved ✓');
    } catch (e) {
      setAutoSaveStatus('Saved locally (syncing...)');
    }
  };

  // Toggle Mark for Review
  const handleToggleReview = async () => {
    const qId = currentQ.id;
    const updatedAns = { ...currentAns, is_marked_for_review: !currentAns.is_marked_for_review };

    setAnswers((prev) => ({ ...prev, [qId]: updatedAns }));
    try {
      await api.saveAptitudeAnswer(attempt.attempt_id, {
        question_id: qId,
        selected_option: updatedAns.selected_option,
        is_marked_for_review: updatedAns.is_marked_for_review,
        time_spent_seconds: 0
      });
    } catch (e) {
      // ignore
    }
  };

  // Final Assessment Submit Handler
  const handleFinalSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setShowSubmitModal(false);

    try {
      const payloadAnswers = Object.entries(answers).map(([qIdStr, ansObj]) => ({
        question_id: parseInt(qIdStr, 10),
        selected_option: ansObj.selected_option,
        is_marked_for_review: ansObj.is_marked_for_review,
        time_spent_seconds: ansObj.time_spent
      }));

      await api.submitAptitudeAttempt(attempt.attempt_id, { answers: payloadAnswers });
      onComplete(attempt.attempt_id);
    } catch (e) {
      console.error('Submit attempt error:', e);
      alert('Failed to submit test. Please check internet connection.');
      setIsSubmitting(false);
    }
  };

  // Format Timer Format HH:MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Questions Palette Status Determination
  const getQuestionPaletteState = (index: number) => {
    const q = attempt.questions[index];
    const ans = answers[q.id];
    if (index === currentIndex) return 'BLUE'; // Current
    if (ans?.is_marked_for_review) return 'ORANGE'; // Review
    if (ans?.selected_option !== null && ans?.selected_option !== undefined) return 'GREEN'; // Answered
    if (visited.has(index)) return 'RED'; // Not answered
    return 'GRAY'; // Not visited
  };

  // Calculate answered count for submit modal
  const answeredCount = Object.values(answers).filter((a) => a.selected_option !== null && a.selected_option !== undefined).length;
  const unansweredCount = attempt.total_questions - answeredCount;

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* TOP FOCUSED ASSESSMENT BAR */}
      <header style={{ background: '#1E3A5F', color: '#FFFFFF', padding: '0.85rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #2563EB', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontWeight: '900', letterSpacing: '-0.02em', fontSize: '1.15rem' }}>INTERVUEX</span>
          <span style={{ background: 'rgba(255,255,255,0.15)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700' }}>
            Aptitude Assessment
          </span>
        </div>

        {/* Timer Display & Warning Banners */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            background: remainingSeconds <= 300 ? '#DC2626' : (remainingSeconds <= 600 ? '#D97706' : '#2563EB'),
            color: '#FFFFFF',
            padding: '0.4rem 1rem',
            borderRadius: '8px',
            fontWeight: '800',
            fontSize: '1.1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
          }}>
            <Clock size={18} /> {formatTime(remainingSeconds)}
          </div>

          <span style={{ fontSize: '0.875rem', color: '#93C5FD' }}>
            Question <strong>{currentIndex + 1}</strong> of <strong>{attempt.total_questions}</strong>
          </span>
        </div>

        <button 
          className="btn btn-action" 
          onClick={() => setShowSubmitModal(true)}
          style={{ padding: '0.45rem 1.15rem', fontSize: '0.875rem', fontWeight: '700' }}
        >
          Submit Test <Send size={15} />
        </button>
      </header>

      {/* TIMER WARNING ALERTS */}
      {remainingSeconds <= 600 && remainingSeconds > 300 && (
        <div style={{ background: '#FEF3C7', borderBottom: '1px solid #FCD34D', color: '#92400E', padding: '0.5rem 1.5rem', fontSize: '0.85rem', fontWeight: '700', textAlign: 'center' }}>
          ⚠️ Warning: 10 minutes remaining in your assessment.
        </div>
      )}
      {remainingSeconds <= 300 && remainingSeconds > 60 && (
        <div style={{ background: '#FEE2E2', borderBottom: '1px solid #FCA5A5', color: '#991B1B', padding: '0.5rem 1.5rem', fontSize: '0.85rem', fontWeight: '800', textAlign: 'center' }}>
          🚨 Urgent Warning: 5 minutes remaining! Complete and review your answers.
        </div>
      )}

      {/* PROCTORING EVENT WARNING ALERT BANNER */}
      {latestEventMsg && (
        <div style={{
          background: '#FEF2F2',
          borderBottom: '2px solid #FCA5A5',
          color: '#B91C1C',
          padding: '0.65rem 1.5rem',
          fontSize: '0.875rem',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          justify: 'space-between',
          animation: 'fadeIn 0.2s ease-in-out'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShieldAlert size={18} color="#DC2626" />
            <span>{latestEventMsg}</span>
            <span className="badge badge-danger" style={{ fontSize: '0.75rem', marginLeft: '0.5rem' }}>
              Incidents Logged: {monitoringCount}
            </span>
          </div>
          <button
            onClick={() => setLatestEventMsg(null)}
            style={{ background: 'none', border: 'none', color: '#991B1B', fontWeight: '800', cursor: 'pointer', fontSize: '0.8rem' }}
          >
            ✕ Dismiss
          </button>
        </div>
      )}

      {/* MAIN TEST CONTAINER */}
      <div className="container" style={{ padding: '2rem 1.5rem', flex: 1, display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.75rem' }}>
        
        {/* LEFT COLUMN: MAIN QUESTION CARD */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          
          <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRadius: '14px', border: '1px solid #CBD5E1' }}>
            
            {/* Question Header Info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <span className="badge badge-primary" style={{ marginRight: '0.5rem' }}>
                  {currentQ.section}
                </span>
                <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '600' }}>
                  Topic: <strong>{currentQ.topic}</strong>
                </span>
              </div>
              
              <span style={{ fontSize: '0.8rem', color: '#16A34A', fontWeight: '600' }}>
                {autoSaveStatus}
              </span>
            </div>

            {/* Question Text */}
            <div style={{ marginBottom: '1.75rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#2563EB', textTransform: 'uppercase', display: 'block', marginBottom: '0.35rem' }}>
                QUESTION {currentIndex + 1}
              </span>
              <h2 style={{ fontSize: '1.2rem', color: '#1E3A5F', lineHeight: '1.6', fontWeight: '700' }}>
                {currentQ.question_text}
              </h2>
            </div>

            {/* Multiple Choice Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '2rem' }}>
              {currentQ.options.map((optText, optIdx) => {
                const isSelected = currentAns.selected_option === optIdx;
                return (
                  <div
                    key={optIdx}
                    onClick={() => handleOptionSelect(optIdx)}
                    style={{
                      padding: '1rem 1.25rem',
                      borderRadius: '10px',
                      border: isSelected ? '2px solid #2563EB' : '1px solid #E2E8F0',
                      background: isSelected ? '#EFF6FF' : '#FFFFFF',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{
                      width: '24px', height: '24px', borderRadius: '50%',
                      border: isSelected ? '7px solid #2563EB' : '2px solid #CBD5E1',
                      background: '#FFFFFF', flexShrink: 0
                    }} />
                    <span style={{ fontSize: '0.975rem', color: isSelected ? '#1E3A5F' : '#334155', fontWeight: isSelected ? '700' : '500' }}>
                      {optText}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Question Action Buttons */}
            <div style={{ marginTop: 'auto', paddingTop: '1.25rem', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className="btn btn-outline"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((prev) => prev - 1)}
                >
                  <ArrowLeft size={16} /> Previous
                </button>
                <button
                  className="btn btn-outline"
                  onClick={handleToggleReview}
                  style={{
                    borderColor: currentAns.is_marked_for_review ? '#D97706' : '#CBD5E1',
                    background: currentAns.is_marked_for_review ? '#FEF3C7' : '#FFFFFF',
                    color: currentAns.is_marked_for_review ? '#92400E' : '#475569',
                    fontWeight: '700'
                  }}
                >
                  <Bookmark size={16} /> {currentAns.is_marked_for_review ? 'Marked' : 'Mark for Review'}
                </button>
              </div>

              <button
                className="btn btn-primary"
                disabled={currentIndex === attempt.total_questions - 1}
                onClick={() => setCurrentIndex((prev) => prev + 1)}
                style={{ fontWeight: '700' }}
              >
                Save & Next <ArrowRight size={16} />
              </button>
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: QUESTION PALETTE & CAMERA OVERLAY */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Proctored Mini Camera Overlay */}
          <div className="card" style={{ padding: '0.75rem', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.35rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#1E3A5F', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Camera size={14} color="#2563EB" /> LIVE PROCTORED FEED
              </span>
              <span className={`badge ${monitoringCount > 0 ? 'badge-warning' : 'badge-primary'}`} style={{ fontSize: '0.7rem' }}>
                Violations: {monitoringCount}
              </span>
            </div>

            <div style={{ background: '#0F172A', borderRadius: '8px', overflow: 'hidden', height: '160px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {isCameraOff ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', color: '#94A3B8' }}>
                  <CameraOff size={34} color="#EF4444" />
                  <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#CBD5E1' }}>Camera Paused</span>
                </div>
              ) : (
                <video 
                  ref={miniVideoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              )}

              {/* Quick Toggle Buttons: Camera & Microphone */}
              <div style={{ position: 'absolute', top: '6px', right: '6px', display: 'flex', gap: '0.35rem', zIndex: 10 }}>
                <button
                  type="button"
                  onClick={handleToggleCamera}
                  title={isCameraOff ? "Turn Camera On" : "Turn Camera Off"}
                  style={{
                    background: isCameraOff ? 'rgba(220, 38, 38, 0.9)' : 'rgba(15, 23, 42, 0.8)',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    borderRadius: '6px',
                    padding: '0.25rem 0.45rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.7rem',
                    fontWeight: '700',
                    transition: 'all 0.2s ease',
                    backdropFilter: 'blur(4px)'
                  }}
                >
                  {isCameraOff ? <CameraOff size={12} /> : <Camera size={12} />}
                  <span>{isCameraOff ? 'Cam Off' : 'Cam On'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleToggleMic}
                  title={isMicMuted ? "Unmute Microphone" : "Mute Microphone"}
                  style={{
                    background: isMicMuted ? 'rgba(220, 38, 38, 0.9)' : 'rgba(15, 23, 42, 0.8)',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    borderRadius: '6px',
                    padding: '0.25rem 0.45rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.7rem',
                    fontWeight: '700',
                    transition: 'all 0.2s ease',
                    backdropFilter: 'blur(4px)'
                  }}
                >
                  {isMicMuted ? <MicOff size={12} /> : <Mic size={12} />}
                  <span>{isMicMuted ? 'Mic Off' : 'Mic On'}</span>
                </button>
              </div>

              {/* Status Badge */}
              <div style={{ position: 'absolute', bottom: '6px', left: '6px', background: 'rgba(15, 23, 42, 0.85)', color: isCameraOff ? '#EF4444' : (cameraConnected ? '#10B981' : '#F59E0B'), padding: '0.2rem 0.55rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isCameraOff ? '#EF4444' : (cameraConnected ? '#10B981' : '#F59E0B') }}></span>
                {isCameraOff ? 'Camera Paused' : (cameraConnected ? 'Proctored Active' : 'Connecting Camera...')}
                {isMicMuted && <span style={{ color: '#FCA5A5', marginLeft: '0.2rem' }}>(Mic Muted)</span>}
              </div>
            </div>
          </div>

          {/* Question Palette Grid */}
          <div className="card" style={{ borderRadius: '12px' }}>
            <h3 style={{ fontSize: '0.95rem', color: '#1E3A5F', marginBottom: '0.85rem', fontWeight: '700' }}>
              Question Palette
            </h3>

            {/* Legend indicators */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', fontSize: '0.75rem', color: '#64748B', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#2563EB' }} /> Current
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#16A34A' }} /> Answered
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#D97706' }} /> Review
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#DC2626' }} /> Unanswered
              </div>
            </div>

            {/* Grid 1 to 40 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem', maxHeight: '280px', overflowY: 'auto' }}>
              {attempt.questions.map((q, idx) => {
                const st = getQuestionPaletteState(idx);
                let bg = '#F1F5F9';
                let color = '#475569';

                if (st === 'BLUE') { bg = '#2563EB'; color = '#FFFFFF'; }
                else if (st === 'GREEN') { bg = '#16A34A'; color = '#FFFFFF'; }
                else if (st === 'ORANGE') { bg = '#D97706'; color = '#FFFFFF'; }
                else if (st === 'RED') { bg = '#FEE2E2'; color = '#DC2626'; }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    style={{
                      height: '36px',
                      borderRadius: '6px',
                      border: idx === currentIndex ? '2px solid #1E3A5F' : 'none',
                      background: bg,
                      color: color,
                      fontWeight: '700',
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* CONFIRM SUBMISSION MODAL */}
      {showSubmitModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '2rem', borderRadius: '16px' }}>
            <h3 style={{ color: '#1E3A5F', fontSize: '1.3rem', marginBottom: '0.75rem' }}>
              Submit Assessment?
            </h3>
            <p style={{ color: '#475569', fontSize: '0.95rem', marginBottom: '1.25rem' }}>
              Are you sure you want to finish and submit your test?
            </p>

            <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: '#64748B' }}>Answered Questions:</span>
                <strong style={{ color: '#16A34A' }}>{answeredCount}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Unanswered Questions:</span>
                <strong style={{ color: unansweredCount > 0 ? '#DC2626' : '#16A34A' }}>{unansweredCount}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button className="btn btn-outline" onClick={() => setShowSubmitModal(false)}>
                Cancel
              </button>
              <button className="btn btn-action" onClick={handleFinalSubmit} disabled={isSubmitting}>
                {isSubmitting ? <RefreshCw className="spin" size={16} /> : 'Submit Test'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
