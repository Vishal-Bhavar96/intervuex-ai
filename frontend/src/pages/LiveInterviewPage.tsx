import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Interview, InterviewQuestion, AnswerEvaluation } from '../types';
import { 
  Bot, Mic, MicOff, Send, Clock, Sparkles, CheckCircle, AlertTriangle, 
  HelpCircle, ArrowRight, ShieldAlert, Award, Volume2, VolumeX, Play, Pause, Radio
} from 'lucide-react';

interface LiveInterviewPageProps {
  interviewId: number;
  onComplete: (interviewId: number) => void;
}

export const LiveInterviewPage: React.FC<LiveInterviewPageProps> = ({ interviewId, onComplete }) => {
  const [interview, setInterview] = useState<Interview | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestion | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [lastEval, setLastEval] = useState<AnswerEvaluation | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);

  // Interviewer Question Audio Format State
  const [isAudioSwitchOn, setIsAudioSwitchOn] = useState(true);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const recognitionRef = React.useRef<any>(null);
  const baseTextRef = React.useRef<string>('');

  // Speech Synthesis for Interviewer Audio Format
  const stopAudio = () => {
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }
    setIsPlayingAudio(false);
  };

  const speakQuestion = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    stopAudio();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.lang = 'en-US';

    const voices = window.speechSynthesis.getVoices();
    const selectedVoice = voices.find(v => 
      v.lang.startsWith('en') && 
      (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel') || v.name.includes('David'))
    );
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onstart = () => setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    try {
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('Speech synthesis error', err);
      setIsPlayingAudio(false);
    }
  };

  const toggleAudioPlayback = () => {
    if (isPlayingAudio) {
      stopAudio();
    } else if (currentQuestion) {
      speakQuestion(currentQuestion.question_text);
    }
  };

  // Auto-read question when main switch is ON or when question changes
  useEffect(() => {
    if (currentQuestion && isAudioSwitchOn) {
      const timer = setTimeout(() => {
        speakQuestion(currentQuestion.question_text);
      }, 300);
      return () => {
        clearTimeout(timer);
        stopAudio();
      };
    } else {
      stopAudio();
    }
  }, [currentQuestion?.id, isAudioSwitchOn]);


  // Timer interval
  useEffect(() => {
    const interval = setInterval(() => {
      setTimerSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Clean up speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  // Fetch interview data
  const loadInterview = async () => {
    try {
      const data = await api.getInterview(interviewId);
      setInterview(data);
      if (data.status === 'COMPLETED') {
        onComplete(data.id);
        return;
      }
      // Get latest unanswered or current question
      const qList = data.questions || [];
      const current = qList.find((q: any) => !q.answer) || qList[qList.length - 1];
      setCurrentQuestion(current || null);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadInterview();
  }, [interviewId]);

  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }
  }, []);

  const toggleSpeechRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (isRecording) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
        recognitionRef.current = null;
      }
      setIsRecording(false);
    } else {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      baseTextRef.current = answerText;

      recognition.onstart = () => setIsRecording(true);
      recognition.onend = () => {
        setIsRecording(false);
        recognitionRef.current = null;
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        const combined = baseTextRef.current 
          ? `${baseTextRef.current.trim()} ${transcript.trim()}` 
          : transcript.trim();
        setAnswerText(combined);
      };

      recognitionRef.current = recognition;
      try {
        recognition.start();
      } catch (err) {
        console.error('Speech recognition start failed', err);
      }
    }
  };

  const handleSubmitAnswer = async () => {
    if (!currentQuestion || !answerText.trim()) return;

    stopAudio();
    setSubmitting(true);
    try {
      const evalResult = await api.submitAnswer(interviewId, {
        question_id: currentQuestion.id,
        answer_text: answerText,
        time_taken_seconds: timerSeconds
      });

      if (interview?.instant_feedback_enabled) {
        setLastEval(evalResult);
      }

      setAnswerText('');
      setTimerSeconds(0);
      await loadInterview();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!interview || !currentQuestion) {
    return <div style={{ padding: '3rem', textAlign: 'center' }}>Initializing Live AI Interviewer...</div>;
  }

  const answeredCount = interview.questions.filter(q => q.answer).length;
  const progressPct = ((answeredCount) / interview.total_questions) * 100;

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '1100px' }}>
      {/* Top Header Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="badge badge-primary" style={{ marginRight: '0.5rem' }}>{interview.type} INTERVIEW</span>
          <span className="badge badge-neutral">DIFFICULTY: {interview.difficulty}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748B', fontWeight: '600' }}>
            <Clock size={18} /> {Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, '0')}
          </div>
          <strong style={{ color: '#1E3A5F' }}>Question {answeredCount + 1} / {interview.total_questions}</strong>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar" style={{ marginBottom: '2rem' }}>
        <div className="progress-fill" style={{ width: `${progressPct}%` }}></div>
      </div>

      {/* Split Main Section */}
      <div className="grid grid-2 gap-6" style={{ gridTemplateColumns: '1.4fr 1fr' }}>
        
        {/* Left Column: AI Interviewer Question & Answer Box */}
        <div>
          {/* Question Box */}
          <div className="card" style={{ marginBottom: '1.5rem', borderLeft: '4px solid #2563EB' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot size={20} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <strong style={{ color: '#1E3A5F', display: 'block' }}>IntervueX AI Interviewer</strong>
                    <span 
                      className="badge" 
                      style={{ 
                        fontSize: '0.7rem', 
                        fontWeight: '800', 
                        letterSpacing: '0.04em',
                        background: (currentQuestion.resume_source || '').includes('PROJECT') ? '#F3E8FF' :
                                    (currentQuestion.resume_source || '').includes('JOB') ? '#DCFCE7' :
                                    (currentQuestion.resume_source || '').includes('HR') ? '#FEF3C7' :
                                    (currentQuestion.resume_source || '').includes('CODING') ? '#FCE7F3' : '#E0F2FE',
                        color: (currentQuestion.resume_source || '').includes('PROJECT') ? '#6B21A8' :
                               (currentQuestion.resume_source || '').includes('JOB') ? '#15803D' :
                               (currentQuestion.resume_source || '').includes('HR') ? '#B45309' :
                               (currentQuestion.resume_source || '').includes('CODING') ? '#9D174D' : '#0369A1'
                      }}
                    >
                      {currentQuestion.resume_source ? `[ ${currentQuestion.resume_source} ]` : `[ RESUME-BASED ]`}
                    </span>
                  </div>
                  {currentQuestion.follow_up_depth > 0 && (
                    <span className="badge badge-warning" style={{ fontSize: '0.7rem', marginTop: '0.2rem' }}>
                      ADAPTIVE FOLLOW-UP QUESTION
                    </span>
                  )}
                </div>
              </div>

              {/* Main Audio Format Switch */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', background: '#F8FAFC', padding: '0.35rem 0.75rem', borderRadius: '9999px', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '0.775rem', fontWeight: '700', color: isAudioSwitchOn ? '#2563EB' : '#64748B', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Volume2 size={15} /> Audio Question Switch
                </span>
                <label className="switch" title="Toggle automatic audio format reading for interviewer questions">
                  <input 
                    type="checkbox" 
                    checked={isAudioSwitchOn} 
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setIsAudioSwitchOn(checked);
                      if (!checked) stopAudio();
                    }} 
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>

            <h3 style={{ fontSize: '1.25rem', color: '#111827', lineHeight: '1.4', marginBottom: '0.75rem' }}>
              "{currentQuestion.question_text}"
            </h3>

            {/* Audio Controls & Sound Waveform Indicator */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.85rem', paddingTop: '0.75rem', borderTop: '1px dashed #E2E8F0' }}>
              <button 
                type="button"
                className={`btn btn-sm ${isPlayingAudio ? 'btn-action' : 'btn-outline'}`}
                onClick={toggleAudioPlayback}
                style={{ gap: '0.4rem', fontSize: '0.825rem' }}
              >
                {isPlayingAudio ? <VolumeX size={15} /> : <Volume2 size={15} />}
                {isPlayingAudio ? 'Pause Question Audio' : '🔊 Play Question Audio Format'}
              </button>

              {isPlayingAudio && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#EFF6FF', padding: '0.25rem 0.65rem', borderRadius: '9999px', border: '1px solid #BFDBFE' }}>
                  <div className="audio-wave">
                    <div className="audio-bar"></div>
                    <div className="audio-bar"></div>
                    <div className="audio-bar"></div>
                    <div className="audio-bar"></div>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#1D4ED8' }}>
                    AI Interviewer Speaking...
                  </span>
                </div>
              )}
            </div>

            {/* Why You're Being Asked This Box */}
            <div style={{ background: '#F8FAFC', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <strong style={{ fontSize: '0.825rem', color: '#1E3A5F', display: 'block', marginBottom: '0.35rem' }}>
                Why you're being asked this:
              </strong>
              {currentQuestion.reasons && currentQuestion.reasons.length > 0 ? (
                <ul style={{ paddingLeft: '1.25rem', fontSize: '0.825rem', color: '#475569', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  {currentQuestion.reasons.map((r, idx) => (
                    <li key={idx}>{r}</li>
                  ))}
                </ul>
              ) : (
                <p style={{ fontSize: '0.825rem', color: '#475569', margin: 0 }}>
                  {currentQuestion.context_reason || 'Evaluating technical depth and project rationale based on your candidate profile.'}
                </p>
              )}
            </div>
          </div>



          {/* Candidate Answer Box */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <label className="form-label">Your Response</label>
              {speechSupported ? (
                <button 
                  className={`btn btn-sm ${isRecording ? 'btn-action' : 'btn-outline'}`}
                  onClick={toggleSpeechRecording}
                  style={{ background: isRecording ? '#DC2626' : undefined }}
                >
                  {isRecording ? <MicOff size={14} /> : <Mic size={14} />}
                  {isRecording ? 'Stop Voice Recording' : '🎤 Answer Using Voice'}
                </button>
              ) : (
                <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Voice fallback to text input</span>
              )}
            </div>

            <textarea 
              className="form-textarea" 
              style={{ minHeight: '180px', marginBottom: '1rem', fontSize: '0.95rem' }}
              value={answerText}
              onChange={e => setAnswerText(e.target.value)}
              placeholder="Type or speak your answer here. Provide structured technical rationale, examples, and architecture considerations..."
            />

            <button 
              className="btn btn-action btn-lg" 
              style={{ width: '100%' }}
              onClick={handleSubmitAnswer}
              disabled={submitting || !answerText.trim()}
            >
              <Send size={18} /> {submitting ? 'Evaluating Answer...' : 'Submit Answer & Proceed'}
            </button>
          </div>
        </div>

        {/* Right Column: AI Interviewer Persona & Exam Simulation Protocol */}
        <div>
          <div className="card" style={{ borderLeft: '4px solid #1E3A5F' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#F1F5F9', color: '#1E3A5F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={20} />
              </div>
              <div>
                <strong style={{ color: '#1E3A5F', display: 'block', fontSize: '0.95rem' }}>AI Interviewer Persona</strong>
                <span style={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: '700' }}>
                  🟢 Active Company Interview Simulation
                </span>
              </div>
            </div>

            <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '10px', marginBottom: '1.25rem', border: '1px solid #E2E8F0' }}>
              <strong style={{ fontSize: '0.85rem', color: '#1E3A5F', display: 'block', marginBottom: '0.4rem' }}>
                📋 Interview Protocol:
              </strong>
              <ul style={{ paddingLeft: '1.2rem', fontSize: '0.825rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.3rem', margin: 0 }}>
                <li><strong>No Mid-Interview Hints:</strong> Evaluates responses silently like a corporate technical interviewer.</li>
                <li><strong>No Intermediate Feedback:</strong> Avoids revealing scores or expected concepts during live questioning.</li>
                <li><strong>Adaptive Questioning:</strong> AI listens to answers and selects relevant follow-up questions.</li>
                <li><strong>Final Evaluation Report:</strong> Multi-dimensional scores, strengths, and roadmap generated upon completion.</li>
              </ul>
            </div>

            <div style={{ background: '#EFF6FF', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #BFDBFE' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#1D4ED8', marginBottom: '0.25rem' }}>
                🎯 Candidate Tip:
              </div>
              <p style={{ fontSize: '0.825rem', color: '#1E40AF', margin: 0 }}>
                Speak or type clearly. Provide technical rationale, schema details, and project roles in a structured manner.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
