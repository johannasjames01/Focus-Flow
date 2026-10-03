import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  ShieldCheck,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  Lock,
  Smartphone,
  AlertTriangle,
  ArrowRight,
  Footprints,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { StudyModeState, MonitoredAppId } from '../types';
import { sound } from '../utils/audio';

interface Props {
  studyState: StudyModeState;
  onEndStudyMode: (completed: boolean) => void;
  onTryOpenApp: (appId: MonitoredAppId) => void;
}

export const StudyModeHUD: React.FC<Props> = ({
  studyState,
  onEndStudyMode,
  onTryOpenApp,
}) => {
  const [showInterceptAlert, setShowInterceptAlert] = useState<string | null>(null);
  const [showForfeitModal, setShowForfeitModal] = useState(false);
  const [forfeitSteps, setForfeitSteps] = useState(0);

  const totalSecs = studyState.durationMinutes * 60;
  const elapsedSecs = totalSecs - studyState.remainingSeconds;
  const progressPercent = Math.min(100, (elapsedSecs / totalSecs) * 100);

  const formatCountdown = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const handleInterceptTest = (appName: string, appId: MonitoredAppId) => {
    sound.playWarningPing();
    setShowInterceptAlert(appName);
    setTimeout(() => {
      onTryOpenApp(appId);
    }, 600);
  };

  return (
    <div className="flex flex-col min-h-screen max-w-xl mx-auto bg-stone-950 text-stone-100 p-6 sm:p-8 justify-between relative selection:bg-indigo-500 selection:text-white">
      {/* Background ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(99,102,241,0.15),transparent_70%)] pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 flex items-center justify-between border-b border-stone-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-stone-200">Study Mode Active</span>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-950/80 border border-indigo-500/30 text-indigo-400 ml-2">
              Strict Shield
            </span>
          </div>
        </div>

        <div className="text-xs font-mono text-stone-400">
          Total: {studyState.durationMinutes}m
        </div>
      </header>

      {/* Center Study Countdown & Status */}
      <main className="relative z-10 my-auto py-8 text-center space-y-8">
        <div className="space-y-2">
          <div className="text-xs font-mono uppercase tracking-wider text-indigo-400">
            Current Focus Goal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-100 tracking-tight">
            {studyState.subject}
          </h1>
          <p className="text-xs text-stone-400">
            Phone feeds and notifications are blocked. Immerse into deep work.
          </p>
        </div>

        {/* Circular Countdown Ring */}
        <div className="relative w-56 h-56 sm:w-64 sm:h-64 mx-auto flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
            <circle
              cx="100"
              cy="100"
              r="84"
              stroke="currentColor"
              strokeWidth="10"
              fill="transparent"
              className="text-stone-900"
            />
            <circle
              cx="100"
              cy="100"
              r="84"
              stroke="currentColor"
              strokeWidth="10"
              fill="transparent"
              strokeDasharray={527}
              strokeDashoffset={527 - (progressPercent / 100) * 527}
              strokeLinecap="round"
              className="text-indigo-500 transition-all duration-1000"
            />
          </svg>

          <div className="absolute flex flex-col items-center">
            <span className="text-5xl font-mono font-extrabold text-stone-100 tracking-tighter">
              {formatCountdown(studyState.remainingSeconds)}
            </span>
            <span className="text-xs text-stone-400 mt-2 font-mono">
              {Math.round(progressPercent)}% completed
            </span>
          </div>
        </div>

        {/* Shielded Apps Status Box */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 text-left space-y-3 shadow-xl">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-stone-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Shielded from Distractions</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-400">Lock Active</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleInterceptTest('TikTok', 'tiktok')}
              className="p-2.5 rounded-xl bg-stone-950 border border-stone-800 hover:border-rose-500/60 transition-all text-center group"
            >
              <div className="text-xs font-bold text-stone-300 group-hover:text-rose-400">
                TikTok
              </div>
              <div className="text-[10px] text-rose-400/80 font-mono">Shielded</div>
            </button>

            <button
              onClick={() => handleInterceptTest('Instagram', 'instagram')}
              className="p-2.5 rounded-xl bg-stone-950 border border-stone-800 hover:border-pink-500/60 transition-all text-center group"
            >
              <div className="text-xs font-bold text-stone-300 group-hover:text-pink-400">
                Instagram
              </div>
              <div className="text-[10px] text-pink-400/80 font-mono">Shielded</div>
            </button>

            <button
              onClick={() => handleInterceptTest('Snapchat', 'snapchat')}
              className="p-2.5 rounded-xl bg-stone-950 border border-stone-800 hover:border-yellow-500/60 transition-all text-center group"
            >
              <div className="text-xs font-bold text-stone-300 group-hover:text-yellow-400">
                Snapchat
              </div>
              <div className="text-[10px] text-yellow-400/80 font-mono">Shielded</div>
            </button>
          </div>

          <div className="text-[11px] text-stone-400 flex items-center justify-between pt-1">
            <span>Tap any app above to test the intercept screen</span>
            <Smartphone className="w-3.5 h-3.5" />
          </div>
        </div>
      </main>

      {/* Bottom Footer Actions */}
      <footer className="relative z-10 pt-4 border-t border-stone-800/80 flex items-center justify-between gap-3">
        <button
          onClick={() => setShowForfeitModal(true)}
          className="text-xs text-stone-500 hover:text-rose-400 transition-colors"
        >
          Exit Study Mode Early (Requires Physical Task)
        </button>

        <button
          onClick={() => onEndStudyMode(true)}
          className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium"
        >
          Fast-Complete Session
        </button>
      </footer>

      {/* Forfeit Penalty Modal */}
      {showForfeitModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-sm w-full p-6 space-y-5 text-center shadow-2xl">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-stone-100">Exit Study Mode Early?</h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                To prevent compulsive phone checking, ending study mode early requires a physical task:
                walk 25 steps or do 5 squats.
              </p>
            </div>

            <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 flex items-center justify-between text-xs">
              <span className="text-stone-300">Penalty Steps:</span>
              <span className="font-mono text-emerald-400 font-bold">{forfeitSteps} / 25</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setForfeitSteps((prev) => Math.min(25, prev + 5))}
                className="flex-1 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-xs font-medium"
              >
                +5 Steps
              </button>
              <button
                onClick={() => {
                  sound.playSuccessChime();
                  onEndStudyMode(false);
                }}
                disabled={forfeitSteps < 25}
                className="flex-1 py-2 rounded-lg bg-rose-600 disabled:opacity-40 hover:bg-rose-500 text-white text-xs font-bold transition-all"
              >
                Confirm Exit
              </button>
            </div>

            <button
              onClick={() => setShowForfeitModal(false)}
              className="text-xs text-stone-400 hover:text-stone-200"
            >
              Resume Studying
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
