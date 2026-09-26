"use client";

import * as React from "react";
import { BrowserWebSpeechTTSProvider, TTSProvider } from "@/lib/tutor/tts-provider";
import { Button } from "@/components/ui/button";
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  HelpCircle,
  CheckCircle2,
} from "lucide-react";

export type AvatarState = "IDLE" | "THINKING" | "SPEAKING" | "QUESTIONING" | "CELEBRATING";

interface TutorAvatarProps {
  spokenText: string;
  avatarState?: AvatarState;
  detectedLanguage?: string;
  onSpeechEnd?: () => void;
  autoPlay?: boolean;
}

export function TutorAvatar({
  spokenText,
  avatarState = "IDLE",
  detectedLanguage = "en",
  onSpeechEnd,
  autoPlay = false,
}: TutorAvatarProps) {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isPaused, setIsPaused] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(false);
  const [speechRate, setSpeechRate] = React.useState(1.0);
  const [mouthOpen, setMouthOpen] = React.useState(false);
  const [textOnlyMode, setTextOnlyMode] = React.useState(false);

  const ttsProviderRef = React.useRef<TTSProvider | null>(null);

  // Initialize TTS Provider
  React.useEffect(() => {
    ttsProviderRef.current = new BrowserWebSpeechTTSProvider();
    return () => {
      ttsProviderRef.current?.stop();
    };
  }, []);

  const handlePlay = React.useCallback(() => {
    if (textOnlyMode || isMuted || !spokenText) return;

    ttsProviderRef.current?.speak(spokenText, {
      language: detectedLanguage,
      rate: speechRate,
      onStart: () => {
        setIsPlaying(true);
        setIsPaused(false);
      },
      onEnd: () => {
        setIsPlaying(false);
        setIsPaused(false);
        onSpeechEnd?.();
      },
      onError: () => {
        setIsPlaying(false);
        setIsPaused(false);
      },
    });
  }, [textOnlyMode, isMuted, spokenText, detectedLanguage, speechRate, onSpeechEnd]);

  const handlePause = () => {
    if (isPlaying && !isPaused) {
      ttsProviderRef.current?.pause();
      setIsPaused(true);
    }
  };

  const handleResume = () => {
    if (isPlaying && isPaused) {
      ttsProviderRef.current?.resume();
      setIsPaused(false);
    } else {
      handlePlay();
    }
  };

  const handleStop = () => {
    ttsProviderRef.current?.stop();
    setIsPlaying(false);
    setIsPaused(false);
  };

  const handleToggleMute = () => {
    if (!isMuted) {
      handleStop();
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };

  // Sync mouth movement animation with speaking state
  React.useEffect(() => {
    if (!isPlaying || isPaused || isMuted) {
      return;
    }

    const timer = setInterval(() => {
      setMouthOpen((prev) => !prev);
    }, 180);

    return () => {
      clearInterval(timer);
      setMouthOpen(false);
    };
  }, [isPlaying, isPaused, isMuted]);

  // Handle spokenText change
  React.useEffect(() => {
    if (autoPlay && !textOnlyMode && !isMuted && spokenText) {
      handlePlay();
    }
  }, [spokenText, autoPlay, textOnlyMode, isMuted, handlePlay]);

  // Derive visual expression from current state
  const currentState: AvatarState = isPlaying ? "SPEAKING" : avatarState;

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-b from-indigo-50/60 to-white dark:from-zinc-900/80 dark:to-zinc-950 rounded-2xl border border-indigo-100 dark:border-zinc-800 shadow-sm relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div
        className={`absolute -top-12 w-48 h-48 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
          currentState === "SPEAKING"
            ? "bg-indigo-500/25 scale-125"
            : currentState === "CELEBRATING"
            ? "bg-emerald-500/25 scale-125"
            : currentState === "QUESTIONING"
            ? "bg-amber-500/25"
            : "bg-violet-500/15"
        }`}
      />

      {/* State Badge */}
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm border border-zinc-200/60 dark:border-zinc-700/60 shadow-xs mb-3 text-[11px] font-semibold text-zinc-600 dark:text-zinc-300">
        {currentState === "SPEAKING" && (
          <>
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span>Tutor is Speaking...</span>
          </>
        )}
        {currentState === "THINKING" && (
          <>
            <Sparkles className="w-3 h-3 text-violet-500 animate-spin" />
            <span>Researching Concept...</span>
          </>
        )}
        {currentState === "QUESTIONING" && (
          <>
            <HelpCircle className="w-3 h-3 text-amber-500" />
            <span>Check for Understanding</span>
          </>
        )}
        {currentState === "CELEBRATING" && (
          <>
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            <span>Concept Mastered!</span>
          </>
        )}
        {currentState === "IDLE" && (
          <>
            <span className="w-2 h-2 rounded-full bg-zinc-400" />
            <span>AI Tutor Ready</span>
          </>
        )}
      </div>

      {/* Animated SVG AI Teacher Character */}
      <div className="relative w-36 h-36 flex items-center justify-center my-1 select-none">
        <svg
          viewBox="0 0 160 160"
          className="w-full h-full drop-shadow-md transition-transform duration-300"
        >
          <defs>
            <linearGradient id="tutorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="50%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
            <linearGradient id="faceGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#f4f4f5" />
            </linearGradient>
          </defs>

          {/* Teacher Robot / Avatar Head */}
          <circle
            cx="80"
            cy="80"
            r="64"
            fill="url(#tutorGradient)"
            className="transition-all duration-500"
          />

          {/* Academic Graduation Cap / Accent */}
          <path
            d="M 80 20 L 125 35 L 80 50 L 35 35 Z"
            fill="#18181b"
            stroke="#6366f1"
            strokeWidth="1.5"
          />
          <path d="M 125 35 L 125 55" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
          <circle cx="125" cy="56" r="2.5" fill="#f59e0b" />

          {/* Inner Face Screen */}
          <rect
            x="36"
            y="48"
            width="88"
            height="70"
            rx="20"
            fill="#09090b"
            stroke="#312e81"
            strokeWidth="2"
          />

          {/* Eyes with Reactive Emotions */}
          {currentState === "CELEBRATING" ? (
            // Smiling crescent eyes
            <>
              <path d="M 52 75 Q 60 67 68 75" stroke="#34d399" strokeWidth="4" strokeLinecap="round" fill="none" />
              <path d="M 92 75 Q 100 67 108 75" stroke="#34d399" strokeWidth="4" strokeLinecap="round" fill="none" />
            </>
          ) : currentState === "QUESTIONING" ? (
            // Inquisitive eyes (one raised eyebrow)
            <>
              <circle cx="60" cy="74" r="5" fill="#38bdf8" />
              <circle cx="100" cy="70" r="5" fill="#38bdf8" />
              <path d="M 94 62 Q 100 58 106 62" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </>
          ) : (
            // Normal bright eyes with blinking/expression
            <>
              <circle cx="60" cy="74" r="5" fill="#818cf8" className="animate-pulse" />
              <circle cx="100" cy="74" r="5" fill="#818cf8" className="animate-pulse" />
            </>
          )}

          {/* Responsive Mouth Animation (Phoneme oscillation) */}
          {mouthOpen ? (
            <ellipse cx="80" cy="95" rx="10" ry="7" fill="#6366f1" />
          ) : currentState === "CELEBRATING" ? (
            <path d="M 72 92 Q 80 102 88 92" stroke="#34d399" strokeWidth="3" strokeLinecap="round" fill="none" />
          ) : (
            <line x1="73" y1="94" x2="87" y2="94" stroke="#818cf8" strokeWidth="2.5" strokeLinecap="round" />
          )}

          {/* Headphones on sides */}
          <rect x="18" y="65" width="10" height="30" rx="5" fill="#312e81" />
          <rect x="132" y="65" width="10" height="30" rx="5" fill="#312e81" />
        </svg>

        {/* Audio Frequency Equalizer Waves when speaking */}
        {isPlaying && !isPaused && (
          <div className="absolute -bottom-1 flex items-end gap-1 h-5 px-2 py-0.5 rounded-full bg-zinc-900/90 border border-indigo-500/40 shadow-xs">
            <span className="w-1 bg-indigo-400 rounded-full animate-[bounce_0.6s_infinite_100ms] h-3" />
            <span className="w-1 bg-indigo-300 rounded-full animate-[bounce_0.6s_infinite_300ms] h-4" />
            <span className="w-1 bg-indigo-500 rounded-full animate-[bounce_0.6s_infinite_200ms] h-5" />
            <span className="w-1 bg-indigo-400 rounded-full animate-[bounce_0.6s_infinite_400ms] h-2.5" />
          </div>
        )}
      </div>

      {/* Voice Controls Toolbar */}
      <div className="flex items-center gap-1.5 mt-2 bg-zinc-100/80 dark:bg-zinc-800/80 p-1.5 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60">
        {!isPlaying || isPaused ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={isPaused ? handleResume : handlePlay}
            disabled={textOnlyMode || isMuted || !spokenText}
            className="h-8 w-8 p-0 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-zinc-700"
            title={isPaused ? "Resume Lesson" : "Listen to Lesson"}
          >
            <Play className="w-4 h-4 fill-current ml-0.5" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePause}
            className="h-8 w-8 p-0 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-zinc-700"
            title="Pause Lesson"
          >
            <Pause className="w-4 h-4 fill-current" />
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={handlePlay}
          disabled={textOnlyMode || isMuted || !spokenText}
          className="h-8 w-8 p-0 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
          title="Replay Voice"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleMute}
          className={`h-8 w-8 p-0 ${
            isMuted
              ? "text-rose-500 bg-rose-50 dark:bg-rose-950/30"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
          }`}
          title={isMuted ? "Unmute Voice" : "Mute Voice"}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </Button>

        {/* Speed Selector */}
        <select
          value={speechRate}
          onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
          disabled={textOnlyMode || isMuted}
          className="text-[11px] font-semibold bg-transparent text-zinc-700 dark:text-zinc-300 border-none focus:outline-none cursor-pointer px-1 py-1"
          title="Voice Speed"
        >
          <option value="0.8">0.8x</option>
          <option value="1.0">1.0x</option>
          <option value="1.25">1.25x</option>
          <option value="1.5">1.5x</option>
        </select>
      </div>

      {/* Text-Only Mode Switch */}
      <div className="flex items-center gap-2 mt-2">
        <label className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400 cursor-pointer">
          <input
            type="checkbox"
            checked={textOnlyMode}
            onChange={(e) => {
              setTextOnlyMode(e.target.checked);
              if (e.target.checked) handleStop();
            }}
            className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
          />
          <span>Text-only reading mode (silent)</span>
        </label>
      </div>
    </div>
  );
}
