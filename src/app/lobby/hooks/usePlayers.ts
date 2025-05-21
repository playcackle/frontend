"use client";

import { useCallback, useState } from "react";
import { AVATAR_PATTERNS } from "../[id]/constants";
import type { Player, PlayerAction } from "../types";

// Initial players data
const initialPlayers: Player[] = [
  {
    id: 1,
    name: "SynthWave84",
    score: 850,
    avatar: "SW",
    color: AVATAR_PATTERNS[0],
  },
  {
    id: 2,
    name: "RetroGamer",
    score: 720,
    avatar: "RG",
    color: AVATAR_PATTERNS[1],
  },
  {
    id: 3,
    name: "NeonRider",
    score: 690,
    avatar: "NR",
    color: AVATAR_PATTERNS[2],
  },
  {
    id: 4,
    name: "Arcade_Master",
    score: 650,
    avatar: "AM",
    color: AVATAR_PATTERNS[3],
  },
  {
    id: 5,
    name: "VHS_Collector",
    score: 620,
    avatar: "VC",
    color: AVATAR_PATTERNS[4],
  },
  {
    id: 6,
    name: "You",
    score: 580,
    avatar: "YO",
    color: AVATAR_PATTERNS[5],
  },
];

export const usePlayers = () => {
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [playerActions, setPlayerActions] = useState<PlayerAction[]>([]);
  const [lastAnsweringPlayer, setLastAnsweringPlayer] = useState<Player | null>(
    null
  );
  const [playerName] = useState<string>("You");

  // Update player score
  const updatePlayerScore = useCallback((playerId: number, points: number) => {
    setPlayers((prev) => {
      const updatedPlayers = [...prev];
      const playerIndex = updatedPlayers.findIndex((p) => p.id === playerId);

      if (playerIndex !== -1) {
        updatedPlayers[playerIndex] = {
          ...updatedPlayers[playerIndex],
          score: updatedPlayers[playerIndex].score + points,
        };
      }

      // Sort by score (descending)
      return [...updatedPlayers].sort((a, b) => b.score - a.score);
    });
  }, []);

  // Add player action
  const addPlayerAction = useCallback(
    (playerId: number, questionId: number) => {
      setPlayerActions((prev) => [
        ...prev,
        {
          playerId,
          questionId,
          timestamp: Date.now(),
          animationComplete: false,
        },
      ]);
    },
    []
  );

  // Mark player action as complete
  const markPlayerActionComplete = useCallback(
    (playerId: number, questionId: number) => {
      setPlayerActions((prev) =>
        prev.map((action) =>
          action.playerId === playerId && action.questionId === questionId
            ? { ...action, animationComplete: true }
            : action
        )
      );
    },
    []
  );

  // Get player by ID
  const getPlayerById = useCallback(
    (id: number) => {
      return players.find((p) => p.id === id);
    },
    [players]
  );

  // Get player by name
  const getPlayerByName = useCallback(
    (name: string) => {
      return players.find((p) => p.name === name);
    },
    [players]
  );

  // Get current player
  const getCurrentPlayer = useCallback(() => {
    return players.find((p) => p.name === "You") || players[5];
  }, [players]);

  // Get other players (not the current player)
  const getOtherPlayers = useCallback(() => {
    return players.filter((p) => p.name !== "You");
  }, [players]);

  return {
    players,
    playerActions,
    lastAnsweringPlayer,
    playerName,
    updatePlayerScore,
    addPlayerAction,
    markPlayerActionComplete,
    getPlayerById,
    getPlayerByName,
    getCurrentPlayer,
    getOtherPlayers,
    setLastAnsweringPlayer,
  };
};
