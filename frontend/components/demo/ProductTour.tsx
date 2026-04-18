"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { TOUR_STEPS } from "./tourSteps";

interface ProductTourProps {
  activeStep: string | null;
  onStart: () => void;
  onEnd: () => void;
}

export function ProductTour({ activeStep, onStart, onEnd }: ProductTourProps) {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isDone, setIsDone] = useState(false);

  // Refs that don't cause re-renders
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const genRef = useRef(0);         // incremented on every step change / cancel — stale callbacks bail out
  const speechDoneRef = useRef(false);
  const dwellDoneRef = useRef(false);
  const dwellTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load voices asynchronously — Chrome returns empty array on first call
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const load = () => { voicesRef.current = window.speechSynthesis.getVoices(); };
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", load);
  }, []);

  // Advance only when both speech AND minimum dwell have completed for this generation
  const tryAdvance = useCallback((gen: number) => {
    if (gen !== genRef.current) return;
    if (!speechDoneRef.current || !dwellDoneRef.current) return;
    setStepIndex((i) => {
      if (i >= TOUR_STEPS.length - 1) {
        setIsDone(true);
        return i;
      }
      return i + 1;
    });
  }, []);

  // Navigate + narrate whenever stepIndex changes while active
  useEffect(() => {
    if (!isActive) return;
    const step = TOUR_STEPS[stepIndex];
    if (!step) return;

    const gen = ++genRef.current;
    speechDoneRef.current = false;
    dwellDoneRef.current = false;
    setIsDone(false);
    setIsSpeaking(false);

    router.push(step.page);

    // Minimum dwell timer — advance only after this AND speech are done
    if (dwellTimerRef.current) clearTimeout(dwellTimerRef.current);
    dwellTimerRef.current = setTimeout(() => {
      if (gen !== genRef.current) return;
      dwellDoneRef.current = true;
      tryAdvance(gen);
    }, step.dwellMs);

    // Small delay so navigation settles before speech starts
    const speakTimer = setTimeout(() => {
      if (gen !== genRef.current) return;
      if (typeof window === "undefined" || !window.speechSynthesis) {
        speechDoneRef.current = true;
        tryAdvance(gen);
        return;
      }
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(step.narration);
      utt.rate = 0.92;
      utt.pitch = 1.0;
      utt.volume = 1;

      // Prefer Samantha (macOS) → Google US English (Chrome) → any en-US → fallback
      const voices = voicesRef.current;
      const voice =
        voices.find((v) => v.name === "Samantha") ??
        voices.find((v) => v.name === "Google US English") ??
        voices.find((v) => v.lang.startsWith("en-US") && !v.name.includes("(")) ??
        (voices.length > 0 ? voices[0] : null);
      if (voice) utt.voice = voice;

      setIsSpeaking(true);

      utt.onend = () => {
        if (gen !== genRef.current) return;
        setIsSpeaking(false);
        speechDoneRef.current = true;
        tryAdvance(gen);
      };
      utt.onerror = (e) => {
        if (gen !== genRef.current) return;
        // "interrupted" means we cancelled intentionally — don't treat as done
        if ((e as SpeechSynthesisErrorEvent).error === "interrupted") return;
        setIsSpeaking(false);
        speechDoneRef.current = true;
        tryAdvance(gen);
      };

      window.speechSynthesis.speak(utt);
    }, 300);

    return () => {
      clearTimeout(speakTimer);
      if (dwellTimerRef.current) clearTimeout(dwellTimerRef.current);
    };
  }, [isActive, stepIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const endTour = useCallback(() => {
    genRef.current++;
    window.speechSynthesis?.cancel();
    if (dwellTimerRef.current) clearTimeout(dwellTimerRef.current);
    setIsActive(false);
    setStepIndex(0);
    setIsDone(false);
    setIsSpeaking(false);
    onEnd();
  }, [onEnd]);

  const startTour = () => {
    genRef.current++;
    setStepIndex(0);
    setIsActive(true);
    setIsPaused(false);
    setIsDone(false);
    onStart();
  };

  const prev = () => {
    genRef.current++;
    window.speechSynthesis?.cancel();
    if (dwellTimerRef.current) clearTimeout(dwellTimerRef.current);
    setStepIndex((i) => Math.max(0, i - 1));
  };

  const next = () => {
    genRef.current++;
    window.speechSynthesis?.cancel();
    if (dwellTimerRef.current) clearTimeout(dwellTimerRef.current);
    if (stepIndex >= TOUR_STEPS.length - 1) {
      endTour();
    } else {
      setStepIndex(stepIndex + 1);
    }
  };

  const togglePause = () => {
    if (isPaused) {
      window.speechSynthesis?.resume();
    } else {
      window.speechSynthesis?.pause();
    }
    setIsPaused((p) => !p);
  };

  if (!isActive) {
    return (
      <button
        onClick={startTour}
        className="mb-3 w-full rounded-lg border border-violet-500/40 bg-violet-500/10 px-3 py-2.5 text-left text-sm text-violet-300 transition-all hover:bg-violet-500/20 hover:border-violet-500/60"
      >
        <div className="flex items-center gap-2">
          <span className="text-base">▶</span>
          <div>
            <div className="font-medium">Take a Tour</div>
            <div className="text-xs text-violet-400/70">3-min walkthrough with narration</div>
          </div>
        </div>
      </button>
    );
  }

  const currentStep = TOUR_STEPS[stepIndex];
  const progress = ((stepIndex + 1) / TOUR_STEPS.length) * 100;
  const isLastStep = stepIndex === TOUR_STEPS.length - 1;

  return (
    <>
      {/* Backdrop */}
      <div className="pointer-events-none fixed inset-0 z-40 bg-black/60" />

      {/* Tour card */}
      <div className="fixed bottom-6 right-6 z-50 w-96 rounded-2xl border border-zinc-700 bg-zinc-900 shadow-2xl">
        {/* Progress bar */}
        <div className="h-1 w-full overflow-hidden rounded-t-2xl bg-zinc-800">
          <div
            className="h-full bg-violet-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="p-5">
          {/* Step counter */}
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs text-zinc-500">
              Step {stepIndex + 1} of {TOUR_STEPS.length}
            </span>
            <button onClick={endTour} className="text-xs text-zinc-600 hover:text-zinc-400">
              ✕ Skip tour
            </button>
          </div>

          {/* Title */}
          <h3 className="mb-2 text-base font-semibold text-white">{currentStep.title}</h3>

          {/* Description */}
          <p className="mb-4 text-sm leading-relaxed text-zinc-400">{currentStep.description}</p>

          {/* Narration indicator / done state */}
          {isDone ? (
            <div className="mb-4 rounded-lg border border-violet-500/30 bg-violet-500/10 px-4 py-3 text-center">
              <div className="text-sm font-medium text-violet-300">Tour complete</div>
              <div className="mt-0.5 text-xs text-violet-400/70">
                You&apos;re ready to distribute your product
              </div>
            </div>
          ) : (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-zinc-800/60 px-3 py-2">
              <div className={`flex gap-0.5 ${isSpeaking && !isPaused ? "animate-pulse" : ""}`}>
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-0.5 rounded-full bg-violet-400"
                    style={{ height: `${8 + i * 3}px` }}
                  />
                ))}
              </div>
              <span className="text-xs text-zinc-500">
                {isPaused ? "Paused" : isSpeaking ? "Narrating..." : "Loading..."}
              </span>
              <button
                onClick={togglePause}
                className="ml-auto text-xs text-zinc-500 hover:text-zinc-300"
              >
                {isPaused ? "▶ Resume" : "⏸ Pause"}
              </button>
            </div>
          )}

          {/* Dot indicators */}
          <div className="mb-4 flex justify-center gap-1.5">
            {TOUR_STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === stepIndex
                    ? "w-4 bg-violet-500"
                    : i < stepIndex
                    ? "w-1.5 bg-violet-800"
                    : "w-1.5 bg-zinc-700"
                }`}
              />
            ))}
          </div>

          {/* Controls */}
          {isDone ? (
            <button
              onClick={endTour}
              className="w-full rounded-lg bg-violet-600 px-3 py-2.5 text-sm font-medium text-white hover:bg-violet-500"
            >
              Start Using GrowthOS →
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={prev}
                disabled={stepIndex === 0}
                className="flex-1 rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-800 disabled:opacity-30"
              >
                ← Prev
              </button>
              <button
                onClick={next}
                className="flex-1 rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-500"
              >
                {isLastStep ? "Finish →" : "Next →"}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
