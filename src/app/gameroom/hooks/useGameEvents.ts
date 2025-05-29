import { useEffect } from "react";
import {
  NewRoundStartingPayload,
  SlotSnappedPayload,
  SubmissionFeedbackPayload,
} from "../types";
import {
  getRandomAttentionAnimation,
  getRandomEntranceAnimation,
} from "../utils";
import { useGameSocket } from "./useGameSocket";
import { useAnimationState, useGameState } from "./useGameState";

export const useGameEvents = (gameWsUrl: string, token: string) => {
  const { onEvent, sendEvent, isConnected } = useGameSocket(gameWsUrl, token);
  const { updateGameState, slots } = useGameState();
  const { updateAnimationState } = useAnimationState();

  useEffect(() => {
    updateGameState({ loading: !isConnected });
  }, [isConnected]);

  useEffect(() => {
    // Lobby tick event
    onEvent("lobby_tick", (data) => {
      if (
        slots.filter((x) => x.taken).length !==
        data.slots.filter((x) => x.taken).length
      ) {
        updateGameState({ slots: data.slots });
      } else if (slots.length === 0 && data.slots.length > 0) {
        updateGameState({ slots: data.slots });
        console.log("Tick will animate and set slots");
        updateAnimationState({
          entranceAnimation: getRandomEntranceAnimation(),
        });
        setTimeout(() => {
          updateAnimationState({
            entranceAnimation: "",
          });
        }, 10);
      }

      updateGameState({
        playerCount: data.player_count,
        timeRemaining: data.time_remaining_seconds ?? 0,
        roundName: data.topic_name || "",
      });
    });

    // Round over events
    onEvent("round_over_timeout", (data) => {
      updateGameState({
        isIntermission: true,
        slots: [],
        playerScore: data.player_scores,
      });
    });

    onEvent("round_over_all_snapped", (data) => {
      updateGameState({
        isIntermission: true,
        playerScore: data.player_scores,
      });
    });

    // New round starting
    onEvent("new_round_starting", (data: NewRoundStartingPayload) => {
      debugger;
      console.log("[Game WS] new_round_starting event received:", data);
      updateAnimationState({ entranceAnimation: getRandomEntranceAnimation() });
      setTimeout(() => {
        debugger;
        updateAnimationState({
          entranceAnimation: "",
        });
      }, 10);
      updateGameState({
        isIntermission: false,
        roundName: data.topic_name,
        slots: data.answer_slots,
      });
    });

    // Game over
    onEvent("game_over", (data) => {
      updateGameState({
        finalScore: data.final_scores,
      });
    });

    onEvent("slot_snapped", (data: SlotSnappedPayload) => {
      // const slot = slots.find((x) => data.slot_id);
      // const otherSlots = slots.filter((x) => x.slot_id !== data.slot_id);
      // updateGameState({ slots: [...otherSlots!, slot!] });
    });

    // Submission feedback
    onEvent("submission_feedback", (data: SubmissionFeedbackPayload) => {
      console.log("[Game WS] Submission feedback:", data);
      debugger;
      if (data.status === "correct" || data.status === "success") {
        const animation = getRandomAttentionAnimation();
        updateAnimationState({
          attentionAnimation: animation,
          animatingTile: data.slot_id!,
        });

        // Play success sound
        if (typeof window !== "undefined" && "playFallbackAudio" in window) {
          (window as any).playFallbackAudio();
        }
      }
    });
  }, [onEvent]);

  return { sendEvent };
};
