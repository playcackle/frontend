import { useSetAtom } from "jotai";
import {
  answerAtom,
  resetGameStateAtom,
  updateAnimationStateAtom,
  updateGameStateAtom,
} from "../store/gameAtoms";

export const useGameActions = () => {
  const updateGameState = useSetAtom(updateGameStateAtom);
  const updateAnimationState = useSetAtom(updateAnimationStateAtom);
  const setAnswer = useSetAtom(answerAtom);
  const resetGameState = useSetAtom(resetGameStateAtom);

  const startNewRound = (roundData: any) => {
    updateGameState({
      isIntermission: false,
      roundName: roundData.topic_name,
    });
  };

  const endRound = () => {
    updateGameState({
      isIntermission: true,
    });
  };

  const submitAnswer = (
    answer: string,
    sendEvent: (event: string, data: any) => void
  ) => {
    if (!answer.trim()) return;
    sendEvent("submit_answer", answer);
    setAnswer("");
  };

  const triggerCorrectAnswerEffects = (slotId: string, animation: string) => {
    updateAnimationState({
      attentionAnimation: animation,
      animatingTile: slotId,
    });
  };

  return {
    startNewRound,
    endRound,
    submitAnswer,
    triggerCorrectAnswerEffects,
    resetGameState,
  };
};
