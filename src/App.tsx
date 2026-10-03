import React, { useState, useEffect, useRef } from 'react';
import { OnboardingFlow } from './components/OnboardingFlow';
import { PhoneHomeDashboard } from './components/PhoneHomeDashboard';
import { StudyModeModal } from './components/StudyModeModal';
import { StudyModeHUD } from './components/StudyModeHUD';
import { PermissiveAppSimulator } from './components/PermissiveAppSimulator';
import { LockScreen } from './components/LockScreen';
import { GracefulReturn } from './components/GracefulReturn';
import { SettingsModal } from './components/SettingsModal';
import { StatsDrawer } from './components/StatsDrawer';
import {
  AppSettings,
  BreakHistory,
  QuestType,
  MonitoredAppId,
  StudyModeState,
  OnboardingAnswers,
} from './types';
import { sound } from './utils/audio';

const STORAGE_KEY_SETTINGS = 'groundwork_settings_v2';
const STORAGE_KEY_HISTORY = 'groundwork_history_v2';
const STORAGE_KEY_ONBOARDING = 'groundwork_onboarding_v2';

const DEFAULT_ONBOARDING: OnboardingAnswers = {
  isCompleted: false,
  monitoredApps: ['tiktok', 'instagram', 'snapchat'],
  averageDoomscrollTime: '30-60m',
  primaryQuestPreference: 'steps',
  thresholdMinutes: 20,
  studyGoalHoursWeekly: 10,
};

const DEFAULT_SETTINGS: AppSettings = {
  thresholdSeconds: 1200, // 20 minutes default from prompt
  rewardBlockMinutes: 15, // 15 minutes fresh mindful block
  warningNoticePercent: 80,
  soundEnabled: true,
  hapticsEnabled: true,
  activeAppId: 'tiktok',
  autoStartOnMount: true,
  monitoredApps: ['tiktok', 'instagram', 'snapchat', 'youtube'],
};

