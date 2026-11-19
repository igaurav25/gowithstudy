"use client";

import * as React from "react";
import { logPomodoroSessionAction } from "@/features/exam-timer/actions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Play,
  Pause,
  RotateCcw,
  Timer,
  Volume2,
  VolumeX,
  Flame,
} from "lucide-react";

type PomodoroMode = "FOCUS" | "SHORT_BREAK" | "LONG_BREAK";

const MODE_DURATIONS: Record<PomodoroMode, number> = {
  FOCUS: 25 * 60,
  SHORT_BREAK: 5 * 60,
  LONG_BREAK: 15 * 60,
};

export function PomodoroFocusWidget() {
  const [mode, setMode] = React.useState<PomodoroMode>("FOCUS");
  const [timeLeft, setTimeLeft] = React.useState<number>(MODE_DURATIONS.FOCUS);
  const [isRunning, setIsRunning] = React.useState(false);
  const [completedSessions, setCompletedSessions] = React.useState(0);
  const [isAmbientOn, setIsAmbientOn] = React.useState(false);

  // Audio Context Ref for Zero-bundle Ambient Noise Synthesizer
  const audioContextRef = React.useRef<AudioContext | null>(null);
  const noiseNodeRef = React.useRef<AudioNode | null>(null);

  // Switch modes
  const handleSwitchMode = (newMode: PomodoroMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(MODE_DURATIONS[newMode]);
  };

  // Toggle Timer
  const handleToggleTimer = () => {
    setIsRunning((prev) => !prev);
  };

  // Reset Timer
  const handleResetTimer = () => {
    setIsRunning(false);
    setTimeLeft(MODE_DURATIONS[mode]);
  };

  // Countdown timer loop
  React.useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isRunning) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Timer finished
            setIsRunning(false);
            if (mode === "FOCUS") {
              setCompletedSessions((c) => c + 1);
              // Log session to server
              logPomodoroSessionAction("General Focus Study", 25).catch(
                console.error
              );
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, mode]);

  // Ambient sound synthesizer: gentle pink noise for hostel study focus
  const toggleAmbientSound = () => {
    if (isAmbientOn) {
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(console.error);
        audioContextRef.current = null;
      }
      setIsAmbientOn(false);
    } else {
      try {
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        const ctx = new AudioContextClass();
        audioContextRef.current = ctx;

        // Generate gentle white/pink noise buffer
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          data[i] = (lastOut + 0.02 * white) / 1.02; // Pink filter
          lastOut = data[i];
          data[i] *= 0.12; // Low gentle volume
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.08, ctx.currentTime);

        noise.connect(gainNode);
        gainNode.connect(ctx.destination);
        noise.start(0);

        noiseNodeRef.current = noise;
        setIsAmbientOn(true);
      } catch (err) {
        console.error("Ambient audio not supported:", err);
      }
    }
  };

  // Format MM:SS
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(
    seconds
  ).padStart(2, "0")}`;

  const progressPercent =
    ((MODE_DURATIONS[mode] - timeLeft) / MODE_DURATIONS[mode]) * 100;

  return (
    <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-sm overflow-hidden">
      <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Timer className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                Hostel Pomodoro & Focus Timer
              </CardTitle>
              <p className="text-[11px] text-zinc-500">
                Deep work cycles with ambient focus noise
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleAmbientSound}
            className={cn(
              "p-2 rounded-xl text-xs flex items-center gap-1.5 transition-all border touch-manipulation min-h-[36px]",
              isAmbientOn
                ? "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/40 dark:border-indigo-900/60 dark:text-indigo-300"
                : "border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-700"
            )}
            title="Toggle hostel ambient white noise (masks background hostel noise)"
          >
            {isAmbientOn ? (
              <Volume2 className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
            ) : (
              <VolumeX className="w-3.5 h-3.5" />
            )}
            <span className="text-[10px] font-semibold hidden sm:inline">
              {isAmbientOn ? "Noise: ON" : "Ambient Noise"}
            </span>
          </button>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-4">
        {/* Mode Selector Tabs */}
        <div className="flex items-center justify-center p-1 bg-zinc-100 dark:bg-zinc-800/70 rounded-2xl max-w-xs mx-auto">
          {(["FOCUS", "SHORT_BREAK", "LONG_BREAK"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => handleSwitchMode(m)}
              className={cn(
                "flex-1 py-1.5 text-[11px] font-bold rounded-xl transition-all touch-manipulation min-h-[32px]",
                mode === m
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              )}
            >
              {m === "FOCUS" ? "Focus 25m" : m === "SHORT_BREAK" ? "Break 5m" : "Long 15m"}
            </button>
          ))}
        </div>

        {/* Time Display with Circular / Ring Feel */}
        <div className="text-center py-2 space-y-2">
          <div className="font-mono text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            {formattedTime}
          </div>
          <p className="text-xs text-zinc-500 font-medium">
            {mode === "FOCUS"
              ? isRunning
                ? "🚀 Focused work session in progress..."
                : "Press Start to begin 25m focus"
              : "☕ Relax and recharge your brain"}
          </p>

          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden max-w-xs mx-auto">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                mode === "FOCUS" ? "bg-amber-500" : "bg-emerald-500"
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Timer Controls */}
        <div className="flex items-center justify-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleResetTimer}
            className="w-10 h-10 rounded-2xl border-zinc-200 dark:border-zinc-800 text-zinc-500 touch-manipulation"
            title="Reset timer"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>

          <Button
            type="button"
            variant={isRunning ? "outline" : "gradient"}
            onClick={handleToggleTimer}
            className="px-6 min-h-[44px] rounded-2xl text-xs sm:text-sm font-bold gap-2 touch-manipulation shadow-md shadow-indigo-500/20"
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Start Focus</span>
              </>
            )}
          </Button>
        </div>

        {/* Session Streak Counter Footer */}
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>
              <strong>{completedSessions}</strong> Pomodoros completed
            </span>
          </div>
          <span className="font-mono text-[11px] text-zinc-400">
            {completedSessions * 25} mins focused
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
