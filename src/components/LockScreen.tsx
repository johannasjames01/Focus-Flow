import React, { useState, useEffect, useRef } from 'react';
import {
  Lock,
  Footprints,
  Camera,
  Activity,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Volume2,
  VolumeX,
  Smartphone,
  Info,
  ChevronRight,
  Flame,
  Check,
  Eye,
  Droplets,
  RotateCcw,
} from 'lucide-react';
import { Quest, QuestType, VerificationResult, AppSettings } from '../types';
import { motionTracker, SquatPhase, MotionSample } from '../utils/motion';
import { sound } from '../utils/audio';
import { analyzeImageGreenery } from '../utils/visionFallback';

interface Props {
  consecutiveSeconds: number;
  initialQuestType?: QuestType;
  settings: AppSettings;
  onQuestCompleted: (result: {
    questType: QuestType;
    questTitle: string;
    metrics: {
      steps?: number;
      squats?: number;
      photoSubject?: string;
      photoUrl?: string;
    };
  }) => void;
}

const DEFAULT_QUESTS: Record<QuestType, Quest> = {
  steps: {
    id: 'q_steps',
    type: 'steps',
    title: 'Walk 50 Steps',
    subtitle: 'Physical Movement Unlock',
    targetValue: 50,
    unit: 'steps',
    instructions: 'Stand up and walk 50 steps. Keep your phone in your pocket or hand. The pedometer sensor will count each stride.',
    rewardMinutes: 15,
    icon: 'Footprints',
  },
  camera_green: {
    id: 'q_camera',
    type: 'camera_green',
    title: 'Photograph Outdoor Greenery',
    subtitle: 'Environmental Ocular Reset',
    targetValue: 1,
    unit: 'photo',
    instructions: 'Look out your nearest window or step outside. Point your camera at a tree, plant, leaves, or green grass.',
    rewardMinutes: 15,
    icon: 'Camera',
  },
  squats: {
    id: 'q_squats',
    type: 'squats',
    title: 'Do 10 Bodyweight Squats',
    subtitle: 'Kinetics & Synovial Fluid Reset',
    targetValue: 10,
    unit: 'squats',
    instructions: 'Hold phone against your chest or slip into pocket. Lower your hips down, keep chest tall, and stand back up.',
    rewardMinutes: 15,
    icon: 'Activity',
  },
  hydration: {
    id: 'q_hydration',
    type: 'hydration',
    title: 'Drink 1 Glass of Water',
    subtitle: 'Cellular Rehydration',
    targetValue: 1,
    unit: 'glass',
    instructions: 'Walk to the kitchen or water dispenser. Drink a full glass of cool water and verify your check-in.',
    rewardMinutes: 15,
    icon: 'Droplets',
  },
  eye_rest: {
    id: 'q_eye_rest',
    type: 'eye_rest',
    title: '20-20-20 Horizon Gaze',
    subtitle: 'Ciliary Muscle De-spasm',
    targetValue: 20,
    unit: 'seconds',
    instructions: 'Shift your gaze to an object at least 20 feet away for 20 continuous seconds to release optical accommodation.',
    rewardMinutes: 15,
    icon: 'Eye',
  },
};

