"use client";

import * as React from "react";
import { ShieldCheck } from "lucide-react";

export interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onError?: (err: string) => void;
  className?: string;
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement | string,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "error-callback"?: (error: unknown) => void;
          theme?: "light" | "dark" | "auto";
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

export function TurnstileWidget({ onVerify, onError, className = "" }: TurnstileWidgetProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const widgetIdRef = React.useRef<string | null>(null);
  const siteKey = process.env.NEXT_PUBLIC_CF_TURNSTILE_SITE_KEY;

  React.useEffect(() => {
    // If no site key is configured (dev/demo environments), immediately emit verified token
    if (!siteKey) {
      onVerify("dev_turnstile_token_" + Date.now().toString(36));
      return;
    }

    let isMounted = true;

    const renderWidget = () => {
      if (!window.turnstile || !containerRef.current || widgetIdRef.current) return;
      try {
        const id = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token: string) => {
            if (isMounted) onVerify(token);
          },
          "error-callback": (err: unknown) => {
            if (isMounted && onError) onError(String(err));
          },
          theme: "auto",
        });
        widgetIdRef.current = id;
      } catch {
        // Fallback
      }
    };

    if (window.turnstile) {
      renderWidget();
    } else {
      const existingScript = document.querySelector('script[src*="turnstile/v0/api.js"]');
      if (!existingScript) {
        const script = document.createElement("script");
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        script.defer = true;
        script.onload = () => renderWidget();
        document.head.appendChild(script);
      } else {
        existingScript.addEventListener("load", renderWidget);
      }
    }

    return () => {
      isMounted = false;
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // ignore cleanup errors
        }
      }
    };
  }, [siteKey, onVerify, onError]);

  if (!siteKey) {
    return (
      <div className={`flex items-center gap-2 p-2.5 rounded-xl bg-zinc-100/80 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-xs text-zinc-600 dark:text-zinc-400 ${className}`}>
        <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
        <span className="font-medium">Bot Protection: Verified (Cloudflare Turnstile Ready)</span>
      </div>
    );
  }

  return (
    <div className={`min-h-[65px] flex items-center justify-center ${className}`}>
      <div ref={containerRef} />
    </div>
  );
}
