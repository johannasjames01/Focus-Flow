import React, { useState } from 'react';
import {
  Check,
  ChevronRight,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Footprints,
  Camera,
  Activity,
  Flame,
  ArrowRight,
  Clock,
  BookOpen,
} from 'lucide-react';
import { MonitoredAppId, QuestType, OnboardingAnswers } from '../types';
import { sound } from '../utils/audio';

interface Props {
  onComplete: (answers: OnboardingAnswers) => void;
}

const APPS: Array<{
  id: MonitoredAppId;
  name: string;
  tagline: string;
  iconBg: string;
  badge: string;
}> = [
  {
    id: 'tiktok',
    name: 'TikTok',
    tagline: 'Infinite short-form video algorithm',
    iconBg: 'bg-black text-rose-500 border-rose-500/40',
    badge: 'High Dopamine',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    tagline: 'Reels, stories & explore grid',
    iconBg: 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white border-rose-400/40',
    badge: 'Habitual Scroll',
  },
  {
    id: 'snapchat',
    name: 'Snapchat',
    tagline: 'Stories, spotlight & streaks',
    iconBg: 'bg-yellow-400 text-stone-950 border-yellow-300',
    badge: 'FOMO Triggers',
  },
  {
    id: 'youtube',
    name: 'YouTube Shorts',
    tagline: 'Endless autoplay recommendation feed',
    iconBg: 'bg-red-600 text-white border-red-500/40',
    badge: 'Autoplay Loop',
  },
  {
    id: 'reddit',
    name: 'Reddit',
    tagline: 'Thread rabbit holes & endless comments',
    iconBg: 'bg-orange-600 text-white border-orange-500/40',
    badge: 'Information Trap',
  },
];

const TIME_OPTIONS = [
  { label: '15 to 30 minutes', desc: 'Brief but frequent slip-ups', value: '15-30m' },
  { label: '30 to 60 minutes', desc: 'Standard evening doomscroll trance', value: '30-60m' },
  { label: '1 to 2+ hours', desc: 'Deep rabbit hole loss of control', value: '1-2h+' },
];

const QUEST_OPTIONS: Array<{
  type: QuestType;
  title: string;
  desc: string;
  icon: any;
}> = [
  {
    type: 'steps',
    title: 'Walk 50 Steps',
    desc: 'Uses phone pedometer to ensure you stand up and circulate blood.',
    icon: Footprints,
  },
  {
    type: 'camera_green',
    title: 'Photograph Outdoor Greenery',
    desc: 'Uses camera to verify real plants or trees outside your window.',
    icon: Camera,
  },
  {
    type: 'squats',
    title: 'Do 10 Bodyweight Squats',
    desc: 'Uses motion sensors to detect knee bends and stimulate dopamine.',
    icon: Activity,
  },
];

const THRESHOLD_OPTIONS = [
  { label: '30 seconds', sub: 'Instant Demo Testing', value: 30 },
  { label: '10 minutes', sub: 'Strict Focus Shield', value: 600 },
  { label: '20 minutes', sub: 'Recommended Balance', value: 1200 },
  { label: '30 minutes', sub: 'Extended Allowance', value: 1800 },
];

