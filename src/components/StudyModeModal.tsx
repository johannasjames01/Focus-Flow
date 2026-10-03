import React, { useState } from 'react';
import { X, BookOpen, Clock, ShieldAlert, Sparkles, Check, ChevronRight } from 'lucide-react';
import { sound } from '../utils/audio';

interface Props {
  onStartStudyMode: (durationMinutes: number, subject: string) => void;
  onClose: () => void;
}

const STUDY_PRESETS = [
  { label: '15 min', desc: 'Quick Sprint', minutes: 15 },
  { label: '25 min', desc: 'Pomodoro Focus', minutes: 25 },
  { label: '45 min', desc: 'Deep Study Block', minutes: 45 },
  { label: '60 min', desc: 'Exam Prep Grind', minutes: 60 },
  { label: '90 min', desc: 'Ultra Deep Work', minutes: 90 },
];

export const StudyModeModal: React.FC<Props> = ({ onStartStudyMode, onClose }) => {
  const [selectedMinutes, setSelectedMinutes] = useState(25);
  const [subject, setSubject] = useState('Deep Work & Learning');
  const [customMinutes, setCustomMinutes] = useState('');

  const handleStart = () => {
    const mins = customMinutes ? Math.max(1, parseInt(customMinutes, 10)) : selectedMinutes;
    sound.playSuccessChime();
    onStartStudyMode(mins, subject || 'Study Session');
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-6 shadow-2xl animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-100">Activate Study Mode</h2>
              <p className="text-xs text-stone-400">Strict lock on TikTok, Instagram & Snapchat</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Question: How long is your study session? */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-stone-200 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>How long do you want to study for?</span>
          </label>

          {/* Preset Buttons */}
          <div className="grid grid-cols-3 gap-2">
            {STUDY_PRESETS.map((p) => {
              const isSelected = selectedMinutes === p.minutes && !customMinutes;
              return (
                <button
                  key={p.minutes}
                  onClick={() => {
                    setSelectedMinutes(p.minutes);
                    setCustomMinutes('');
                  }}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    isSelected
                      ? 'bg-indigo-950/60 border-indigo-500/70 text-indigo-200 shadow-sm'
                      : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700'
                  }`}
                >
                  <div className="text-sm font-bold">{p.label}</div>
                  <div className="text-[10px] opacity-80">{p.desc}</div>
                </button>
              );
            })}
          </div>

          {/* Custom Minutes Input */}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-xs text-stone-400">Or custom:</span>
            <input
              type="number"
              min="1"
              max="240"
              placeholder="e.g. 35"
              value={customMinutes}
              onChange={(e) => setCustomMinutes(e.target.value)}
              className="w-24 bg-stone-950 border border-stone-800 rounded-lg px-3 py-1.5 text-xs text-stone-200 font-mono focus:outline-none focus:border-indigo-500"
            />
            <span className="text-xs text-stone-400">minutes</span>
          </div>
        </div>

        {/* Study Subject / Goal */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-stone-200">
            What are you focusing on?
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Biology Midterm, Math assignment, Reading..."
            className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-stone-200 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Strict shield notice */}
        <div className="p-3.5 bg-stone-950 border border-stone-800/80 rounded-2xl flex items-start gap-3 text-xs">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-stone-400 leading-relaxed">
            <div className="font-semibold text-stone-300">
              Total Lockdown for {customMinutes || selectedMinutes} minutes
            </div>
            <div>
              TikTok, Instagram, Snapchat, and other addictive feeds will be strictly shielded.
              If you try to open them, Groundwork will immediately push you back to your study desk.
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={handleStart}
            className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-98 transition-all"
          >
            <BookOpen className="w-4 h-4" />
            <span>Start Study Mode ({customMinutes || selectedMinutes} mins)</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-2 text-xs text-stone-500 hover:text-stone-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
