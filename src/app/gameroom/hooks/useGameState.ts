import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  animationStateAtom,
  answerAtom,
  gameStateAtom,
  resetGameStateAtom,
  updateAnimationStateAtom,
  updateGameStateAtom,
} from "../store/gameAtoms";

export const useGameState = () => {
  const gameState = useAtomValue(gameStateAtom);
  const updateGameState = useSetAtom(updateGameStateAtom);
  const resetGameState = useSetAtom(resetGameStateAtom);

  return {
    ...gameState,
    updateGameState,
    resetGameState,
  };
};

export const useAnswer = () => {
  const [answer, setAnswer] = useAtom(answerAtom);

  const clearAnswer = () => setAnswer("");

  return {
    answer,
    setAnswer,
    clearAnswer,
  };
};

export const useAnimationState = () => {
  const animationState = useAtomValue(animationStateAtom);
  const updateAnimationState = useSetAtom(updateAnimationStateAtom);

  const triggerAnimation = (type: string, value: any) => {
    updateAnimationState({ [type]: value });
  };

  const clearAnimation = (type: string) => {
    updateAnimationState({ [type]: false });
  };

  return {
    ...animationState,
    updateAnimationState,
    triggerAnimation,
    clearAnimation,
  };
};
