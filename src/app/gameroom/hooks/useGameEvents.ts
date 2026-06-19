import { useSetAtom, useStore } from "jotai";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import {
  clearRoundHintsAtom,
  addUnifiedMessageAtom,
  clearUnifiedMessagesAtom,
  connectionStatusAtom,
  gameStateAtom,
  playAgainStateAtom,
  resetPlayAgainStateAtom,
  timeRemainingAtom,
  updateGameStateAtom,
  updatePlayAgainStateAtom,
  type UnifiedMessage,
} from "../store/gameAtoms";
import {
  GameStartCancelledPayload,
  GameStartingSoonPayload,
  GameOverPayload,
  LobbySyncPayload,
  LobbyTickPayload,
  NewRoundStartedPayload,
  PlayAgainCountUpdatePayload,
  PlayAgainPlayerUpdatePayload,
  PlayAgainPromptPayload,
  RoundOverPayload,
  RoundStartingSoonPayload,
  SlotSnappedPayload,
  SubmissionFeedbackPayload,
  WaitingForPlayersPayload,
} from "../types/payloads";
import { getRandomSnappedSound, getRandomSuccessSound, playSound } from "../utils";
import { useGameSocket } from "./useGameSocket";

/** Grace period (ms) before a disconnection triggers the full loading screen.
 *  Brief blips (< 3s) show only the reconnection banner, not the loading overlay. */
const LOADING_GRACE_PERIOD_MS = 3000;