export const OnboardingFlow: React.FC<Props> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [selectedApps, setSelectedApps] = useState<MonitoredAppId[]>([
    'tiktok',
    'instagram',
    'snapchat',
  ]);
  const [lostTime, setLostTime] = useState('30-60m');
  const [primaryQuest, setPrimaryQuest] = useState<QuestType>('steps');
  const [thresholdSeconds, setThresholdSeconds] = useState(1200);

  const toggleApp = (id: MonitoredAppId) => {
    setSelectedApps((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const handleNext = () => {
    sound.playStepTick();
    if (step < 4) {
      setStep(step + 1);
    } else {
      sound.playSuccessChime();
      onComplete({
        isCompleted: true,
        monitoredApps: selectedApps,
        averageDoomscrollTime: lostTime,
        primaryQuestPreference: primaryQuest,
        thresholdMinutes: Math.round(thresholdSeconds / 60),
        studyGoalHoursWeekly: 10,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950 text-stone-100 flex flex-col justify-between p-6 sm:p-10 overflow-y-auto selection:bg-emerald-500 selection:text-stone-950">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))] pointer-events-none" />

      {/* Top indicator */}
      <header className="relative z-10 max-w-xl w-full mx-auto flex items-center justify-between border-b border-stone-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-stone-200">Groundwork Setup</span>
            <span className="text-xs text-stone-500 ml-2">Phone Screen Sentinel</span>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s === step
                  ? 'w-6 bg-emerald-400'
                  : s < step
                  ? 'w-3 bg-emerald-600'
                  : 'w-2 bg-stone-800'
              }`}
            />
          ))}
        </div>
      </header>

      {/* Questionnaire Body */}
      <main className="relative z-10 max-w-xl w-full mx-auto my-auto py-8 space-y-6">
        {/* STEP 1: APPS */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-2">
              <div className="text-xs font-mono uppercase text-emerald-400 tracking-wider">
                Question 1 of 4 · Monitored Permissive Apps
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-100 tracking-tight">
                Which apps hijack your focus the most?
              </h2>
              <p className="text-xs text-stone-400 leading-relaxed">
                Groundwork runs in the background. When you open any of these selected apps,
                it monitors your consecutive usage and locks the screen once your threshold is reached.
              </p>
            </div>

            <div className="space-y-2.5">
              {APPS.map((app) => {
                const isSelected = selectedApps.includes(app.id);
                return (
                  <button
                    key={app.id}
                    onClick={() => toggleApp(app.id)}
                    className={`w-full p-4 rounded-xl border flex items-center justify-between text-left transition-all ${
                      isSelected
                        ? 'bg-stone-900 border-emerald-500/60 shadow-md shadow-emerald-950/20'
                        : 'bg-stone-950/60 border-stone-800 hover:border-stone-700 text-stone-400'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-sm ${app.iconBg}`}
                      >
                        {app.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-stone-200">{app.name}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-800 text-stone-300">
                            {app.badge}
                          </span>
                        </div>
                        <div className="text-xs text-stone-400">{app.tagline}</div>
                      </div>
                    </div>

                    <div
                      className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-emerald-500 border-emerald-500 text-stone-950 font-bold'
                          : 'border-stone-700 bg-stone-900'
                      }`}
                    >
                      {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: LOST TIME */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-2">
              <div className="text-xs font-mono uppercase text-emerald-400 tracking-wider">
                Question 2 of 4 · Attention Assessment
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-100 tracking-tight">
                How much time do you usually lose in a single scrolling session?
              </h2>
              <p className="text-xs text-stone-400 leading-relaxed">
                Passive scrolling causes cognitive accommodation fatigue. We calibrate your lockout
                sentinel based on your typical trance depth.
              </p>
            </div>

            <div className="space-y-3">
              {TIME_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setLostTime(opt.value)}
                  className={`w-full p-4 rounded-xl border flex items-center justify-between text-left transition-all ${
                    lostTime === opt.value
                      ? 'bg-stone-900 border-emerald-500/60 shadow-md'
                      : 'bg-stone-950/60 border-stone-800 hover:border-stone-700'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="text-sm font-bold text-stone-200">{opt.label}</div>
                    <div className="text-xs text-stone-400">{opt.desc}</div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      lostTime === opt.value
                        ? 'border-emerald-500 bg-emerald-500 text-stone-950 font-bold'
                        : 'border-stone-700'
                    }`}
                  >
                    {lostTime === opt.value && <div className="w-2 h-2 rounded-full bg-stone-950" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: PHYSICAL QUEST PREFERENCE */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-2">
              <div className="text-xs font-mono uppercase text-emerald-400 tracking-wider">
                Question 3 of 4 · Physical Grounding
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-100 tracking-tight">
                Choose your primary real-world unlock quest
              </h2>
              <p className="text-xs text-stone-400 leading-relaxed">
                When Groundwork locks your screen, it never presents a dead-end. You unlock fresh screen
                time by completing this real-world task verified by phone sensors.
              </p>
            </div>

            <div className="space-y-3">
              {QUEST_OPTIONS.map((quest) => {
                const Icon = quest.icon;
                const isSelected = primaryQuest === quest.type;
                return (
                  <button
                    key={quest.type}
                    onClick={() => setPrimaryQuest(quest.type)}
                    className={`w-full p-4 rounded-xl border flex items-start gap-4 text-left transition-all ${
                      isSelected
                        ? 'bg-stone-900 border-emerald-500/60 shadow-md'
                        : 'bg-stone-950/60 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                          : 'bg-stone-900 border-stone-800 text-stone-400'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="text-sm font-bold text-stone-200">{quest.title}</div>
                      <div className="text-xs text-stone-400 leading-relaxed">{quest.desc}</div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-1 ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500 text-stone-950 font-bold'
                          : 'border-stone-700'
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-stone-950" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: CONSECUTIVE THRESHOLD */}
        {step === 4 && (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-2">
              <div className="text-xs font-mono uppercase text-emerald-400 tracking-wider">
                Question 4 of 4 · Time Threshold
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-100 tracking-tight">
                After how many consecutive minutes should the app lock?
              </h2>
              <p className="text-xs text-stone-400 leading-relaxed">
                If you scroll TikTok, Instagram, or Snapchat for this long continuously,
                Groundwork immediately grounds your screen until your physical quest is completed.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {THRESHOLD_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setThresholdSeconds(opt.value)}
                  className={`p-4 rounded-xl border text-left space-y-1 transition-all ${
                    thresholdSeconds === opt.value
                      ? 'bg-stone-900 border-emerald-500/60 shadow-md'
                      : 'bg-stone-950/60 border-stone-800 hover:border-stone-700'
                  }`}
                >
                  <div className="text-base font-bold text-stone-200">{opt.label}</div>
                  <div className="text-[11px] text-stone-400">{opt.sub}</div>
                </button>
              ))}
            </div>

            <div className="p-4 bg-stone-900 border border-stone-800 rounded-xl space-y-2 text-xs text-stone-300">
              <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Study Mode Bonus Enabled</span>
              </div>
              <p className="text-stone-400 leading-relaxed">
                You'll also get a dedicated <strong>Study Mode</strong> button on your dashboard.
                When activated, you set how long you want to study for, and all social apps are
                strictly locked for the entire duration!
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <footer className="relative z-10 max-w-xl w-full mx-auto pt-4 border-t border-stone-800/80 flex items-center justify-between">
        {step > 1 ? (
          <button
            onClick={() => setStep(step - 1)}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-stone-400 hover:text-stone-200"
          >
            Back
          </button>
        ) : (
          <div className="text-[11px] text-stone-500">Takes under 60 seconds</div>
        )}

        <button
          onClick={handleNext}
          disabled={step === 1 && selectedApps.length === 0}
          className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-stone-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
        >
          <span>{step === 4 ? 'Activate Groundwork Sentinel' : 'Continue'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </footer>
    </div>
  );
};