export default function App() {
  // 1. Onboarding questionnaire state
  const [onboarding, setOnboarding] = useState<OnboardingAnswers>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ONBOARDING);
      return saved ? JSON.parse(saved) : DEFAULT_ONBOARDING;
    } catch {
      return DEFAULT_ONBOARDING;
    }
  });

  // 2. Settings state
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // 3. History of completed breaks
  const [history, setHistory] = useState<BreakHistory[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 4. Navigation & App View state
  const [currentView, setCurrentView] = useState<'home' | 'simulator' | 'study_mode'>('home');
  const [activeSimulatorApp, setActiveSimulatorApp] = useState<MonitoredAppId>('tiktok');

  // 5. Continuous usage tracking state inside permissive apps
  const [consecutiveSeconds, setConsecutiveSeconds] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [isGracefulReturn, setIsGracefulReturn] = useState(false);
  const [testQuestType, setTestQuestType] = useState<QuestType>('steps');

  const [completedQuestData, setCompletedQuestData] = useState<{
    questType: QuestType;
    questTitle: string;
    metrics: {
      steps?: number;
      squats?: number;
      photoSubject?: string;
      photoUrl?: string;
    };
  } | null>(null);

  // 6. Study Mode state
  const [showStudyModal, setShowStudyModal] = useState(false);
  const [studyState, setStudyState] = useState<StudyModeState>({
    isActive: false,
    subject: 'General Study',
    durationMinutes: 25,
    remainingSeconds: 25 * 60,
    startedAt: 0,
  });

  // 7. Mindful Block countdown
  const [mindfulBlockRemaining, setMindfulBlockRemaining] = useState<number | null>(null);

  // 8. Modals
  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats] = useState(false);

  // Sync sound settings
  useEffect(() => {
    sound.setEnabled(settings.soundEnabled);
  }, [settings.soundEnabled]);

  // Main continuous usage timer (only counts up while inside the permissive app simulator)
  useEffect(() => {
    if (currentView !== 'simulator' || isLocked || isGracefulReturn) return;

    const interval = setInterval(() => {
      setConsecutiveSeconds((prev) => {
        const next = prev + 1;

        // Warning sound at 80% threshold
        const warningThreshold = Math.floor(settings.thresholdSeconds * 0.8);
        if (next === warningThreshold && settings.soundEnabled) {
          sound.playWarningPing();
        }

        // Lock takeover at threshold
        if (next >= settings.thresholdSeconds) {
          triggerLock();
          return settings.thresholdSeconds;
        }

        return next;
      });

      // Also tick down granted mindful block if active
      setMindfulBlockRemaining((prev) => {
        if (prev === null) return null;
        if (prev <= 1) return null;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentView, isLocked, isGracefulReturn, settings.thresholdSeconds, settings.soundEnabled]);

  // Study Mode countdown timer
  useEffect(() => {
    if (!studyState.isActive) return;

    const timer = setInterval(() => {
      setStudyState((prev) => {
        if (prev.remainingSeconds <= 1) {
          clearInterval(timer);
          sound.playSuccessChime();
          // Study session completed!
          return {
            ...prev,
            isActive: false,
            remainingSeconds: 0,
          };
        }
        return {
          ...prev,
          remainingSeconds: prev.remainingSeconds - 1,
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [studyState.isActive]);

  const triggerLock = () => {
    setIsLocked(true);
    setIsGracefulReturn(false);
  };

  const handleQuestCompleted = (result: {
    questType: QuestType;
    questTitle: string;
    metrics: {
      steps?: number;
      squats?: number;
      photoSubject?: string;
      photoUrl?: string;
    };
  }) => {
    setCompletedQuestData(result);
    setIsLocked(false);
    setIsGracefulReturn(true);

    const newHistoryItem: BreakHistory = {
      id: `h_${Date.now()}`,
      timestamp: Date.now(),
      questType: result.questType,
      questTitle: result.questTitle,
      consecutiveUsageBeforeLock: consecutiveSeconds,
      grantedBlockMinutes: settings.rewardBlockMinutes,
      triggeredByApp: activeSimulatorApp,
      metrics: result.metrics,
    };

    const updated = [newHistoryItem, ...history];
    setHistory(updated);
    try {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
    } catch (e) {}
  };

  const handleResumeMindfulBrowsing = () => {
    setConsecutiveSeconds(0);
    setMindfulBlockRemaining(settings.rewardBlockMinutes * 60);
    setIsGracefulReturn(false);
    setCompletedQuestData(null);
  };

  const handleStartStudyMode = (durationMinutes: number, subject: string) => {
    setStudyState({
      isActive: true,
      subject,
      durationMinutes,
      remainingSeconds: durationMinutes * 60,
      startedAt: Date.now(),
    });
    setShowStudyModal(false);
    setCurrentView('study_mode');
  };

  const handleEndStudyMode = (completed: boolean) => {
    setStudyState((prev) => ({ ...prev, isActive: false }));
    setCurrentView('home');
  };

  const handleLaunchApp = (appId: MonitoredAppId) => {
    if (studyState.isActive) {
      // If user tries to open a monitored app during Study Mode
      sound.playLockGong();
      triggerLock();
      return;
    }
    setActiveSimulatorApp(appId);
    setCurrentView('simulator');
  };

  const handleToggleMonitoring = (appId: MonitoredAppId) => {
    setSettings((prev) => {
      const exists = prev.monitoredApps.includes(appId);
      const updatedList = exists
        ? prev.monitoredApps.filter((id) => id !== appId)
        : [...prev.monitoredApps, appId];
      const updated = { ...prev, monitoredApps: updatedList };
      try {
        localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleCompleteOnboarding = (answers: OnboardingAnswers) => {
    setOnboarding(answers);
    const updatedSettings: AppSettings = {
      ...settings,
      thresholdSeconds: answers.thresholdMinutes * 60,
      monitoredApps: answers.monitoredApps,
    };
    setSettings(updatedSettings);

    try {
      localStorage.setItem(STORAGE_KEY_ONBOARDING, JSON.stringify(answers));
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(updatedSettings));
    } catch (e) {}
  };

  const isWarning = consecutiveSeconds >= Math.floor(settings.thresholdSeconds * 0.8) && !isLocked;

  // Decide which quest to present
  const getSelectedQuestType = (): QuestType => {
    return onboarding.primaryQuestPreference || 'steps';
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans antialiased selection:bg-emerald-500 selection:text-stone-950">
      {/* 1. Onboarding Questionnaire flow if first time launching */}
      {!onboarding.isCompleted && (
        <OnboardingFlow onComplete={handleCompleteOnboarding} />
      )}

      {/* Mindful Block floating notification if granted */}
      {mindfulBlockRemaining !== null && !isLocked && !isGracefulReturn && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-emerald-950/95 border border-emerald-500/50 text-emerald-200 px-4 py-2 rounded-full text-xs font-mono shadow-2xl flex items-center gap-2 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>
            Mindful Block Active:{' '}
            {Math.floor(mindfulBlockRemaining / 60)}m {mindfulBlockRemaining % 60}s remaining
          </span>
        </div>
      )}

      {/* 2. Main Phone Dashboard View */}
      {onboarding.isCompleted && currentView === 'home' && (
        <PhoneHomeDashboard
          settings={settings}
          onboarding={onboarding}
          onOpenStudyModal={() => setShowStudyModal(true)}
          onLaunchApp={handleLaunchApp}
          onToggleAppMonitoring={handleToggleMonitoring}
          onOpenSettings={() => setShowSettings(true)}
          onOpenStats={() => setShowStats(true)}
          onRetakeOnboarding={() =>
            setOnboarding((prev) => ({ ...prev, isCompleted: false }))
          }
          onTestQuest={(type) => {
            setTestQuestType(type);
            triggerLock();
          }}
        />
      )}

      {/* 3. Permissive App Feed Simulator (TikTok, Instagram, Snapchat) */}
      {onboarding.isCompleted && currentView === 'simulator' && (
        <PermissiveAppSimulator
          consecutiveSeconds={consecutiveSeconds}
          thresholdSeconds={settings.thresholdSeconds}
          isWarning={isWarning}
          settings={settings}
          activeAppId={activeSimulatorApp}
          onChangeApp={(appId) => setActiveSimulatorApp(appId)}
          onOpenSettings={() => setShowSettings(true)}
          onOpenStats={() => setShowStats(true)}
          onTriggerLock={triggerLock}
          onAddMinutes={(mins) => {
            setConsecutiveSeconds((prev) => {
              const next = prev + mins * 60;
              if (next >= settings.thresholdSeconds) {
                triggerLock();
                return settings.thresholdSeconds;
              }
              return next;
            });
          }}
          onBackToHome={() => setCurrentView('home')}
          onOpenStudyMode={() => setShowStudyModal(true)}
        />
      )}

      {/* 4. Active Study Mode View */}
      {onboarding.isCompleted && currentView === 'study_mode' && (
        <StudyModeHUD
          studyState={studyState}
          onEndStudyMode={handleEndStudyMode}
          onTryOpenApp={(appId) => {
            // When user tries to open a monitored app during study mode, trigger the lock!
            triggerLock();
          }}
        />
      )}

      {/* 5. Physical Quest Lock Screen Takeover */}
      {isLocked && (
        <LockScreen
          consecutiveSeconds={consecutiveSeconds}
          initialQuestType={testQuestType || getSelectedQuestType()}
          settings={settings}
          onQuestCompleted={handleQuestCompleted}
        />
      )}

      {/* 6. Graceful Return Reward Celebration */}
      {isGracefulReturn && completedQuestData && (
        <GracefulReturn
          questType={completedQuestData.questType}
          questTitle={completedQuestData.questTitle}
          metrics={completedQuestData.metrics}
          rewardMinutes={settings.rewardBlockMinutes}
          onResume={handleResumeMindfulBrowsing}
        />
      )}

      {/* 7. Study Mode Setup Modal (Prompt: "in the app there is a button for study mode when pressed it asks how long and thats how long the study mode is there for") */}
      {showStudyModal && (
        <StudyModeModal
          onStartStudyMode={handleStartStudyMode}
          onClose={() => setShowStudyModal(false)}
        />
      )}

      {/* 8. Settings Modal */}
      {showSettings && (
        <SettingsModal
          settings={settings}
          onSave={(updated) => {
            setSettings(updated);
            try {
              localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(updated));
            } catch (e) {}
          }}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* 9. Somatic Stats Drawer */}
      {showStats && (
        <StatsDrawer
          history={history}
          totalConsecutiveMinutesToday={Math.round(consecutiveSeconds / 60)}
          onClose={() => setShowStats(false)}
        />
      )}
    </div>
  );
}
