import React, { useState, useEffect, useRef } from 'react';
import {
  Smartphone,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Sparkles,
  Flame,
  Clock,
  Settings as SettingsIcon,
  BarChart3,
  FastForward,
  Play,
  Pause,
  ChevronLeft,
  Volume2,
  VolumeX,
  Music,
  Send,
  MoreVertical,
  AlertTriangle,
  BookOpen,
} from 'lucide-react';
import { MonitoredAppId, AppSettings } from '../types';

interface Props {
  consecutiveSeconds: number;
  thresholdSeconds: number;
  isWarning: boolean;
  settings: AppSettings;
  activeAppId: MonitoredAppId;
  onChangeApp: (appId: MonitoredAppId) => void;
  onOpenSettings: () => void;
  onOpenStats: () => void;
  onTriggerLock: () => void;
  onAddMinutes: (minutes: number) => void;
  onBackToHome: () => void;
  onOpenStudyMode: () => void;
}

const TIKTOK_VIDEOS = [
  {
    id: 'tt1',
    creator: '@kai_kinetic',
    caption: 'POV: You sat down to check one notification 45 minutes ago 💀 #doomscroll #relatable #focus',
    sound: 'Original Sound - LoFi Chill Vibes',
    likes: '842.1K',
    comments: '4,219',
    shares: '89.4K',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
  },
  {
    id: 'tt2',
    creator: '@nature.escape',
    caption: 'This secret waterfall in Oregon cured my anxiety today. Stop scrolling and touch grass.',
    sound: 'Nature Sounds - Alpine Spring',
    likes: '1.2M',
    comments: '9,812',
    shares: '124K',
    image: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&w=800&q=80',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80',
  },
  {
    id: 'tt3',
    creator: '@urban_design_core',
    caption: 'Mini apartment transformation in Tokyo. Would you live in this 180 sq ft studio?',
    sound: 'City Pop Tokyo 1986',
    likes: '450.9K',
    comments: '3,104',
    shares: '51.2K',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
  },
];

