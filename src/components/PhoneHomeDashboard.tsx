import React from 'react';
import {
  BookOpen,
  ShieldCheck,
  Footprints,
  Camera,
  Activity,
  Smartphone,
  Sparkles,
  Clock,
  Play,
  Settings,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Flame,
  RotateCcw,
} from 'lucide-react';
import { MonitoredAppId, AppSettings, OnboardingAnswers } from '../types';

interface Props {
  settings: AppSettings;
  onboarding: OnboardingAnswers;
  onOpenStudyModal: () => void;
  onLaunchApp: (appId: MonitoredAppId) => void;
  onToggleAppMonitoring: (appId: MonitoredAppId) => void;
  onOpenSettings: () => void;
  onOpenStats: () => void;
  onRetakeOnboarding: () => void;
  onTestQuest: (questType: 'steps' | 'camera_green' | 'squats') => void;
}

const APP_INFO: Record<
  MonitoredAppId,
  {
    name: string;
    subtitle: string;
    badge: string;
    iconLetter: string;
    gradient: string;
    accentColor: string;
  }
> = {
  tiktok: {
    name: 'TikTok',
    subtitle: 'Vertical short-video stream',
    badge: 'Protected',
    iconLetter: 'T',
    gradient: 'from-stone-900 to-stone-950 border-rose-500/40 text-rose-500',
    accentColor: 'text-rose-400',
  },
  instagram: {
    name: 'Instagram',
    subtitle: 'Reels, stories & explore',
    badge: 'Protected',
    iconLetter: 'I',
    gradient: 'from-purple-950/60 to-pink-950/40 border-pink-500/40 text-pink-400',
    accentColor: 'text-pink-400',
  },
  snapchat: {
    name: 'Snapchat',
    subtitle: 'Spotlight, stories & chat',
    badge: 'Protected',
    iconLetter: 'S',
    gradient: 'from-amber-950/60 to-yellow-950/30 border-yellow-500/40 text-yellow-400',
    accentColor: 'text-yellow-400',
  },
  youtube: {
    name: 'YouTube Shorts',
    subtitle: 'Autoplay short recommendations',
    badge: 'Monitored',
    iconLetter: 'Y',
    gradient: 'from-red-950/50 to-stone-950 border-red-500/40 text-red-500',
    accentColor: 'text-red-400',
  },
  reddit: {
    name: 'Reddit',
    subtitle: 'Subreddits & comment threads',
    badge: 'Monitored',
    iconLetter: 'R',
    gradient: 'from-orange-950/50 to-stone-950 border-orange-500/40 text-orange-400',
    accentColor: 'text-orange-400',
  },
};

