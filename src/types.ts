export type QuestType = 'steps' | 'camera_green' | 'squats' | 'hydration' | 'eye_rest';

export interface Quest {
  id: string;
  type: QuestType;
  title: string;
  subtitle: string;
  targetValue: number;
  unit: string;
  instructions: string;
  rewardMinutes: number;
  icon: string;
}

export interface VerificationResult {
  verified: boolean;
  confidence: number;
  detectedSubject?: string;
  feedback: string;
  mindfulnessTip?: string;
  source?: string;
}

export type MonitoredAppId = 'tiktok' | 'instagram' | 'snapchat' | 'youtube' | 'reddit';

export interface MonitoredApp {
  id: MonitoredAppId;
  name: string;
  brandTag: string;
  color: string;
  bgColor: string;
  borderColor: string;
  isMonitored: boolean;
  todayMinutes: number;
  iconType: 'tiktok' | 'instagram' | 'snapchat' | 'youtube' | 'reddit';
  description: string;
}

export interface StudyModeState {
  isActive: boolean;
  subject: string;
  durationMinutes: number;
  remainingSeconds: number;
  startedAt: number;
}

export interface OnboardingAnswers {
  isCompleted: boolean;
  monitoredApps: MonitoredAppId[];
  averageDoomscrollTime: string;
  primaryQuestPreference: QuestType;
  thresholdMinutes: number;
  studyGoalHoursWeekly: number;
}

export interface BreakHistory {
  id: string;
  timestamp: number;
  questType: QuestType;
  questTitle: string;
  consecutiveUsageBeforeLock: number; // in seconds
  grantedBlockMinutes: number;
  triggeredByApp?: string;
  metrics: {
    steps?: number;
    squats?: number;
    photoSubject?: string;
    photoUrl?: string;
  };
}

export interface AppSettings {
  thresholdSeconds: number; // e.g. 1200 for 20m, 30 for quick test
  rewardBlockMinutes: number; // e.g. 15m
  warningNoticePercent: number; // e.g. 80%
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  activeAppId: MonitoredAppId;
  autoStartOnMount: boolean;
  monitoredApps: MonitoredAppId[];
}
