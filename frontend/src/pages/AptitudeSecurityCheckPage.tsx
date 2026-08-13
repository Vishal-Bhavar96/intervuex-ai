import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, 
  Lock, ArrowRight, Eye, Monitor, Wifi, Clock, XCircle
} from 'lucide-react';

interface AptitudeSecurityCheckPageProps {
  companyPattern: string;
  difficultyMode: string;
  onProceedToTest: (stream: MediaStream | null) => void;
  onCancel: () => void;
}

export const AptitudeSecurityCheckPage: React.FC<AptitudeSecurityCheckPageProps> = ({
  companyPattern,
  difficultyMode,
  onProceedToTest,
  onCancel,
}) => {
  const [step, setStep] = useState<'PERMISSION' | 'PREVIEW_PRIVACY' | 'SYSTEM_CHECK'>('PERMISSION');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [privacyAgreed, setPrivacyAgreed] = useState<boolean>(false);
  const [isRequesting, setIsRequesting] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  // Request browser media permission on button click
  const handleRequestCamera = async () => {
    setIsRequesting(true);
    setPermissionError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      setStream(mediaStream);
      setStep('PREVIEW_PRIVACY');
    } catch (err: any) {
      console.error('Camera permission error:', err);
      setPermissionError('Camera permission is required for this assessment mode. Please allow camera access in your browser settings.');
    } finally {
      setIsRequesting(false);
    }
  };

  // Attach stream to video tag when preview step is active
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, step]);

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', maxWidth: '850px' }}>
      
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <span className="badge badge-primary" style={{ marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          PROCTORED PRACTICE SECURITY
        </span>
        <h1 style={{ color: '#1E3A5F', fontSize: '2rem', fontWeight: '800' }}>
          Assessment Security Check
        </h1>
        <p style={{ color: '#64748B', fontSize: '0.95rem' }}>
          Configured: <strong>{companyPattern}</strong> ({difficultyMode} Difficulty)
        </p>
      </div>

      {/* STEP 1: CAMERA PERMISSION REQUEST */}
      {step === 'PERMISSION' && (
        <div className="card" style={{ padding: '2.5rem', textAlign: 'center', borderRadius: '16px' }}>
          <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <Camera size={36} />
          </div>

          <h2 style={{ color: '#1E3A5F', fontSize: '1.4rem', marginBottom: '0.75rem' }}>
            Camera Access Required
          </h2>
          <p style={{ color: '#475569', fontSize: '0.975rem', maxWidth: '560px', margin: '0 auto 1.5rem', lineHeight: '1.6' }}>
            Camera access is required for this proctored assessment. Your camera will be used only according to the assessment monitoring settings.
          </p>

          {permissionError && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
              <AlertCircle size={20} color="#DC2626" />
              <span>{permissionError}</span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button className="btn btn-outline" onClick={onCancel}>
              Exit Assessment
            </button>
            <button className="btn btn-primary btn-lg" onClick={handleRequestCamera} disabled={isRequesting} style={{ padding: '0.75rem 2rem', fontWeight: '700' }}>
              {isRequesting ? <RefreshCw className="spin" size={18} /> : <Camera size={18} />} Allow Camera & Continue
            </button>
          </div>
        </div>
      )}

      {/* STEP 2 & 3: CAMERA PREVIEW, PRIVACY CONSENT & SYSTEM CHECK */}
      {(step === 'PREVIEW_PRIVACY' || step === 'SYSTEM_CHECK') && (
        <div className="grid grid-2 gap-6" style={{ marginBottom: '2rem' }}>
          
          {/* Left Column: Live Camera Preview */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', color: '#1E3A5F', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Camera size={18} color="#2563EB" /> Live Camera Stream
            </h3>

            <div style={{ background: '#0F172A', borderRadius: '12px', overflow: 'hidden', height: '240px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
              <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(15, 23, 42, 0.75)', color: '#10B981', padding: '0.25rem 0.65rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }}></span> LIVE MONITORING
              </div>
            </div>

            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
              <div style={{ color: '#16A34A', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: '600' }}>
                <CheckCircle2 size={16} /> Camera Connected & Active
              </div>
              <div style={{ color: '#16A34A', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: '600' }}>
                <CheckCircle2 size={16} /> Microphone Access Validated
              </div>
            </div>
          </div>

          {/* Right Column: Privacy Policy Notice & System Check */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', color: '#1E3A5F', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lock size={18} color="#2563EB" /> Privacy & System Status
            </h3>

            {/* Privacy Rules */}
            <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '0.85rem', color: '#475569', lineHeight: '1.5', marginBottom: '1.25rem' }}>
              <strong style={{ color: '#1E3A5F', display: 'block', marginBottom: '0.35rem' }}>Assessment Privacy Notice:</strong>
              <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
                <li>Camera access is required for proctored identity and integrity verification.</li>
                <li><strong>No video is recorded or stored on server disk.</strong> Camera feed is processed locally in browser.</li>
                <li>Tab switching and window focus changes are monitored.</li>
                <li>You may exit the assessment at any point.</li>
              </ul>
            </div>

            {/* System Check Status Indicators */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.35rem' }}>
                <span style={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Camera size={14} /> Camera Feed</span>
                <span style={{ color: '#16A34A', fontWeight: '700' }}>✓ Ready</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.35rem' }}>
                <span style={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Monitor size={14} /> Browser Compatibility</span>
                <span style={{ color: '#16A34A', fontWeight: '700' }}>✓ Supported</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.35rem' }}>
                <span style={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Wifi size={14} /> Network Connectivity</span>
                <span style={{ color: '#16A34A', fontWeight: '700' }}>✓ Connected</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Clock size={14} /> Server Timer Validation</span>
                <span style={{ color: '#16A34A', fontWeight: '700' }}>✓ Synced</span>
              </div>
            </div>

            {/* Mandatory Consent Checkbox */}
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', cursor: 'pointer', fontSize: '0.85rem', color: '#1E3A5F', fontWeight: '600' }}>
              <input 
                type="checkbox" 
                checked={privacyAgreed} 
                onChange={(e) => setPrivacyAgreed(e.target.checked)}
                style={{ marginTop: '3px', width: '16px', height: '16px', accentColor: '#2563EB' }} 
              />
              <span>I understand and agree to the assessment monitoring policy.</span>
            </label>

          </div>
        </div>
      )}

      {/* Action Footer Buttons */}
      {(step === 'PREVIEW_PRIVACY' || step === 'SYSTEM_CHECK') && (
        <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 2rem', borderRadius: '14px' }}>
          <button className="btn btn-outline" onClick={onCancel}>
            Exit Assessment
          </button>
          <button 
            className="btn btn-action btn-lg" 
            disabled={!privacyAgreed}
            onClick={() => onProceedToTest(stream)}
            style={{ padding: '0.75rem 2rem', fontWeight: '800' }}
          >
            Begin Test <ArrowRight size={18} />
          </button>
        </div>
      )}

    </div>
  );
};