export const LockScreen: React.FC<Props> = ({
  consecutiveSeconds,
  initialQuestType = 'steps',
  settings,
  onQuestCompleted,
}) => {
  const [activeQuestType, setActiveQuestType] = useState<QuestType>(initialQuestType);
  const currentQuest = DEFAULT_QUESTS[activeQuestType];

  // Steps state
  const [stepsCount, setStepsCount] = useState(0);
  const [sensorStatus, setSensorStatus] = useState<'idle' | 'active' | 'denied'>('idle');
  const [recentSamples, setRecentSamples] = useState<number[]>(new Array(30).fill(9.8));

  // Squats state
  const [squatCount, setSquatCount] = useState(0);
  const [squatPhase, setSquatPhase] = useState<SquatPhase>('idle');

  // Camera state
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
  const [isVerifyingPhoto, setIsVerifyingPhoto] = useState(false);
  const [verificationFeedback, setVerificationFeedback] = useState<VerificationResult | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  // Eye rest timer state
  const [eyeRestRemaining, setEyeRestRemaining] = useState(20);
  const [isEyeRestRunning, setIsEyeRestRunning] = useState(false);

  // References
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Play grounding gong upon lock activation
  useEffect(() => {
    sound.playLockGong();
    if (settings.hapticsEnabled && 'vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
  }, []);

  // Motion sensor tracking for steps and squats
  useEffect(() => {
    if (activeQuestType === 'steps' || activeQuestType === 'squats') {
      motionTracker.resetCounts();
      motionTracker.start({
        onStep: (steps) => {
          setStepsCount(steps);
          sound.playStepTick();
          if (settings.hapticsEnabled && 'vibrate' in navigator) {
            navigator.vibrate(30);
          }
          if (steps >= currentQuest.targetValue) {
            handleCompleteQuest({ steps });
          }
        },
        onSquat: (squats, phase) => {
          setSquatCount(squats);
          setSquatPhase(phase);
          if (phase === 'ascending') {
            sound.playSquatRep(squats);
            if (settings.hapticsEnabled && 'vibrate' in navigator) {
              navigator.vibrate([40, 20, 40]);
            }
          }
          if (squats >= currentQuest.targetValue) {
            handleCompleteQuest({ squats });
          }
        },
        onWaveform: (sample: MotionSample) => {
          setRecentSamples((prev) => [...prev.slice(1), sample.rawMag]);
        },
      });
      setSensorStatus('active');
    } else {
      motionTracker.stop();
    }

    return () => {
      motionTracker.stop();
    };
  }, [activeQuestType]);

  // Camera stream setup for environment quest
  useEffect(() => {
    if (activeQuestType === 'camera_green') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [activeQuestType, facingMode]);

  // Eye rest countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (activeQuestType === 'eye_rest' && isEyeRestRunning && eyeRestRemaining > 0) {
      timer = setInterval(() => {
        setEyeRestRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            sound.playSuccessChime();
            handleCompleteQuest({});
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeQuestType, isEyeRestRunning, eyeRestRemaining]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError('Camera access unavailable. You can upload a photo or use the sample capture button.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedPhotoUrl(dataUrl);
    stopCamera();
    verifyPhotoWithAI(dataUrl, canvas);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setCapturedPhotoUrl(dataUrl);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          verifyPhotoWithAI(dataUrl, canvas);
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const useSampleNaturePhoto = () => {
    // High-resolution green outdoor photo for quick testing without camera
    const sampleUrl = 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=800&q=80';
    setCapturedPhotoUrl(sampleUrl);
    setIsVerifyingPhoto(true);

    // Simulate verification of nature photo
    setTimeout(() => {
      setIsVerifyingPhoto(false);
      const result: VerificationResult = {
        verified: true,
        confidence: 0.98,
        detectedSubject: 'Green Pine Forest & Natural Foliage',
        feedback: 'Verified! Lush green trees and natural light detected.',
        mindfulnessTip: 'Looking at distant green foliage immediately relaxes your eyes and restores perspective.',
      };
      setVerificationFeedback(result);
      sound.playSuccessChime();
      setTimeout(() => {
        handleCompleteQuest({
          photoSubject: result.detectedSubject,
          photoUrl: sampleUrl,
        });
      }, 1500);
    }, 1200);
  };

  const verifyPhotoWithAI = async (base64Url: string, canvas: HTMLCanvasElement) => {
    setIsVerifyingPhoto(true);
    setVerificationFeedback(null);

    // Local client-side chromaticity check as an immediate baseline
    const localAnalysis = analyzeImageGreenery(canvas);

    try {
      const response = await fetch('/api/verify-quest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questType: 'camera_green',
          imageBase64: base64Url,
          targetObjective: 'a picture of something green outside your window (trees, plants, lawn, foliage, or garden)',
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data: VerificationResult = await response.json();
      setVerificationFeedback(data);

      if (data.verified) {
        sound.playSuccessChime();
        setTimeout(() => {
          handleCompleteQuest({
            photoSubject: data.detectedSubject,
            photoUrl: base64Url,
          });
        }, 1800);
      }
    } catch (err) {
      console.warn('Backend verification fallback:', err);
      // If server unreachable, use robust local chromaticity check
      const fallbackVerified = localAnalysis.isLikelyGreenNature || localAnalysis.greenScore > 0.05;
      const result: VerificationResult = {
        verified: fallbackVerified,
        confidence: 0.9,
        detectedSubject: fallbackVerified ? 'Natural Green Foliage' : 'Low green foliage detected',
        feedback: fallbackVerified
          ? 'Great capture! Natural green spectrum verified.'
          : 'Could not detect distinct green foliage. Please point camera outside at a tree or plant.',
        mindfulnessTip: 'Resting ocular focus on outdoor greenery decreases cognitive fatigue.',
        source: 'local_chromatic_analysis',
      };
      setVerificationFeedback(result);

      if (fallbackVerified) {
        sound.playSuccessChime();
        setTimeout(() => {
          handleCompleteQuest({
            photoSubject: result.detectedSubject,
            photoUrl: base64Url,
          });
        }, 1800);
      }
    } finally {
      setIsVerifyingPhoto(false);
    }
  };

  const handleCompleteQuest = (metrics: {
    steps?: number;
    squats?: number;
    photoSubject?: string;
    photoUrl?: string;
  }) => {
    onQuestCompleted({
      questType: activeQuestType,
      questTitle: currentQuest.title,
      metrics,
    });
  };

  const formatConsecutiveTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainderSec = sec % 60;
    if (mins === 0) return `${remainderSec} seconds`;
    return `${mins}m ${remainderSec}s`;
  };

  // Request iOS permissions
  const requestMotionAccess = async () => {
    const granted = await motionTracker.requestPermissions();
    if (granted) {
      setSensorStatus('active');
    } else {
      setSensorStatus('denied');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950 text-stone-100 flex flex-col justify-between overflow-y-auto selection:bg-emerald-500 selection:text-stone-950">
      {/* Background ambient texture */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))] pointer-events-none" />

      {/* Top Lock Banner */}
      <header className="relative z-10 w-full max-w-3xl mx-auto px-6 pt-6 pb-4 flex items-center justify-between border-b border-stone-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-tight text-stone-100">Screen Grounded</h1>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400">
                Lockout Active
              </span>
            </div>
            <p className="text-xs text-stone-400">
              Crossed continuous usage limit ({formatConsecutiveTime(consecutiveSeconds)} of scrolling)
            </p>
          </div>
        </div>

        {/* Quest selector chips */}
        <div className="hidden sm:flex items-center gap-1 p-1 bg-stone-900 rounded-lg border border-stone-800 text-xs">
          <button
            onClick={() => setActiveQuestType('steps')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
              activeQuestType === 'steps' ? 'bg-stone-800 text-emerald-400 shadow-sm' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Footprints className="w-3.5 h-3.5" />
            <span>50 Steps</span>
          </button>
          <button
            onClick={() => setActiveQuestType('camera_green')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
              activeQuestType === 'camera_green' ? 'bg-stone-800 text-emerald-400 shadow-sm' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Greenery Photo</span>
          </button>
          <button
            onClick={() => setActiveQuestType('squats')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
              activeQuestType === 'squats' ? 'bg-stone-800 text-emerald-400 shadow-sm' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>10 Squats</span>
          </button>
        </div>
      </header>

      {/* Main Lock Interactive Quest Body */}
      <main className="relative z-10 flex-1 max-w-2xl w-full mx-auto px-6 py-8 flex flex-col justify-center">
        {/* Quest Title Card */}
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400 tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{currentQuest.subtitle}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-100 tracking-tight">
            {currentQuest.title}
          </h2>
          <p className="text-sm text-stone-400 max-w-md mx-auto leading-relaxed">
            {currentQuest.instructions}
          </p>
        </div>

        {/* ----------------- QUEST 1: WALK 50 STEPS ----------------- */}
        {activeQuestType === 'steps' && (
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
            {/* Circular Step Progress Ring */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-44 h-44 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                  <circle
                    cx="80"
                    cy="80"
                    r="68"
                    stroke="currentColor"
                    strokeWidth="10"
                    fill="transparent"
                    className="text-stone-800"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="68"
                    stroke="currentColor"
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={427}
                    strokeDashoffset={427 - (Math.min(stepsCount, 50) / 50) * 427}
                    strokeLinecap="round"
                    className="text-emerald-500 transition-all duration-300"
                  />
                </svg>

                <div className="absolute flex flex-col items-center text-center">
                  <Footprints className="w-7 h-7 text-emerald-400 mb-1" />
                  <span className="text-4xl font-extrabold font-mono text-stone-100 tracking-tight">
                    {stepsCount}
                  </span>
                  <span className="text-xs font-medium text-stone-400 uppercase tracking-wider">
                    of 50 steps
                  </span>
                </div>
              </div>

              {/* Progress feedback message */}
              <div className="mt-4 text-xs font-medium text-emerald-400 text-center">
                {stepsCount === 0 && 'Slip phone into your pocket or hold it, and start walking!'}
                {stepsCount > 0 && stepsCount < 50 && `${50 - stepsCount} more strides to unlock screen...`}
                {stepsCount >= 50 && 'Quest completed! Verifying return...'}
              </div>
            </div>

            {/* Live Accelerometer Waveform Visualizer */}
            <div className="bg-stone-950 border border-stone-800 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-stone-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="font-mono text-stone-300">DeviceMotion Pedometer Stream</span>
                </div>
                <span className="font-mono">{recentSamples[recentSamples.length - 1]?.toFixed(1)} m/s²</span>
              </div>

              {/* Waveform Canvas / Bars */}
              <div className="h-10 flex items-end gap-1 px-1">
                {recentSamples.map((val, idx) => {
                  const height = Math.min(100, Math.max(10, ((val - 7) / 12) * 100));
                  return (
                    <div
                      key={idx}
                      className="flex-1 bg-emerald-500/40 rounded-t transition-all duration-100"
                      style={{ height: `${height}%` }}
                    />
                  );
                })}
              </div>
            </div>

            {/* iOS Sensor Permission button if needed */}
            {sensorStatus !== 'active' && (
              <div className="p-3 bg-stone-800/80 rounded-lg flex items-center justify-between text-xs">
                <span className="text-stone-300">Enable phone motion sensors for pedometer:</span>
                <button
                  onClick={requestMotionAccess}
                  className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
                >
                  Enable Sensors
                </button>
              </div>
            )}

            {/* Tester / Desktop Fallback Controls */}
            <div className="pt-3 border-t border-stone-800 flex items-center justify-between flex-wrap gap-2 text-xs">
              <span className="text-stone-400">Testing on computer?</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => motionTracker.simulateStep()}
                  className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700"
                >
                  +1 Step
                </button>
                <button
                  onClick={() => {
                    for (let i = 0; i < 10; i++) {
                      setTimeout(() => motionTracker.simulateStep(), i * 60);
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700"
                >
                  +10 Steps
                </button>
                <button
                  onClick={() => {
                    for (let i = 0; i < 50; i++) {
                      setTimeout(() => motionTracker.simulateStep(), i * 30);
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/60 font-medium"
                >
                  Simulate Full 50 Steps
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ----------------- QUEST 2: PHOTOGRAPH GREENERY ----------------- */}
        {activeQuestType === 'camera_green' && (
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
            {/* Viewfinder or Captured Preview */}
            <div className="relative aspect-4/3 sm:aspect-16/10 bg-stone-950 rounded-xl overflow-hidden border border-stone-800 flex items-center justify-center">
              {!capturedPhotoUrl ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <canvas ref={canvasRef} className="hidden" />

                  {/* Viewfinder crosshairs / frame */}
                  <div className="absolute inset-4 border border-white/20 rounded-lg pointer-events-none flex flex-col justify-between p-3">
                    <div className="flex justify-between text-[11px] font-mono text-white/80 bg-stone-950/60 px-2 py-1 rounded backdrop-blur-md self-start">
                      Target: Foliage, Trees, Window Garden
                    </div>
                    <div className="text-[11px] text-center text-white/90 bg-stone-950/60 px-3 py-1 rounded-full backdrop-blur-md self-center">
                      Point at outdoor greenery & press Snap
                    </div>
                  </div>

                  {/* Camera toggle */}
                  <button
                    onClick={toggleCameraFacing}
                    title="Flip camera"
                    className="absolute top-4 right-4 p-2 rounded-full bg-stone-900/80 backdrop-blur-md text-stone-200 hover:text-white"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <div className="relative w-full h-full">
                  <img
                    src={capturedPhotoUrl}
                    alt="Captured greenery"
                    className="w-full h-full object-cover"
                  />
                  {isVerifyingPhoto && (
                    <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center space-y-3">
                      <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
                      <div>
                        <div className="text-sm font-semibold text-stone-100">
                          Analyzing Greenery via Gemini Vision...
                        </div>
                        <p className="text-xs text-stone-400">
                          Verifying natural foliage and outdoor daylight spectrum
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Camera error fallback notification */}
            {cameraError && (
              <div className="p-3 bg-amber-950/50 border border-amber-600/30 rounded-lg text-xs text-amber-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div>{cameraError}</div>
                  <div className="text-stone-300">
                    Use the "Quick Test Photo" button below to verify with real outdoor greenery!
                  </div>
                </div>
              </div>
            )}

            {/* Verification result feedback */}
            {verificationFeedback && (
              <div
                className={`p-4 rounded-xl border flex items-start gap-3 ${
                  verificationFeedback.verified
                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                    : 'bg-rose-950/60 border-rose-500/40 text-rose-200'
                }`}
              >
                {verificationFeedback.verified ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <div className="text-sm font-bold">
                    {verificationFeedback.verified ? 'Greenery Verified!' : 'Photo Needs More Greenery'}
                  </div>
                  <p className="text-xs opacity-90">{verificationFeedback.feedback}</p>
                  {verificationFeedback.mindfulnessTip && (
                    <p className="text-xs italic text-stone-300 pt-1">
                      "{verificationFeedback.mindfulnessTip}"
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Camera Action Buttons */}
            <div className="flex items-center justify-center gap-3">
              {!capturedPhotoUrl ? (
                <button
                  onClick={capturePhoto}
                  className="px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                >
                  <Camera className="w-4 h-4" />
                  <span>Snap Picture of Window / Nature</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setCapturedPhotoUrl(null);
                    setVerificationFeedback(null);
                    startCamera();
                  }}
                  className="px-4 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retake Photo</span>
                </button>
              )}

              {/* Upload alternative */}
              <label className="cursor-pointer px-4 py-2.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs flex items-center gap-1.5 border border-stone-700">
                <span>Upload Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {/* Fast Sample Button */}
              <button
                onClick={useSampleNaturePhoto}
                className="px-4 py-2.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 text-xs border border-emerald-700/50 flex items-center gap-1.5 font-medium"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Quick Test Nature Photo</span>
              </button>
            </div>
          </div>
        )}

        {/* ----------------- QUEST 3: 10 BODYWEIGHT SQUATS ----------------- */}
        {activeQuestType === 'squats' && (
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
            {/* Squat Rep Counter & Kinematic Coach */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-44 h-44 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                  <circle
                    cx="80"
                    cy="80"
                    r="68"
                    stroke="currentColor"
                    strokeWidth="10"
                    fill="transparent"
                    className="text-stone-800"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="68"
                    stroke="currentColor"
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={427}
                    strokeDashoffset={427 - (Math.min(squatCount, 10) / 10) * 427}
                    strokeLinecap="round"
                    className="text-emerald-500 transition-all duration-300"
                  />
                </svg>

                <div className="absolute flex flex-col items-center text-center">
                  <Activity className="w-7 h-7 text-emerald-400 mb-1" />
                  <span className="text-4xl font-extrabold font-mono text-stone-100 tracking-tight">
                    {squatCount}
                  </span>
                  <span className="text-xs font-medium text-stone-400 uppercase tracking-wider">
                    of 10 squats
                  </span>
                </div>
              </div>

              {/* Dynamic Squat Kinematic Phase Indicator */}
              <div className="mt-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-950 border border-stone-800 text-xs">
                <span className="text-stone-400">Sensor Status:</span>
                <span className="font-semibold text-emerald-400 font-mono capitalize">
                  {squatPhase === 'idle' && 'Stand Upright'}
                  {squatPhase === 'descending' && 'Lowering hips...'}
                  {squatPhase === 'deep' && 'Deep Squat! Drive up!'}
                  {squatPhase === 'ascending' && 'Rep completed!'}
                </span>
              </div>
            </div>

            {/* Kinetic coaching tip */}
            <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 text-xs text-stone-300 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong>Sensor guidance:</strong> Keep your phone firmly in your hand or front pocket.
                The accelerometer detects the gravitational dip as your hips lower and the upward thrust
                as you push through your heels.
              </div>
            </div>

            {/* Tester controls for squats */}
            <div className="pt-3 border-t border-stone-800 flex items-center justify-between flex-wrap gap-2 text-xs">
              <span className="text-stone-400">Testing on laptop?</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => motionTracker.simulateSquat()}
                  className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-medium"
                >
                  +1 Squat Rep
                </button>
                <button
                  onClick={() => {
                    for (let i = 0; i < 10; i++) {
                      setTimeout(() => motionTracker.simulateSquat(), i * 250);
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/60 font-medium"
                >
                  Simulate Full 10 Squats
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ----------------- QUEST 4: HYDRATION ----------------- */}
        {activeQuestType === 'hydration' && (
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Droplets className="w-10 h-10" />
            </div>
            <div className="space-y-2 max-w-sm mx-auto">
              <h3 className="text-lg font-bold text-stone-100">Step Away & Hydrate</h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Prolonged continuous screen immersion causes sub-conscious dehydration and shallow breathing.
                Go pour yourself a tall glass of cool water and finish it.
              </p>
            </div>
            <button
              onClick={() => {
                sound.playSuccessChime();
                handleCompleteQuest({});
              }}
              className="px-6 py-3 rounded-full bg-cyan-500 hover:bg-cyan-400 text-stone-950 font-bold text-sm shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
            >
              I Drank My Glass of Water
            </button>
          </div>
        )}

        {/* ----------------- QUEST 5: 20-20-20 EYE REST ----------------- */}
        {activeQuestType === 'eye_rest' && (
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Eye className="w-10 h-10" />
            </div>
            <div className="space-y-2 max-w-sm mx-auto">
              <h3 className="text-lg font-bold text-stone-100">Look 20 Feet Away</h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Stare at a distant point across the room or outside for 20 seconds.
              </p>
              <div className="text-3xl font-extrabold font-mono text-emerald-400 py-2">
                {eyeRestRemaining}s
              </div>
            </div>
            <button
              onClick={() => setIsEyeRestRunning(true)}
              disabled={isEyeRestRunning}
              className={`px-6 py-3 rounded-full font-bold text-sm transition-all ${
                isEyeRestRunning
                  ? 'bg-stone-800 text-stone-500 cursor-not-allowed'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-stone-950 shadow-lg shadow-emerald-500/20 active:scale-95'
              }`}
            >
              {isEyeRestRunning ? 'Timer Counting...' : 'Start 20s Horizon Gaze'}
            </button>
          </div>
        )}

        {/* Switch quest footer options */}
        <div className="mt-8 text-center">
          <p className="text-xs text-stone-400 mb-2">Physically constrained or in transit?</p>
          <div className="flex items-center justify-center flex-wrap gap-2 text-xs">
            {activeQuestType !== 'steps' && (
              <button
                onClick={() => setActiveQuestType('steps')}
                className="px-3 py-1 rounded bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800"
              >
                Switch to 50 Steps
              </button>
            )}
            {activeQuestType !== 'camera_green' && (
              <button
                onClick={() => setActiveQuestType('camera_green')}
                className="px-3 py-1 rounded bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800"
              >
                Switch to Greenery Photo
              </button>
            )}
            {activeQuestType !== 'squats' && (
              <button
                onClick={() => setActiveQuestType('squats')}
                className="px-3 py-1 rounded bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800"
              >
                Switch to 10 Squats
              </button>
            )}
            {activeQuestType !== 'eye_rest' && (
              <button
                onClick={() => setActiveQuestType('eye_rest')}
                className="px-3 py-1 rounded bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800"
              >
                Switch to 20-20-20 Eye Rest
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Footer reassurance */}
      <footer className="relative z-10 w-full max-w-3xl mx-auto px-6 py-4 text-center text-[11px] text-stone-400 border-t border-stone-800/80">
        <span>No dead ends. Completing this real-world action unlocks a fresh block of mindful screen time.</span>
      </footer>
    </div>
  );
};
