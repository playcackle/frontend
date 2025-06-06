import { useSetAtom } from "jotai";
import { useCallback, useMemo, useState } from "react";
import {
  answerAtom,
  resetGameStateAtom,
  updateAnimationStateAtom,
} from "../store/gameAtoms";
import { AnimationState } from "../types/state";
import { getRandomSuccessSound, playSound } from "../utils";

const initialAnimationState: AnimationState = {
  animatingSlotId: null,
  showGlitter: false,
  nameFlash: false,
  shake: false,
  colorFlash: false,
  zoomEffect: false,
  rotateEffect: false,
  particlePosition: null,
  isBonus: false,
  playerColor: "",
  entranceAnimation: "",
  attentionAnimation: "",
  confettiPosition: null,
  showConfetti: false,
};

export const useGameActions = () => {
  const setAnswer = useSetAtom(answerAtom);
  const updateAnimationState = useSetAtom(updateAnimationStateAtom);
  const resetGameState = useSetAtom(resetGameStateAtom);

  const [animationState, setAnimationState] = useState<AnimationState>(
    initialAnimationState
  );

  const applyDOMAnimation = useCallback(
    (slotId: string, animationType: string) => {
      const element = document.querySelector(
        `[data-slot-id="${slotId}"]`
      ) as HTMLElement;

      if (!element) {
        console.warn(`Element with slot ID ${slotId} not found`);
        return;
      }

      // Remove any existing animation classes
      element.classList.remove(
        "animate-shake",
        "animate-bounce",
        "animate-pulse",
        "animate-zoom",
        "animate-rotate",
        "animate-flash",
        "animate-glitter"
      );

      // Apply the new animation class
      element.classList.add(`animate-${animationType}`);

      // Remove animation class after completion
      setTimeout(() => {
        element.classList.remove(`animate-${animationType}`);
      }, 2000);
    },
    []
  );

  const resetAnimations = useMemo(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    return () => {
      if (timeoutId) clearTimeout(timeoutId);

      timeoutId = setTimeout(() => {
        setAnimationState(initialAnimationState);
        // Also clear Jotai animation state
        updateAnimationState({
          attentionAnimation: "",
          animatingTile: "",
          entranceAnimation: "",
        });
        timeoutId = null;
      }, 2000);
    };
  }, [updateAnimationState]);

  // Auto-clear animation state after timeout
  const setAnimationWithTimeout = useCallback(
    (animationUpdate: any, timeout = 400) => {
      updateAnimationState(animationUpdate);

      setTimeout(() => {
        if (animationUpdate.entranceAnimation !== undefined) {
          updateAnimationState({ entranceAnimation: "" });
        }
        if (animationUpdate.attentionAnimation !== undefined) {
          updateAnimationState({
            attentionAnimation: "",
            animatingSlotId: "",
          });
        }
      }, timeout);
    },
    [updateAnimationState]
  );

  const triggerCorrectAnswerEffects = useCallback(
    (
      slotId: string,
      animation: string,
      isBonus: boolean = false,
      playerColor: string | null
    ) => {
      // Calculate particle position based on DOM element
      let particlePosition = null;
      const element = document.querySelector(`[data-slot-id="${slotId}"]`);

      if (element) {
        const rect = element.getBoundingClientRect();
        particlePosition = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };
      } else {
        // Fallback position
        particlePosition = { x: 100 / 2, y: 100 / 2 };
      }

      // Update both animation states
      setAnimationWithTimeout({
        attentionAnimation: animation,
        animatingTile: slotId,
      });

      setAnimationState({
        slotId: parseInt(slotId),
        animatingTile: slotId,
        isBonus,
        playerColor,
        particlePosition,
        showGlitter: true,
        nameFlash: true,
        shake: false,
        colorFlash: true,
        zoomEffect: true,
        rotateEffect: false,
      });

      // Apply DOM animation
      applyDOMAnimation(slotId, animation);

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
    [setAnimationWithTimeout, applyDOMAnimation, resetAnimations]
  );

  // Trigger entrance animations
  const triggerEntranceAnimation = useCallback(
    (animation: string) => {
      setAnimationWithTimeout({ entranceAnimation: animation });
    },
    [setAnimationWithTimeout]
  );

  // Get current animation state
  const getCurrentAnimationState = useCallback(() => {
    return animationState;
  }, [animationState]);

  const submitAnswer = (
    answer: string,
    sendEvent: (event: string, data: any) => void
  ) => {
    if (!answer.trim()) return;
    sendEvent("submit_answer", answer);
    setAnswer("");
  };

  return {
    submitAnswer,
    resetGameState,
    triggerCorrectAnswerEffects,
    triggerEntranceAnimation,
    setAnimationWithTimeout,
    getCurrentAnimationState,
    animationState,
  };
};