export const useGameEvents = (gameWsUrl: string, token: string) => {
  const navigate = useNavigate();
  const { onEvent, sendEvent, isConnected, connectionStatus, reconnect } =
    useGameSocket(gameWsUrl, token);
  const store = useStore();

  // All Jotai setters are stable references — never cause effect re-runs
  const updateGameState = useSetAtom(updateGameStateAtom);
  const clearRoundHints = useSetAtom(clearRoundHintsAtom);
  const clearUnifiedMessages = useSetAtom(clearUnifiedMessagesAtom);
  const setConnectionStatus = useSetAtom(connectionStatusAtom);
  const updatePlayAgainState = useSetAtom(updatePlayAgainStateAtom);
  const resetPlayAgainState = useSetAtom(resetPlayAgainStateAtom);
  const addUnifiedMessage = useSetAtom(addUnifiedMessageAtom);

  // ---------------------------------------------------------------------------
  // Local countdown: derives timeRemaining from the server-authoritative
  // phaseEndsAt timestamp once per second. This keeps the timer smooth
  // regardless of lobby_tick frequency and resilient to dropped ticks.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const interval = setInterval(() => {
      const state = store.get(gameStateAtom);
      if (state.phaseEndsAt) {
        const remaining = Math.max(0, Math.round(
          (new Date(state.phaseEndsAt).getTime() - Date.now()) / 1000
        ));
        const current = store.get(timeRemainingAtom);
        if (remaining !== current) {
          store.set(updateGameStateAtom, { timeRemaining: remaining });
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [store]);

  // ---------------------------------------------------------------------------
  // Connection → loading gate with grace period
  // ---------------------------------------------------------------------------
  // Instead of flipping `loading: true` instantly on disconnect (which hides the
  // entire game UI), we:
  //   1. Update the lightweight `connectionStatusAtom` immediately (for banner)
  //   2. Only set `loading: true` if the disconnection persists beyond the grace
  //      period — giving socket.io time to reconnect transparently.
  // ---------------------------------------------------------------------------
  const prevLobbyIdRef = useRef<string | null>(null);
  const graceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasReceivedFirstSync = useRef(false);
  useEffect(() => {
    const isHealthy = isConnected && connectionStatus === "connected";

    if (isHealthy) {
      setConnectionStatus("connected");
    } else if (connectionStatus === "reconnecting") {
      setConnectionStatus("reconnecting");
    } else if (connectionStatus === "disconnected") {
      setConnectionStatus("disconnected");
    }

    if (isHealthy) {
      if (graceTimerRef.current) {
        clearTimeout(graceTimerRef.current);
        graceTimerRef.current = null;
      }
      return;
    }

    if (!hasReceivedFirstSync.current) return;

    if (!graceTimerRef.current) {
      graceTimerRef.current = setTimeout(() => {
        graceTimerRef.current = null;
        updateGameState({ loading: true });
      }, LOADING_GRACE_PERIOD_MS);
    }

    return () => {
      if (graceTimerRef.current) {
        clearTimeout(graceTimerRef.current);
        graceTimerRef.current = null;
      }
    };
  }, [isConnected, connectionStatus, updateGameState, setConnectionStatus]);

  useEffect(() => {
    const cleanups = [
      onEvent("lobby_state_sync", (data: LobbySyncPayload) => {
        hasReceivedFirstSync.current = true;

        // Clear room-scoped transient state when joining a different lobby
        if (prevLobbyIdRef.current && prevLobbyIdRef.current !== data.lobby_id) {
          clearRoundHints();
          clearUnifiedMessages();
        }
        prevLobbyIdRef.current = data.lobby_id;

        updateGameState({
          roundNumber: data.round_number,
          roundExample: data.topic_example,
          roundPrompt: data.topic_prompt,
          totalRounds: data.total_rounds,
          playerCount: data.player_count,
          timeRemaining: data.time_remaining_seconds ?? 0,
          roundName: data.topic_name ?? "",
          phaseEndsAt: data.phase_ends_at ?? null,
          showCountDown:
            data.time_remaining_seconds! < 5 &&
            data.time_remaining_seconds! > 0 &&
            (data.status === "ROUND_BREAK" ||
              data.status === "POST_GAME_SHOWCASE"),
          isRoundBreak: data.status === "ROUND_BREAK",
          scores: data.scores ?? [],
          slots: data.slots ?? [],
          loading: false,
          lobbyStatus: data.status,
        });

        // Restore opt-in state from state sync (for reconnects during showcase)
        if (data.status === "POST_GAME_SHOWCASE" && data.play_again_state) {
          updatePlayAgainState({
            showPrompt: true,
            confirmedCount: data.play_again_state.confirmed_count,
            totalWaiting: data.play_again_state.total_waiting,
            neededToStart: data.play_again_state.needed_to_start,
          });
        } else if (data.status !== "POST_GAME_SHOWCASE") {
          resetPlayAgainState();
        }
      }),

      onEvent("lobby_tick", (data: LobbyTickPayload) => {
        // lobby_tick is a periodic heartbeat — always apply regardless of
        // stateVersion, since it keeps timers counting down and self-corrects
        // phase desync. State transition events (round_over, new_round_started)
        // are version-gated; the tick is not.
        //
        // Store authoritative phaseEndsAt when available. The local countdown
        // interval derives smooth timeRemaining from this anchor.
        updateGameState({
          playerCount: data.player_count,
          timeRemaining: data.time_remaining_seconds ?? 0,
          scores: data.scores ?? [],
          lobbyStatus: data.status,
          isRoundBreak: data.status === "ROUND_BREAK",
          phaseEndsAt: data.phase_ends_at ?? null,
        });
      }),

      onEvent("game_starting_soon", (data: GameStartingSoonPayload) => {
        updateGameState({
          showCountDown: true,
          lobbyStatus: "STARTING_SOON",
          timeRemaining: data.countdown_seconds,
          phaseEndsAt: data.start_timestamp_utc,
        });
      }),

      onEvent("round_starting_soon", (data: RoundStartingSoonPayload) => {
        updateGameState({
          showCountDown: true,
          phaseEndsAt: data.start_timestamp_utc,
        });
      }),

      onEvent("round_over", (data: RoundOverPayload) => {
        updateGameState({
          isRoundBreak: true,
          lobbyStatus: "ROUND_BREAK",
          scores: data.scores ?? [],
          accolades: data.accolades ?? [],
          timeRemaining: data.break_duration_seconds ?? 0,
          phaseEndsAt: data.break_end_timestamp_utc ?? null,
        });
        playSound("timeUp");
      }),

      onEvent("game_start_cancelled", () => {
        updateGameState({ lobbyStatus: "WAITING", showCountDown: false });
      }),

      onEvent("new_round_started", (data: NewRoundStartedPayload) => {
        updateGameState({
          isRoundBreak: false,
          roundName: data.topic_name,
          roundExample: data.topic_example,
          roundPrompt: data.topic_prompt,
          slots: data.slots,
          roundNumber: data.round_number,
          showCountDown: false,
          accolades: [],
          lobbyStatus: "IN_ROUND",
          phaseEndsAt: data.round_end_timestamp_utc,
        });
        clearRoundHints();
        playSound("newRound");
      }),

      onEvent("game_over", (data: GameOverPayload) => {
        updateGameState({
          finalScore: data.final_scores,
          playerAccolades: data.player_accolades ?? [],
          showCountDown: false,
          timeRemaining: 0,
          isRoundBreak: false,
          lobbyStatus: "POST_GAME_SHOWCASE",
          phaseEndsAt: data.new_game_cycle_start_timestamp_utc,
        });
        playSound("timeUp");
      }),

      onEvent("play_again_prompt", (data: PlayAgainPromptPayload) => {
        // Server re-sends play_again_prompt when players join/leave (players_waiting changes).
        // Preserve existing user response and confirmed count so they aren't wiped on each update.
        const existing = store.get(playAgainStateAtom);
        const alreadyResponded = existing.userResponse !== null;
        updatePlayAgainState({
          showPrompt: true,
          timeoutSeconds: data.timeout_seconds,
          minPlayers: data.min_players,
          playersWaiting: data.players_waiting,
          totalWaiting: data.players_waiting,
          neededToStart: Math.max(0, data.min_players - (alreadyResponded ? existing.confirmedCount : 0)),
          confirmedCount: alreadyResponded ? existing.confirmedCount : 0,
          userResponse: alreadyResponded ? existing.userResponse : null,
          playerResponses: alreadyResponded ? existing.playerResponses : {},
        });
      }),

      onEvent("play_again_count_update", (data: PlayAgainCountUpdatePayload) => {
        updatePlayAgainState({
          confirmedCount: data.confirmed_count,
          totalWaiting: data.total_waiting,
          neededToStart: data.needed_to_start,
        });
      }),

      onEvent("play_again_player_update", (data: PlayAgainPlayerUpdatePayload) => {
        const existing = store.get(playAgainStateAtom);
        updatePlayAgainState({
          playerResponses: {
            ...existing.playerResponses,
            [data.player_id]: {
              displayName: data.display_name,
              response: data.response,
            },
          },
        });
      }),

      onEvent("lobby_resetting_for_new_game", () => {
        const playAgainState = store.get(playAgainStateAtom);

        // Clear the game state for new round
        updateGameState({
          roundNumber: 0,
          roundName: "",
          roundExample: "",
          roundPrompt: "",
          isRoundBreak: false,
          slots: [],
          scores: [],
          finalScore: [],
          playerAccolades: [],
          showCountDown: false,
          lobbyStatus: "WAITING",
          phaseEndsAt: null,
        });
        clearUnifiedMessages();

        store.set(resetPlayAgainStateAtom);
        // If player opted in ("yes"), stay in lobby to receive new game content
        // Otherwise redirect to home
        if (playAgainState.userResponse !== "yes") {
          navigate({ to: "/" });
        }
      }),

      onEvent("slot_snapped", (data: SlotSnappedPayload) => {
        updateGameState({
          slots: data.slots,
          scores: data.scores,
        });
        playSound(getRandomSnappedSound());
      }),

      onEvent("submission_feedback", (data: SubmissionFeedbackPayload) => {
        if (data.status === "success") {
          playSound(getRandomSuccessSound());
        }
      }),

      onEvent("waiting_for_players", (data: WaitingForPlayersPayload) => {
        const currentStatus = store.get(gameStateAtom).lobbyStatus;
        const isRoundActive =
          currentStatus === "IN_ROUND" ||
          currentStatus === "ROUND_BREAK" ||
          currentStatus === "POST_GAME_SHOWCASE" ||
          currentStatus === "STARTING_SOON";
        updateGameState({
          ...(isRoundActive ? {} : { lobbyStatus: "WAITING" }),
          playerCount: data.current_players,
          minPlayersNeeded: data.min_players_needed,
        });
      }),

      onEvent("unified_message", (data: UnifiedMessage) => {
        addUnifiedMessage(data);
      }),

      onEvent("message_error", (data: { error?: string }) => {
        console.warn("Message error:", data?.error);
      }),
    ];

    return () => cleanups.forEach((fn) => fn?.());
  }, [
    onEvent,
    updateGameState,
    clearRoundHints,
    clearUnifiedMessages,
    addUnifiedMessage,
    sendEvent,
    navigate,
    store,
  ]);

  return { sendEvent, connectionStatus, reconnect };
};