const INSTA_STORIES = [
  { name: 'Your Story', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80', hasUnseen: false },
  { name: 'elena_v', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80', hasUnseen: true },
  { name: 'marcus_c', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80', hasUnseen: true },
  { name: 'claire_art', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80', hasUnseen: true },
  { name: 'nature_daily', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80', hasUnseen: true },
];

const INSTA_POSTS = [
  {
    id: 'ig1',
    author: 'elena_vance',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80',
    caption: 'Golden hour reflections. Sometimes stepping away from screens brings everything into focus.',
    likes: '14,291',
    comments: '182',
    time: '2h ago',
  },
  {
    id: 'ig2',
    author: 'studio_kanso',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
    image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=900&q=80',
    caption: 'Mossy redwood trail mist. Nature is the antidote to digital burnout.',
    likes: '28,104',
    comments: '419',
    time: '4h ago',
  },
];

const SNAP_STORIES = [
  {
    id: 'sp1',
    creator: 'Liam Miller',
    handle: 'liam_m22',
    badge: '🔥 142 Day Streak',
    time: '5m ago',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
    caption: 'Sunset jam session with the band 🎸',
  },
  {
    id: 'sp2',
    creator: 'Chloe Zhang',
    handle: 'chloe.in.paris',
    badge: 'Spotlight',
    time: '12m ago',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
    caption: 'Morning coffee by the Seine ☕️',
  },
];

export const PermissiveAppSimulator: React.FC<Props> = ({
  consecutiveSeconds,
  thresholdSeconds,
  isWarning,
  settings,
  activeAppId,
  onChangeApp,
  onOpenSettings,
  onOpenStats,
  onTriggerLock,
  onAddMinutes,
  onBackToHome,
  onOpenStudyMode,
}) => {
  const [likesState, setLikesState] = useState<{ [key: string]: boolean }>({});
  const [autoScroll, setAutoScroll] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll simulation
  useEffect(() => {
    if (!autoScroll) return;
    const interval = setInterval(() => {
      if (containerRef.current) {
        containerRef.current.scrollTop += 2;
        if (
          containerRef.current.scrollTop + containerRef.current.clientHeight >=
          containerRef.current.scrollHeight - 20
        ) {
          containerRef.current.scrollTop = 0;
        }
      }
    }, 30);
    return () => clearInterval(interval);
  }, [autoScroll]);

  const toggleLike = (id: string) => {
    setLikesState((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const progressPercent = Math.min(100, (consecutiveSeconds / thresholdSeconds) * 100);

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const appDisplayName =
    activeAppId === 'tiktok'
      ? 'TikTok'
      : activeAppId === 'instagram'
      ? 'Instagram'
      : activeAppId === 'snapchat'
      ? 'Snapchat'
      : activeAppId === 'youtube'
      ? 'YouTube Shorts'
      : 'Reddit';

  return (
    <div className="flex flex-col h-screen max-w-xl mx-auto bg-stone-950 border-x border-stone-800 shadow-2xl relative select-none">
      {/* Top Sentinel Header: Groundwork Intercept Bar */}
      <header className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur-md border-b border-stone-800 px-3.5 py-2.5">
        <div className="flex items-center justify-between gap-2">
          {/* Back to Home Button */}
          <button
            onClick={onBackToHome}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Groundwork</span>
          </button>

          {/* Active Sentinel Indicator */}
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 font-mono text-xs">
                <span className={isWarning ? 'text-amber-400 font-bold' : 'text-stone-200'}>
                  {formatTime(consecutiveSeconds)}
                </span>
                <span className="text-stone-500">/</span>
                <span className="text-stone-400">{formatTime(thresholdSeconds)}</span>
              </div>
              <div className="w-20 h-1 bg-stone-800 rounded-full overflow-hidden mt-0.5">
                <div
                  className={`h-full transition-all duration-300 ${
                    progressPercent >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick study mode & settings triggers */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenStudyMode}
              title="Study Mode"
              className="p-1.5 rounded-lg bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-900 text-xs flex items-center gap-1"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="text-[11px] font-semibold hidden sm:inline">Study</span>
            </button>

            <button
              onClick={onOpenSettings}
              className="p-1.5 rounded-lg bg-stone-800 text-stone-300 hover:text-white"
            >
              <SettingsIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Warning notification when limit is near */}
        {isWarning && (
          <div className="mt-2 px-3 py-1.5 bg-amber-950/70 border border-amber-600/40 rounded-lg flex items-center justify-between text-amber-200 text-xs animate-pulse">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>
                {appDisplayName} lockout in {Math.max(1, thresholdSeconds - consecutiveSeconds)}s!
              </span>
            </div>
            <button
              onClick={onTriggerLock}
              className="text-xs font-bold underline hover:text-white ml-2"
            >
              Lock Now
            </button>
          </div>
        )}

        {/* Tester simulation shortcuts */}
        <div className="mt-2 pt-1.5 border-t border-stone-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-stone-400">
            <span className="text-[10px] font-mono">Test Speed:</span>
            <button
              onClick={() => onAddMinutes(1)}
              className="px-1.5 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 text-[10px]"
            >
              +1m
            </button>
            <button
              onClick={() => onAddMinutes(5)}
              className="px-1.5 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 text-[10px]"
            >
              +5m
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setAutoScroll(!autoScroll)}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors flex items-center gap-1 ${
                autoScroll ? 'bg-amber-600 text-white' : 'bg-stone-800 text-stone-300'
              }`}
            >
              {autoScroll ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              <span>Auto {autoScroll ? 'ON' : 'OFF'}</span>
            </button>

            <button
              onClick={onTriggerLock}
              className="px-2 py-0.5 rounded bg-rose-900/80 hover:bg-rose-800 text-rose-200 border border-rose-700/50 text-[11px] font-medium"
            >
              Trigger Quest Lock
            </button>
          </div>
        </div>
      </header>

      {/* App Switcher Tabs: TikTok vs Instagram vs Snapchat */}
      <div className="bg-stone-900/70 border-b border-stone-800 px-3 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onChangeApp('tiktok')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              activeAppId === 'tiktok'
                ? 'bg-black text-rose-400 border border-rose-500/40 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            TikTok
          </button>
          <button
            onClick={() => onChangeApp('instagram')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              activeAppId === 'instagram'
                ? 'bg-gradient-to-r from-purple-900/80 to-pink-900/80 text-pink-300 border border-pink-500/40 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Instagram
          </button>
          <button
            onClick={() => onChangeApp('snapchat')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              activeAppId === 'snapchat'
                ? 'bg-yellow-950/80 text-yellow-300 border border-yellow-500/40 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Snapchat
          </button>
        </div>

        <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Active Intercept</span>
        </div>
      </div>

      {/* Main Feed Simulator Body */}
      <div ref={containerRef} className="flex-1 overflow-y-auto">
        {/* ===================== TIKTOK EXPERIENCE ===================== */}
        {activeAppId === 'tiktok' && (
          <div className="space-y-4 pb-12">
            {TIKTOK_VIDEOS.map((vid) => (
              <div
                key={vid.id}
                className="relative h-[82vh] bg-stone-950 flex flex-col justify-between overflow-hidden border-b-2 border-stone-800"
              >
                {/* Background media */}
                <img
                  src={vid.image}
                  alt={vid.caption}
                  className="absolute inset-0 w-full h-full object-cover brightness-90"
                />

                {/* Subtle gradient vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40 pointer-events-none" />

                {/* Top sound banner */}
                <div className="relative z-10 p-4 flex items-center justify-between text-xs text-white/90">
                  <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-md">
                    <Music className="w-3.5 h-3.5 animate-spin" />
                    <span className="truncate max-w-[200px]">{vid.sound}</span>
                  </div>
                </div>

                {/* Right Action Rail */}
                <div className="absolute right-3 bottom-24 z-20 flex flex-col items-center gap-4 text-white">
                  {/* Creator Avatar with follow plus */}
                  <div className="relative">
                    <img
                      src={vid.avatar}
                      alt={vid.creator}
                      className="w-11 h-11 rounded-full border-2 border-white object-cover"
                    />
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-bold">
                      +
                    </div>
                  </div>

                  {/* Like Button */}
                  <button
                    onClick={() => toggleLike(vid.id)}
                    className="flex flex-col items-center gap-1 group"
                  >
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${
                        likesState[vid.id]
                          ? 'bg-rose-500/20 text-rose-500'
                          : 'bg-black/40 text-white group-hover:scale-110'
                      }`}
                    >
                      <Heart
                        className={`w-6 h-6 ${likesState[vid.id] ? 'fill-rose-500 text-rose-500' : ''}`}
                      />
                    </div>
                    <span className="text-[11px] font-bold drop-shadow">{vid.likes}</span>
                  </button>

                  {/* Comment Button */}
                  <button className="flex flex-col items-center gap-1">
                    <div className="w-11 h-11 rounded-full bg-black/40 flex items-center justify-center text-white backdrop-blur-md">
                      <MessageCircle className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold drop-shadow">{vid.comments}</span>
                  </button>

                  {/* Share Button */}
                  <button className="flex flex-col items-center gap-1">
                    <div className="w-11 h-11 rounded-full bg-black/40 flex items-center justify-center text-white backdrop-blur-md">
                      <Share2 className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold drop-shadow">{vid.shares}</span>
                  </button>
                </div>

                {/* Bottom Caption */}
                <div className="relative z-10 p-4 space-y-2 max-w-[80%] text-white">
                  <div className="font-bold text-sm drop-shadow">{vid.creator}</div>
                  <p className="text-xs text-white/90 leading-relaxed drop-shadow">
                    {vid.caption}
                  </p>
                  <div className="text-[11px] font-mono text-emerald-400 bg-black/50 px-2 py-0.5 rounded backdrop-blur-sm inline-block">
                    ⏱ Screen Time Sentinel Monitoring
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ===================== INSTAGRAM EXPERIENCE ===================== */}
        {activeAppId === 'instagram' && (
          <div className="space-y-4 pb-12">
            {/* Stories Tray */}
            <div className="p-3 bg-stone-900/60 border-b border-stone-800 flex items-center gap-3 overflow-x-auto no-scrollbar">
              {INSTA_STORIES.map((st, i) => (
                <div key={i} className="flex flex-col items-center gap-1 shrink-0 cursor-pointer">
                  <div
                    className={`w-14 h-14 rounded-full p-0.5 ${
                      st.hasUnseen
                        ? 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600'
                        : 'border border-stone-700'
                    }`}
                  >
                    <img
                      src={st.avatar}
                      alt={st.name}
                      className="w-full h-full rounded-full object-cover border-2 border-stone-950"
                    />
                  </div>
                  <span className="text-[10px] text-stone-300 truncate max-w-[60px]">
                    {st.name}
                  </span>
                </div>
              ))}
            </div>

            {/* Posts Stream */}
            <div className="space-y-6 px-3">
              {INSTA_POSTS.map((post) => (
                <div
                  key={post.id}
                  className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden"
                >
                  {/* Post header */}
                  <div className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={post.avatar}
                        alt={post.author}
                        className="w-8 h-8 rounded-full object-cover border border-stone-700"
                      />
                      <span className="text-xs font-bold text-stone-200">{post.author}</span>
                    </div>
                    <MoreVertical className="w-4 h-4 text-stone-400" />
                  </div>

                  {/* Post Image */}
                  <div className="aspect-square bg-stone-950">
                    <img
                      src={post.image}
                      alt={post.caption}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Post Actions */}
                  <div className="p-3.5 space-y-2">
                    <div className="flex items-center justify-between text-stone-300">
                      <div className="flex items-center gap-4">
                        <button onClick={() => toggleLike(post.id)}>
                          <Heart
                            className={`w-5 h-5 ${
                              likesState[post.id] ? 'fill-rose-500 text-rose-500' : ''
                            }`}
                          />
                        </button>
                        <MessageCircle className="w-5 h-5" />
                        <Send className="w-5 h-5" />
                      </div>
                      <Bookmark className="w-5 h-5" />
                    </div>

                    <div className="text-xs font-bold text-stone-200">{post.likes} likes</div>
                    <p className="text-xs text-stone-300 leading-relaxed">
                      <span className="font-bold mr-1.5">{post.author}</span>
                      {post.caption}
                    </p>
                    <div className="text-[10px] text-stone-500">{post.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================== SNAPCHAT EXPERIENCE ===================== */}
        {activeAppId === 'snapchat' && (
          <div className="space-y-4 p-4 pb-12">
            <div className="p-3 bg-yellow-950/40 border border-yellow-500/30 rounded-2xl flex items-center justify-between text-xs text-yellow-200">
              <span>Snapchat Spotlight & Stories</span>
              <span className="font-mono text-[10px] bg-yellow-950 px-2 py-0.5 rounded border border-yellow-500/40">
                Streak Shielded
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SNAP_STORIES.map((snap) => (
                <div
                  key={snap.id}
                  className="relative aspect-9/16 rounded-2xl overflow-hidden bg-stone-900 border border-stone-800 shadow-xl"
                >
                  <img
                    src={snap.image}
                    alt={snap.caption}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 p-4 flex flex-col justify-between text-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-yellow-400 text-stone-950 font-bold flex items-center justify-center text-xs">
                          {snap.creator.charAt(0)}
                        </div>
                        <div>
                          <div className="text-xs font-bold">{snap.creator}</div>
                          <div className="text-[10px] text-white/70">{snap.time}</div>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/60 font-mono">
                        {snap.badge}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-medium leading-relaxed drop-shadow">
                        {snap.caption}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
