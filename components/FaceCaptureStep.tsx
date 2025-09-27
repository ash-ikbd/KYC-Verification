import React, { useRef, useState, useEffect } from 'react';
import Camera from './Camera';
import type { CameraHandles } from './Camera';
import type { KycData } from '../types';
import { checkLiveness } from '../services/geminiService';
import Spinner from './Spinner';

interface FaceCaptureStepProps {
  onNext: () => void;
  updateKycData: (data: Partial<KycData>) => void;
}

interface LivenessChallenge {
  id: string;
  prompt: string;
  status: 'pending' | 'active' | 'success';
}

const initialChallenges: LivenessChallenge[] = [
  { id: 'turn-head', prompt: 'Turn your head slightly to the left', status: 'pending' },
  { id: 'open-mouth', prompt: 'Open your mouth', status: 'pending' },
  { id: 'blink', prompt: 'Blink with both eyes', status: 'pending' },
];

// --- Audio Feedback Utility ---
const audioContext = typeof window !== 'undefined' ? new (window.AudioContext || (window as any).webkitAudioContext)() : null;

const playTone = (type: 'success' | 'final') => {
  if (!audioContext) return;
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);

  if (type === 'success') {
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5 note
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.2);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  } else if (type === 'final') {
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(1046.50, audioContext.currentTime); // C6 note
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.3);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);

    // Play a second note for a "complete" chime
    const oscillator2 = audioContext.createOscillator();
    oscillator2.connect(gainNode);
    oscillator2.type = 'triangle';
    oscillator2.frequency.setValueAtTime(1318.51, audioContext.currentTime + 0.1); // E6 note
    oscillator2.start(audioContext.currentTime + 0.1);
    oscillator2.stop(audioContext.currentTime + 0.4);
  }
};
// --- End Audio Feedback Utility ---

const ChallengeIndicator: React.FC<{ challenge: LivenessChallenge }> = ({ challenge }) => {
  const { status, prompt } = challenge;
  
  const getIcon = () => {
    switch(status) {
      case 'success':
        return (
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'active':
        return <div className="w-3 h-3 bg-white rounded-full animate-pulse" />;
      case 'pending':
        return <div className="w-3 h-3 bg-slate-400 rounded-full" />;
    }
  }

  const getBackgroundColor = () => {
    switch(status) {
      case 'success': return 'bg-green-500';
      case 'active': return 'bg-blue-600';
      case 'pending': return 'bg-slate-200 dark:bg-slate-600';
    }
  }

  return (
    <div className="flex flex-col items-center">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${getBackgroundColor()}`}>
        {getIcon()}
      </div>
       <p className={`mt-2 text-xs text-center font-medium ${status === 'active' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>{prompt.split(' ')[0]}</p>
    </div>
  );
};

const FaceCaptureStep: React.FC<FaceCaptureStepProps> = ({ onNext, updateKycData }) => {
  const cameraRef = useRef<CameraHandles>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [challenges, setChallenges] = useState<LivenessChallenge[]>(initialChallenges);
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState<number>(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showSuccessFlash, setShowSuccessFlash] = useState(false);
  const verificationIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    setChallenges(prev =>
      prev.map((challenge, index) => {
        if (index < currentChallengeIndex) {
          return { ...challenge, status: 'success' };
        } else if (index === currentChallengeIndex) {
          return { ...challenge, status: 'active' };
        } else {
          return { ...challenge, status: 'pending' };
        }
      })
    );
  }, [currentChallengeIndex]);
  
  useEffect(() => {
    if (isCameraReady && currentChallengeIndex < challenges.length && !capturedImage) {
      verificationIntervalRef.current = window.setInterval(async () => {
        if (isVerifying || !cameraRef.current) return;
  
        setIsVerifying(true);
        const image = cameraRef.current.capture();
        if (image) {
          try {
            const currentChallenge = challenges[currentChallengeIndex];
            const result = await checkLiveness(image, currentChallenge.prompt);
  
            if (result.actionPerformed) {
              setShowSuccessFlash(true);
              setTimeout(() => setShowSuccessFlash(false), 500);

              if (currentChallengeIndex === challenges.length - 1) {
                // Last challenge, capture final image and stop
                playTone('final');
                const finalImage = cameraRef.current.capture();
                setCapturedImage(finalImage);
                if (verificationIntervalRef.current) clearInterval(verificationIntervalRef.current);
              } else {
                playTone('success');
                setCurrentChallengeIndex(prev => prev + 1);
              }
            }
          } catch (error) {
            console.error("Liveness check failed", error);
          }
        }
        setIsVerifying(false);
      }, 1200); // Check every 1.2 seconds
    }
  
    return () => {
      if (verificationIntervalRef.current) {
        clearInterval(verificationIntervalRef.current);
      }
    };
  }, [isCameraReady, currentChallengeIndex, challenges, isVerifying, capturedImage]);

  const handleConfirm = () => {
    if (capturedImage) {
      updateKycData({ faceImage: capturedImage });
      onNext();
    }
  };

  const handleRetry = () => {
    setCapturedImage(null);
    setCurrentChallengeIndex(0);
    setChallenges(initialChallenges);
  };

  const currentPrompt = challenges[currentChallengeIndex]?.prompt;

  return (
    <div className="animate-fade-in">
      <h2 className="text-xl font-bold text-center text-slate-800 dark:text-white mb-2">Liveness Check</h2>
      
      {capturedImage ? (
        <p className="text-center text-slate-600 dark:text-slate-300 mb-6">Review your photo.</p>
      ) : (
         <p className="text-center text-slate-600 dark:text-slate-300 mb-6 h-6">
          {currentPrompt ? `Please: ${currentPrompt}` : 'Liveness check complete!'}
        </p>
      )}

      <div className="max-w-md mx-auto">
        {capturedImage ? (
          <img src={capturedImage} alt="Captured face" className="rounded-lg shadow-lg w-full" />
        ) : (
          <>
            <div className="flex items-center justify-around mb-6 px-4">
              {challenges.map((c, index) => (
                <React.Fragment key={c.id}>
                  <ChallengeIndicator challenge={c} />
                  {index < challenges.length - 1 && <div className={`flex-1 h-1 mx-2 transition-colors duration-500 ${c.status === 'success' ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-700'}`} />}
                </React.Fragment>
              ))}
            </div>
            <div className="relative">
              <Camera ref={cameraRef} onStreamReady={() => setIsCameraReady(true)} />
              {isVerifying && (
                <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center rounded-lg">
                  <Spinner size="h-10 w-10" />
                </div>
              )}
              {showSuccessFlash && (
                 <div className="absolute inset-0 border-4 border-green-500 bg-green-500/20 rounded-lg animate-ping-once" style={{animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) forwards'}}/>
              )}
            </div>
          </>
        )}
      </div>

      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
        {capturedImage && (
          <>
            <button
              onClick={handleRetry}
              className="w-full sm:w-auto bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200 font-bold py-3 px-6 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors duration-200"
            >
              Retake Photo
            </button>
            <button
              onClick={handleConfirm}
              className="w-full sm:w-auto bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Confirm & Continue
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default FaceCaptureStep;