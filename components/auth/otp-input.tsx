"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
  hasError?: boolean;
}

export function OtpInput({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled = false,
  autoFocus = true,
  className = "",
  hasError = false,
}: OtpInputProps) {
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  // Split value into array of characters padded to length
  const digits = React.useMemo(() => {
    const chars = value.replace(/\D/g, "").slice(0, length).split("");
    while (chars.length < length) {
      chars.push("");
    }
    return chars;
  }, [value, length]);

  // Initial auto-focus
  React.useEffect(() => {
    if (autoFocus && inputRefs.current[0] && !disabled) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus, disabled]);

  // WebOTP API (Android Chrome & modern browsers)
  React.useEffect(() => {
    if (typeof window === "undefined" || !("OTPCredential" in window)) {
      return;
    }

    const abortController = new AbortController();

    // Call navigator.credentials.get to listen for incoming SMS OTP
    try {
      const creds = navigator.credentials as unknown as {
        get?: (options: {
          otp?: { transport: string[] };
          signal?: AbortSignal;
        }) => Promise<{ code?: string } | null>;
      };

      creds?.get?.({
        otp: { transport: ["sms"] },
        signal: abortController.signal,
      })
        ?.then((content) => {
          const code = content?.code;
          if (code) {
            const sanitized = code.replace(/\D/g, "").slice(0, length);
            onChange(sanitized);
            if (sanitized.length === length && onComplete) {
              onComplete(sanitized);
            }
          }
        })
        .catch(() => {
          // Aborted or not granted - silent fallback
        });
    } catch {
      // Fallback
    }

    return () => {
      abortController.abort();
    };
  }, [length, onChange, onComplete]);

  const focusInput = (index: number) => {
    const target = inputRefs.current[index];
    if (target) {
      target.focus();
      target.select();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const rawVal = e.target.value;
    const cleanDigit = rawVal.replace(/\D/g, "");

    if (!cleanDigit) {
      // Clear current digit
      const newDigits = [...digits];
      newDigits[index] = "";
      const updated = newDigits.join("");
      onChange(updated);
      return;
    }

    // Single digit input
    const char = cleanDigit.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = char;
    const updated = newDigits.join("");
    onChange(updated);

    // Auto advance
    if (index < length - 1) {
      focusInput(index + 1);
    }

    if (updated.length === length && onComplete) {
      onComplete(updated);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        // Move to previous and clear it
        e.preventDefault();
        const newDigits = [...digits];
        newDigits[index - 1] = "";
        onChange(newDigits.join(""));
        focusInput(index - 1);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      focusInput(index - 1);
    } else if (e.key === "ArrowRight" && index < length - 1) {
      e.preventDefault();
      focusInput(index + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text");
    const cleanNumbers = pasted.replace(/\D/g, "").slice(0, length);
    if (!cleanNumbers) return;

    onChange(cleanNumbers);
    const nextIndex = Math.min(cleanNumbers.length, length - 1);
    focusInput(nextIndex);

    if (cleanNumbers.length === length && onComplete) {
      onComplete(cleanNumbers);
    }
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-1.5 sm:gap-2.5 w-full max-w-sm mx-auto",
        className
      )}
      role="group"
      aria-label="One-Time Verification Code"
    >
      {Array.from({ length }).map((_, index) => {
        const val = digits[index] || "";
        const isFilled = Boolean(val);

        return (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            autoComplete="one-time-code"
            disabled={disabled}
            value={val}
            onChange={(e) => handleInputChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
            aria-label={`Digit ${index + 1} of ${length}`}
            className={cn(
              "w-11 h-13 sm:w-12 sm:h-14 text-center font-mono text-xl sm:text-2xl font-bold rounded-xl border transition-all duration-150 select-none touch-manipulation",
              "focus:outline-none focus:ring-2 focus:scale-105",
              hasError
                ? "border-rose-500 bg-rose-50/50 dark:bg-rose-950/20 text-rose-600 focus:ring-rose-500/30"
                : isFilled
                ? "border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20 text-indigo-900 dark:text-indigo-100 focus:ring-indigo-500/30"
                : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-indigo-500 focus:ring-indigo-500/20",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          />
        );
      })}
    </div>
  );
}