export const PhoneHomeDashboard: React.FC<Props> = ({
  settings,
  onboarding,
  onOpenStudyModal,
  onLaunchApp,
  onToggleAppMonitoring,
  onOpenSettings,
  onOpenStats,
  onRetakeOnboarding,
  onTestQuest,
}) => {
  return (
    <div className="flex flex-col min-h-screen max-w-xl mx-auto bg-stone-950 text-stone-100 p-5 sm:p-7 space-y-6">
      {/* Top App Header */}
      <header className="flex items-center justify-between border-b border-stone-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-stone-100 tracking-tight">Groundwork</h1>
            <p className="text-[11px] text-stone-400">Embodied Screen Time Sentinel</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenStats}
            title="Statistics"
            className="p-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 hover:text-white hover:bg-stone-800"
          >
            <BarChart3 className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenSettings}
            title="Settings"
            className="p-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 hover:text-white hover:bg-stone-800"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Hero Study Mode Action Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950/80 via-stone-900 to-indigo-900/30 border border-indigo-500/40 p-6 sm:p-7 shadow-2xl shadow-indigo-950/30">
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-400 px-2.5 py-0.5 rounded-full bg-indigo-950 border border-indigo-500/30">
              Deep Focus Tool
            </span>
            <BookOpen className="w-5 h-5 text-indigo-400" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Study Mode</h2>
            <p className="text-xs text-stone-300 leading-relaxed max-w-sm">
              Press to activate focused study time. Choose your duration, and TikTok, Instagram,
              and Snapchat are strictly shielded until your timer completes.
            </p>
          </div>

          <button
            onClick={onOpenStudyModal}
            className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 active:scale-98 transition-all"
          >
            <BookOpen className="w-4 h-4" />
            <span>Activate Study Mode</span>
          </button>
        </div>
      </div>

      {/* Monitored Permissive Apps (TikTok, Instagram, Snapchat) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-mono uppercase tracking-wider text-stone-400">
              Monitored Permissive Feeds
            </h2>
            <p className="text-[11px] text-stone-500">
              Locks after {Math.round(settings.thresholdSeconds / 60)}m continuous scrolling
            </p>
          </div>
          <button
            onClick={onRetakeOnboarding}
            className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Edit Setup</span>
          </button>
        </div>

        <div className="space-y-2.5">
          {(['tiktok', 'instagram', 'snapchat', 'youtube'] as MonitoredAppId[]).map((appId) => {
            const info = APP_INFO[appId];
            const isMonitored = settings.monitoredApps.includes(appId);

            return (
              <div
                key={appId}
                className={`p-4 rounded-2xl border transition-all ${
                  isMonitored
                    ? 'bg-stone-900/90 border-stone-800'
                    : 'bg-stone-950/40 border-stone-900 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-2xl border flex items-center justify-center font-bold text-base bg-stone-950 ${info.gradient}`}
                    >
                      {info.iconLetter}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-stone-100">{info.name}</span>
                        {isMonitored && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Shielded
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-stone-400">{info.subtitle}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onLaunchApp(appId)}
                      className="px-3.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <Play className="w-3 h-3 text-emerald-400 fill-emerald-400" />
                      <span>Launch</span>
                    </button>

                    <button
                      onClick={() => onToggleAppMonitoring(appId)}
                      title={isMonitored ? 'Disable Shield' : 'Enable Shield'}
                      className={`w-9 h-6 rounded-full transition-colors p-0.5 ${
                        isMonitored ? 'bg-emerald-600' : 'bg-stone-800'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform ${
                          isMonitored ? 'translate-x-3' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Real-World Quests Showcase */}
      <section className="space-y-3">
        <h2 className="text-xs font-mono uppercase tracking-wider text-stone-400">
          The 3 Real-World Unlock Quests
        </h2>
        <div className="grid grid-cols-3 gap-2.5">
          <button
            onClick={() => onTestQuest('steps')}
            className="p-3.5 rounded-2xl bg-stone-900 border border-stone-800 hover:border-emerald-500/50 text-left space-y-2 transition-all group"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <Footprints className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-stone-200">50 Steps</div>
              <div className="text-[10px] text-stone-400">Pedometer test</div>
            </div>
          </button>

          <button
            onClick={() => onTestQuest('camera_green')}
            className="p-3.5 rounded-2xl bg-stone-900 border border-stone-800 hover:border-emerald-500/50 text-left space-y-2 transition-all group"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-stone-200">Greenery Photo</div>
              <div className="text-[10px] text-stone-400">Gemini Vision</div>
            </div>
          </button>

          <button
            onClick={() => onTestQuest('squats')}
            className="p-3.5 rounded-2xl bg-stone-900 border border-stone-800 hover:border-emerald-500/50 text-left space-y-2 transition-all group"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-stone-200">10 Squats</div>
              <div className="text-[10px] text-stone-400">Motion sensor</div>
            </div>
          </button>
        </div>
      </section>

      {/* Groundwork Philosophy Footer */}
      <footer className="pt-2 text-center text-xs text-stone-500 space-y-1">
        <div>Continuous Usage Tracking · Physical Lock Sentinel</div>
        <div className="text-[11px] text-stone-600">
          Configured based on your setup questionnaire
        </div>
      </footer>
    </div>
  );
};
