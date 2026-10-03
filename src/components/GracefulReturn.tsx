import React, { useEffect, useRef } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  Footprints,
  Camera,
  Activity,
  Droplets,
  Eye,
  HeartPulse,
} from 'lucide-react';
import { QuestType } from '../types';
import { sound } from '../utils/audio';

interface Props {
  questType: QuestType;
  questTitle: string;
  metrics: {
    steps?: number;
    squats?: number;
    photoSubject?: string;
    photoUrl?: string;
  };
  rewardMinutes: number;
  onResume: () => void;
}

export const GracefulReturn: React.FC<Props> = ({
  questType,
  questTitle,
  metrics,
  rewardMinutes,
  onResume,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Celebratory confetti particles
  useEffect(() => {
    sound.playSuccessChime();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#10b981', '#34d399', '#6ee7b7', '#f59e0b', '#38bdf8', '#a855f7'];
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
      rotation: number;
      rotationSpeed: number;
    }> = [];

    for (let i = 0; i < 90; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 200,
        y: canvas.height * 0.45,
        vx: (Math.random() - 0.5) * 14,
        vy: (Math.random() - 1) * 12 - 4,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 8,
      });
    }

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.28; // gravity
        p.vx *= 0.98; // air resistance
        p.alpha -= 0.007;
        p.rotation += p.rotationSpeed;

        if (p.alpha > 0) {
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
          ctx.restore();
        }
      });

      if (particles.some((p) => p.alpha > 0)) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/95 backdrop-blur-xl text-stone-100 flex items-center justify-center p-6 selection:bg-emerald-500 selection:text-stone-950">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-10 w-full h-full"
      />

      <div className="relative z-20 max-w-md w-full bg-stone-900 border border-stone-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
        {/* Success badge */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase text-emerald-400 tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Real-World Quest Completed</span>
          </div>
          <h2 className="text-2xl font-extrabold text-stone-100 tracking-tight">
            {questTitle}
          </h2>
          <p className="text-xs text-stone-400">
            You broke the digital hypnosis with real biological movement.
          </p>
        </div>

        {/* Accomplishment highlights */}
        <div className="p-4 bg-stone-950/70 border border-stone-800/80 rounded-2xl space-y-3 text-left">
          <div className="text-[11px] font-mono text-stone-400 uppercase tracking-wider">
            Somatic Metrics Restored
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            {metrics.steps !== undefined && (
              <div className="flex items-center gap-2 text-stone-200">
                <Footprints className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{metrics.steps} strides logged</span>
              </div>
            )}
            {metrics.squats !== undefined && (
              <div className="flex items-center gap-2 text-stone-200">
                <Activity className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{metrics.squats} bodyweight squats</span>
              </div>
            )}
            {metrics.photoSubject && (
              <div className="col-span-2 flex items-center gap-2 text-stone-200">
                <Camera className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate">{metrics.photoSubject}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-stone-200">
              <HeartPulse className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Circulation reset</span>
            </div>
            <div className="flex items-center gap-2 text-stone-200">
              <Eye className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Ciliary muscles eased</span>
            </div>
          </div>
        </div>

        {/* Fresh Block Reward Card */}
        <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-emerald-200">
                +{rewardMinutes} Minutes Awarded
              </div>
              <div className="text-xs text-emerald-400/80">Fresh block of mindful screen time</div>
            </div>
          </div>
        </div>

        <p className="text-xs text-stone-400 leading-relaxed italic">
          "When you return to your screen, browse with deliberate intention rather than passive drift."
        </p>

        {/* CTA to resume */}
        <button
          onClick={onResume}
          className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-98 transition-all"
        >
          <span>Resume Screen with Intention</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
