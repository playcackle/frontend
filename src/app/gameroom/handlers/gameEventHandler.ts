import { EventPayloadMap, GameEvent } from "../types";

// Type alias for generic handler
export type GameEventHandler<T extends GameEvent> = (
  data: EventPayloadMap[T]
) => void;

export const gameEventHandlers: {
  [K in GameEvent]: GameEventHandler<K>;
} = {
  connection_success: (data) => {
    console.log("Connected:", data.message);
  },
  game_starting_soon: (data) => {
    console.log(`Game starting in ${data.countdown_seconds} seconds.`);
  },
  waiting_for_players: (data) => {
    console.log(
      `Waiting for players (${data.current_players}/${data.min_players_needed})`
    );
  },
  game_start_cancelled: (data) => {
    console.warn(data.message);
  },
  lobby_tick: (data) => {
    console.log("Lobby Tick:", {
      status: data.status,
      round: data.current_round,
      timeRemaining: data.time_remaining_seconds,
      players: data.player_count,
      topic: data.topic_name,
    });
  },
  new_round_starting: (data) => {
    console.log(`Round ${data.round_number} starting:`, {
      topic: data.topic_name,
      duration: data.round_duration_seconds,
      slots: data.answer_slots,
    });
  },
  slot_snapped: (data) => {
    console.log(`${data.display_name} snapped: ${data.text}`, {
      points: data.points_awarded,
      score: data.player_score,
      roundOver: data.is_round_over,
    });
  },
  round_over_timeout: (data) => {
    console.log("Round over (timeout):", {
      round: data.round_number,
      unrevealed: data.unrevealed_answers,
      scores: data.player_scores,
    });
  },
  round_over_all_snapped: (data) => {
    console.log("Round complete (all snapped):", {
      round: data.round_number,
      scores: data.player_scores,
    });
  },
  break_starting: (data) => {
    console.log("Break starting:", {
      roundEnded: data.round_number_ended,
      nextRound: data.next_round_number,
      duration: data.break_duration_seconds,
      podium: data.podium,
    });
  },
  game_over: (data) => {
    console.log("Game Over!", {
      finalScores: data.final_scores,
      showcaseDuration: data.post_game_showcase_duration_seconds,
      nextGame: data.new_game_cycle_start_timestamp_utc,
    });
  },
  lobby_resetting_for_new_game: (data) => {
    console.log("Lobby resetting:", data.message);
  },
  submission_feedback: (data) => {
    console.log("Submission feedback:", {
      status: data.status,
      message: data.message,
      ...(data.slot_id && { slotId: data.slot_id }),
      ...(data.points_awarded && { points: data.points_awarded }),
      ...(data.your_score && { score: data.your_score }),
    });
  },
};
