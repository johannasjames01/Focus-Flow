import React from 'react';
import { X, Sliders, Volume2, VolumeX, Vibrate, Clock, Sparkles } from 'lucide-react';
import { AppSettings, QuestType } from '../types';

interface Props {
  settings: AppSettings;
  onSave: (updated: AppSettings) => void;
  onClose: () => void;
}

const THRESHOLD_OPTIONS = [
  { label: '15 seconds (Superfast Test)', value: 15 },
  { label: '30 seconds (Fast Demo)', value: 30 },
  { label: '1 minute (Quick Walkthrough)', value: 60 },
  { label: '5 minutes (Micro Break)', value: 300 },
  { label: '15 minutes (Standard)', value: 900 },
  { label: '20 minutes (Recommended by brief)', value: 1200 },
  { label: '30 minutes (Deep Focus)', value: 1800 },
];

const REWARD_OPTIONS = [
  { label: '5 minutes', value: 5 },
  { label: '10 minutes', value: 10 },
  { label: '15 minutes (Standard block)', value: 15 },
  { label: '25 minutes (Pomodoro balance)', value: 25 },
];

export const SettingsModal: React.FC<Props> = ({ settings, onSave, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div className="flex items-center gap-2 text-stone-100 font-bold text-base">
            <Sliders className="w-5 h-5 text-emerald-400" />
            <span>Usage Sentinel Settings</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Continuous Threshold Selection */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Consecutive Usage Threshold (Triggers Physical Quest)</span>
          </label>
          <p className="text-[11px] text-stone-400">
            How many consecutive minutes of scrolling before the screen locks for a physical quest.
          </p>
          <select
            value={settings.thresholdSeconds}
            onChange={(e) =>
              onSave({ ...settings, thresholdSeconds: Number(e.target.value) })
            }
            className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-emerald-500"
          >
            {THRESHOLD_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Reward Block Selection */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Graceful Return Reward Block</span>
          </label>
          <p className="text-[11px] text-stone-400">
            Screen time block unlocked once the physical task is completed.
          </p>
          <select
            value={settings.rewardBlockMinutes}
            onChange={(e) =>
              onSave({ ...settings, rewardBlockMinutes: Number(e.target.value) })
            }
            className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-emerald-500"
          >
            {REWARD_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sensory Toggles */}
        <div className="space-y-3 pt-2 border-t border-stone-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-stone-300">
              <Volume2 className="w-4 h-4 text-emerald-400" />
              <span>Procedural Web Audio Chimes</span>
            </div>
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={(e) =>
                onSave({ ...settings, soundEnabled: e.target.checked })
              }
              className="accent-emerald-500 w-4 h-4 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-stone-300">
              <Vibrate className="w-4 h-4 text-emerald-400" />
              <span>Haptic Feedback on Step / Squat Reps</span>
            </div>
            <input
              type="checkbox"
              checked={settings.hapticsEnabled}
              onChange={(e) =>
                onSave({ ...settings, hapticsEnabled: e.target.checked })
              }
              className="accent-emerald-500 w-4 h-4 cursor-pointer"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold text-xs"
          >
            Done & Apply
          </button>
        </div>
      </div>
    </div>
  );
};
