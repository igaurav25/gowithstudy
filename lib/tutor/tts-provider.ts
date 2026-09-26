/**
 * Modular Text-to-Speech Provider Interface & Implementations
 */

export interface TTSOptions {
  language?: string; // "en" | "hi" | "es"
  rate?: number; // 0.8 to 1.5
  pitch?: number; // 0.8 to 1.2
  onStart?: () => void;
  onEnd?: () => void;
  onBoundary?: (charIndex: number) => void;
  onError?: (err: unknown) => void;
}

export interface TTSProvider {
  name: string;
  speak(text: string, options?: TTSOptions): void;
  pause(): void;
  resume(): void;
  stop(): void;
  isSpeaking(): boolean;
  isPaused(): boolean;
}

/**
 * Standard Web Speech API Provider (Runs natively in browser without API keys)
 */
export class BrowserWebSpeechTTSProvider implements TTSProvider {
  name = "Web Speech API (Native)";
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      this.synth = window.speechSynthesis;
    }
  }

  speak(text: string, options: TTSOptions = {}): void {
    if (!this.synth) return;

    this.stop();

    // Clean markdown symbols for cleaner pronunciation
    const cleanText = text
      .replace(/#|\*|_|`|>|\[\d+\]|\$\$.*?\$\$|\$.*?\$/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    this.currentUtterance = utterance;

    utterance.rate = options.rate || 1.0;
    utterance.pitch = options.pitch || 1.0;

    // Pick best matching voice
    const voices = this.synth.getVoices();
    const lang = options.language?.toLowerCase() || "en";

    if (lang === "hi" || lang === "hinglish") {
      const hindiVoice = voices.find((v) => v.lang.includes("hi") || v.lang.includes("IN"));
      if (hindiVoice) utterance.voice = hindiVoice;
    } else if (lang === "es") {
      const spanishVoice = voices.find((v) => v.lang.includes("es"));
      if (spanishVoice) utterance.voice = spanishVoice;
    } else {
      const englishVoice = voices.find(
        (v) => (v.lang.includes("en-US") || v.lang.includes("en-GB") || v.lang.includes("en-IN")) && v.name.includes("Natural")
      ) || voices.find((v) => v.lang.startsWith("en"));
      if (englishVoice) utterance.voice = englishVoice;
    }

    utterance.onstart = () => {
      options.onStart?.();
    };

    utterance.onend = () => {
      options.onEnd?.();
      this.currentUtterance = null;
    };

    utterance.onboundary = (e) => {
      options.onBoundary?.(e.charIndex);
    };

    utterance.onerror = (e) => {
      options.onError?.(e);
      this.currentUtterance = null;
    };

    this.synth.speak(utterance);
  }

  pause(): void {
    if (this.synth && this.synth.speaking) {
      this.synth.pause();
    }
  }

  resume(): void {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
    }
  }

  stop(): void {
    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }

  isSpeaking(): boolean {
    return this.synth ? this.synth.speaking && !this.synth.paused : false;
  }

  isPaused(): boolean {
    return this.synth ? this.synth.paused : false;
  }
}
