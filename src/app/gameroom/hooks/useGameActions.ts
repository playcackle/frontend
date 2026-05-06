import { useSetAtom } from "jotai";
import { answerAtom } from "../store/gameAtoms";
import type { GameEvent } from "../types/payloads";

export const useGameActions = () => {
  const setAnswer = useSetAtom(answerAtom);

  const submitAnswer = (
    answer: string,
    sendEvent: (event: GameEvent, data: string) => void,
  ) => {
    if (!answer.trim()) return;
    sendEvent("submit_answer", answer);
    setAnswer("");
  };

  const sendPlayAgainResponse = (
    wantToPlay: boolean,
    sendEvent: (event: "play_again_response", data: { want_to_play: boolean }) => void,
  ) => {
    sendEvent("play_again_response", { want_to_play: wantToPlay });
  };

  return {
    submitAnswer,
    sendPlayAgainResponse,
  };
};
