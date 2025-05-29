"use client";

import { useCallback, useMemo, useState } from "react";
import type { AnimationState } from "../types";
import { getRandomSuccessSound, playSound } from "../utils";

const initialAnimationState: AnimationState = {
  slotId: null,
  showGlitter: false,
  nameFlash: false,
  shake: false,
  colorFlash: false,
  zoomEffect: false,
  rotateEffect: false,
  particlePosition: null,
  isBonus: false,
  playerColor: undefined,
};

export const useAnimations = () => {
  const [animationState, setAnimationState] = useState<AnimationState>(
    initialAnimationState
  );

  // Memoize animation reset timeout to prevent recreation
  const resetAnimations = useMemo(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    return () => {
      if (timeoutId) clearTimeout(timeoutId);

      timeoutId = setTimeout(() => {
        setAnimationState(initialAnimationState);
        timeoutId = null;
      }, 2000);
    };
  }, []);

  // Trigger animations for a correct answer
  const triggerCorrectAnimations = useCallback(
    (slotId: number, isBonus: boolean, playerColor?: string) => {
      // Calculate particle position
      let particlePosition = null;
      particlePosition = {
        x: 100 / 2,
        y: 100 / 2,
      };

      // Set new animation state
      setAnimationState({
        animatingTile: slotId.toString(),
        isBonus,
        playerColor,
        particlePosition,
      });

      // Play appropriate sound
      try {
        if (isBonus) {
          playSound("bonus");
        } else {
          playSound(getRandomSuccessSound());
        }
      } catch (error) {
        console.warn("Failed to play sound:", error);
      }

      // Reset animations after completion
      resetAnimations();
    },
    [resetAnimations]
  );

  return {
    animationState,
    triggerCorrectAnimations,
  };
};
