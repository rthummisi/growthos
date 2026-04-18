"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { TOUR_STEPS } from "./tourSteps";

interface ProductTourProps {
  activeStep: string | null;
  onStart: () => void;
  onEnd: () => void;
}

function speak(text: string, onEnd: () => void) {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    setTimeout(onEnd, 3000);
    return;
  }
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.rate = 0.92;
  utt.pitch = 1.0;
  utt.volume = 1;

  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(
    (v) => v.name.includes("Samantha") || v.name.includes("Google US English") || v.name.includes("Alex")
  );
  if (preferred) utt.voice = preferred;

  utt.onend = onEnd;
  utt.onerror = onEnd;
  window.speechSynthesis.speak(utt);
}

export function ProductTour({ activeStep, onStart, onEnd }: ProductTourProps) {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const advanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentStep = TOUR_STEPS[stepIndex];

  const advance = useCallback(() => {
    setStepIndex((i) => {
      const next = i + 1;
      if (next >= TOUR_STEPS.length) {
        return i;
      }
      return next;
    });
  }, []);

  const endTour = useCallback(() => {
    window.speechSynthesis?.cancel();
    if (advanceRef.current) clearTimeout(advanceRef.current);
    setIsActive(false);
    setStepIndex(0);
    onEnd();
  }, [onEnd]);

  // Navigate + narrate on step change
  useEffect(() => {
    if (!isActive || !currentStep) return;
    router.push(currentStep.page);

    if (advanceRef.current) clearTimeout(advanceRef.current);

    const fallback = setTimeout(() => {
      if (stepIndex < TOUR_STEPS.length - 1) advance();
      else endTour();
    }, 12000);
    advanceRef.current = fallback;

    speak(currentStep.narration, () => {
      clearTimeout(fallback);
      advanceRef.current = setTimeout(() => {
        if (stepIndex < TOUR_STEPS.length - 1) advance();
        else endTour();
      }, 1200);
    });

    return () => {
      if (advanceRef.current) clearTimeout(advanceRef.current);
    };
  }, [isActive, stepIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const startTour = () => {
    setStepIndex(0);
    setIsActive(true);
    setIsPaused(false);
    onStart();
  };

  const prev = () => {
    window.speechSynthesis?.cancel();
    if (advanceRef.current) clearTimeout(advanceRef.current);
    setStepIndex((i) => Math.max(0, i - 1));
  };

  const next = () => {
    window.speechSynthesis?.cancel();
    if (advanceRef.current) clearTimeout(advanceRef.current);
    if (stepIndex < TOUR_STEPS.length - 1) advance();
    else endTour();
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
            <div className="text-xs text-violet-400/70">2-min walkthrough with narration</div>
          </div>
        </div>
      </button>
    );
  }

  const progress = ((stepIndex + 1) / TOUR_STEPS.length) * 100;

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

          {/* Narration indicator */}
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-zinc-800/60 px-3 py-2">
            <div className={`flex gap-0.5 ${isPaused ? "" : "animate-pulse"}`}>
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-0.5 rounded-full bg-violet-400"
                  style={{ height: `${8 + i * 3}px` }}
                />
              ))}
            </div>
            <span className="text-xs text-zinc-500">{isPaused ? "Paused" : "Narrating..."}</span>
            <button
              onClick={togglePause}
              className="ml-auto text-xs text-zinc-500 hover:text-zinc-300"
            >
              {isPaused ? "▶ Resume" : "⏸ Pause"}
            </button>
          </div>

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
              {stepIndex === TOUR_STEPS.length - 1 ? "Finish →" : "Next →"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
