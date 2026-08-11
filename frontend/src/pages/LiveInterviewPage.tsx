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
      const current = qList.find(q => !q.answer) || qList[qList.length - 1];
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
                  <strong style={{ color: '#1E3A5F', display: 'block' }}>IntervueX AI Interviewer</strong>
                  {currentQuestion.follow_up_depth > 0 && (
                    <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>
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

            {currentQuestion.context_reason && (
              <p style={{ fontSize: '0.85rem', color: '#64748B', background: '#F8FAFC', padding: '0.6rem 0.8rem', borderRadius: '6px' }}>
                <strong>Interviewer Rationale:</strong> {currentQuestion.context_reason}
              </p>
            )}
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

        {/* Right Column: Real-Time Feedback or Expected Topics */}
        <div>
          {lastEval && interview.instant_feedback_enabled ? (
            <div className="card" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
              <h4 style={{ color: '#16A34A', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Award size={20} /> Real-Time Evaluation Feedback
              </h4>

              <div style={{ background: '#FFFFFF', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: '800', color: '#16A34A', marginBottom: '0.5rem' }}>
                  <span>Overall Answer Score:</span>
                  <span>{lastEval.overall_score}/100</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748B', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                  <div>Technical: {lastEval.technical_score}</div>
                  <div>Relevance: {lastEval.relevance_score}</div>
                  <div>Completeness: {lastEval.completeness_score}</div>
                  <div>Communication: {lastEval.communication_score}</div>
                </div>
              </div>

              <strong style={{ color: '#16A34A', fontSize: '0.85rem' }}>✓ Key Strengths:</strong>
              <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem', marginBottom: '1rem', color: '#15803D' }}>
                {lastEval.strengths.map((s, i) => <li key={i}>{s}</li>)}
              </ul>

              {lastEval.weaknesses.length > 0 && (
                <>
                  <strong style={{ color: '#D97706', fontSize: '0.85rem' }}>⚠ Areas to Improve:</strong>
                  <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem', color: '#B45309' }}>
                    {lastEval.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                </>
              )}
            </div>
          ) : (
            <div className="card">
              <h4 style={{ marginBottom: '1rem', color: '#1E3A5F' }}>Interview Context</h4>
              <p style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '1rem' }}>
                The AI interviewer generates dynamic follow-up questions tailored to your previous answer's technical accuracy.
              </p>
              <div style={{ background: '#F8FAFC', padding: '0.85rem', borderRadius: '8px' }}>
                <strong style={{ fontSize: '0.85rem', color: '#1E3A5F' }}>Expected Assessment Dimensions:</strong>
                <ul style={{ paddingLeft: '1.2rem', fontSize: '0.825rem', marginTop: '0.5rem', color: '#475569' }}>
                  <li>Technical Accuracy & Rationale</li>
                  <li>Relevance to Target Role</li>
                  <li>Completeness & Edge Cases</li>
                  <li>Structured Communication</li>
                </ul>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
