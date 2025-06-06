"use client";

import { useCallback, useState } from "react";
import type { BubbleAnswer } from "../components/answerChips/AnswerBubbles";
import type { AnswerChip } from "../components/answerChips/AnswerChips";

export const useAnswerBubbles = () => {
  const [bubbles, setBubbles] = useState<BubbleAnswer[]>([]);
  const [recentAnswers, setRecentAnswers] = useState<AnswerChip[]>([]);

  const addAnswerBubble = useCallback((text: string) => {
    const newBubble: BubbleAnswer = {
      id: `bubble-${Date.now()}-${Math.random()}`,
      text,
    };

    const newChip: AnswerChip = {
      id: `chip-${Date.now()}-${Math.random()}`,
      text,
    };

    setBubbles((prev) => [...prev, newBubble]);

    setRecentAnswers((prev) => {
      const updated = [newChip, ...prev];
      return updated.slice(0, 10); // Keep only last 10 answers
    });
  }, []);

  const removeBubble = useCallback((id: string) => {
    setBubbles((prev) => prev.filter((bubble) => bubble.id !== id));
  }, []);

  const clearBubbles = useCallback(() => {
    setBubbles([]);
  }, []);

  const clearRecentAnswers = useCallback(() => {
    setRecentAnswers([]);
  }, []);

  return {
    bubbles,
    recentAnswers,
    addAnswerBubble,
    removeBubble,
    clearBubbles,
    clearRecentAnswers,
  };
};
