"use client";

import { useCallback, useState } from "react";
import type { BubbleAnswer } from "../components/answerChips/AnswerBubbles";

export const useAnswerBubbles = () => {
  const [bubbles, setBubbles] = useState<BubbleAnswer[]>([]);

  const addAnswerBubble = useCallback((text: string) => {
    const newBubble: BubbleAnswer = {
      id: `bubble-${Date.now()}-${Math.random()}`,
      text,
    };

    setBubbles((prev) => [...prev, newBubble]);
  }, []);

  const removeBubble = useCallback((id: string) => {
    setBubbles((prev) => prev.filter((bubble) => bubble.id !== id));
  }, []);

  const clearBubbles = useCallback(() => {
    setBubbles([]);
  }, []);

  return {
    bubbles,
    addAnswerBubble,
    removeBubble,
    clearBubbles,
  };
};
