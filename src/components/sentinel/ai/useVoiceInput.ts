"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type {
  SentinelSpeechRecognition,
  SentinelSpeechRecognitionErrorEvent,
  SentinelSpeechRecognitionEvent,
  SentinelWindowWithSpeech,
} from "@/types/speech-recognition";
import { clampInput } from "./composer-utils";

export function useVoiceInput(value: string, onChange: (v: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const w = window as unknown as SentinelWindowWithSpeech;
    return Boolean(w.SpeechRecognition ?? w.webkitSpeechRecognition);
  });
  const recognitionRef = useRef<SentinelSpeechRecognition | null>(null);
  const transcriptBaseRef = useRef<string>("");

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop?.();
      recognitionRef.current = null;
    };
  }, []);

  const toggleVoice = () => {
    if (typeof window === "undefined") return;
    const w = window as unknown as SentinelWindowWithSpeech;
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) {
      setVoiceSupported(false);
      toast.error("Voice isn't supported in this browser.");
      return;
    }
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop?.();
      return;
    }
    try {
      const rec = new Ctor();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang =
        (typeof navigator !== "undefined" && navigator.language) || "en-US";
      transcriptBaseRef.current = value ? `${value.trim()} ` : "";
      rec.onresult = (event: SentinelSpeechRecognitionEvent) => {
        let finalText = "";
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          const r = event.results[i];
          const chunk = r[0]?.transcript ?? "";
          if (r.isFinal) finalText += chunk;
          else interim += chunk;
        }
        const next = clampInput(
          `${transcriptBaseRef.current}${finalText}${interim}`.trimStart()
        );
        onChange(next);
        if (finalText) transcriptBaseRef.current = next;
      };
      rec.onerror = (e: SentinelSpeechRecognitionErrorEvent) => {
        setIsListening(false);
        if (e.error && e.error !== "aborted" && e.error !== "no-speech") {
          toast.error(`Voice error: ${e.error}`);
        }
      };
      rec.onend = () => {
        setIsListening(false);
        recognitionRef.current = null;
      };
      recognitionRef.current = rec;
      rec.start();
      setIsListening(true);
    } catch (err) {
      console.error(err);
      toast.error("Couldn't start voice input.");
    }
  };

  return { isListening, voiceSupported, toggleVoice };
}
