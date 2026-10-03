import React from 'react';
import { X, Footprints, Activity, Camera, Award, Clock, ArrowUpRight } from 'lucide-react';
import { BreakHistory } from '../types';

interface Props {
  history: BreakHistory[];
  totalConsecutiveMinutesToday: number;
  onClose: () => void;
}

export const StatsDrawer: React.FC<Props> = ({
  history,
  totalConsecutiveMinutesToday,
  onClose,
}) => {
  const totalStepsWalked = history.reduce((sum, h) => sum + (h.metrics.steps || 0), 0);
  const totalSquatsCompleted = history.reduce((sum, h) => sum + (h.metrics.squats || 0), 0);
  const totalPhotosTaken = history.filter((h) => h.metrics.photoSubject).length;
  const totalMindfulBlocksEarned = history.reduce((sum, h) => sum + h.grantedBlockMinutes, 0);

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex justify-end">
      <div className="bg-stone-900 border-l border-stone-800 w-full max-w-md h-full flex flex-col justify-between p-6 overflow-y-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-stone-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-stone-100">Mindful Movement Stats</h2>
              <p className="text-xs text-stone-400">Physical interventions during screen locks</p>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-stone-950 border border-stone-800 rounded-xl space-y-1">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-medium">
                <Footprints className="w-4 h-4" />
                <span>Steps Walked</span>
              </div>
              <div className="text-2xl font-extrabold font-mono text-stone-100">
                {totalStepsWalked}
              </div>
              <div className="text-[11px] text-stone-400">during screen locks</div>
            </div>

            <div className="p-4 bg-stone-950 border border-stone-800 rounded-xl space-y-1">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-medium">
                <Activity className="w-4 h-4" />
                <span>Squats Completed</span>
              </div>
              <div className="text-2xl font-extrabold font-mono text-stone-100">
                {totalSquatsCompleted}
              </div>
              <div className="text-[11px] text-stone-400">synovial knee resets</div>
            </div>

            <div className="p-4 bg-stone-950 border border-stone-800 rounded-xl space-y-1">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-medium">
                <Camera className="w-4 h-4" />
                <span>Outdoor Photos</span>
              </div>
              <div className="text-2xl font-extrabold font-mono text-stone-100">
                {totalPhotosTaken}
              </div>
              <div className="text-[11px] text-stone-400">greenery connections</div>
            </div>

            <div className="p-4 bg-stone-950 border border-stone-800 rounded-xl space-y-1">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-medium">
                <Clock className="w-4 h-4" />
                <span>Mindful Time</span>
              </div>
              <div className="text-2xl font-extrabold font-mono text-stone-100">
                +{totalMindfulBlocksEarned}m
              </div>
              <div className="text-[11px] text-stone-400">earned with movement</div>
            </div>
          </div>

          {/* Break History Log */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-stone-400">
              Completed Quests Today
            </h3>

            {history.length === 0 ? (
              <div className="text-center py-8 text-xs text-stone-500 border border-dashed border-stone-800 rounded-xl">
                No physical quests completed yet. As you browse and cross your limit, your quests will log here.
              </div>
            ) : (
              <div className="space-y-2.5">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 bg-stone-950 border border-stone-800/80 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div className="space-y-1">
                      <div className="font-semibold text-stone-200">{item.questTitle}</div>
                      <div className="text-[11px] text-stone-400">
                        Locked after {Math.round(item.consecutiveUsageBeforeLock / 60)}m scrolling · Earned +{item.grantedBlockMinutes}m
                      </div>
                    </div>
                    <div className="text-right font-mono text-[11px] text-emerald-400">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-stone-800 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
