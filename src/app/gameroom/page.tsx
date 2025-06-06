"use client";

import SoundEffects from "@/app/components/sound-effects";
import { useSearchParams } from "next/navigation";
import React, { useRef } from "react";
import styles from "./gameroom.module.css";

// Import custom hooks
import { useAtomValue } from "jotai";
import Progress from "../loading";
import { gameRoomAtom } from "../store/lobby";
import ChatContainer from "./chat-container";
import CountdownOverlay from "./components/CountdownOverlay";
import RoomHeader from "./components/RoomHeader";

// Import optimized components
import AnswerForm from "./components/AnswerForm";
import GameEffects from "./components/GameEffects";
import SlotGrid from "./components/SlotGrid";
import StatsRow from "./components/StatsRow";

import { Flex } from "@radix-ui/themes";
import Leaderboard from "./components/LeaderBoard";
import { useGameActions } from "./hooks/useGameActions";
import { useGameEvents } from "./hooks/useGameEvents";
import { useAnswer, useGameState } from "./hooks/useGameState";

export default function GameroomPage() {
  const searchParams = useSearchParams();
  const name = searchParams.get("name");
  const gameroom = useAtomValue(gameRoomAtom);

  // Global state hooks
  const {
    loading,
    roundName,
    roundNumber,
    isRoundBreak,
    timeRemaining,
    showCountDown,
    updateGameState,
  } = useGameState();
  const { clearAnswer, answer } = useAnswer();

  // Refs
  const mainRef = useRef<HTMLDivElement>(null);

  // Custom hooks
  const { submitAnswer } = useGameActions();

  if (!gameroom) {
    return <div>Loading gameroom...</div>;
  }

  // Game events handling
  const { sendEvent } = useGameEvents(gameroom.game_ws_url, gameroom.token);

  const handleSubmitAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    submitAnswer(answer, sendEvent);
    clearAnswer();
  };

  const handleSoundsLoaded = () => {
    updateGameState({ soundsLoaded: true });
  };

  return (
    <>
      {loading && <Progress />}
      {!loading && (
        <div className={styles.container}>
          <CountdownOverlay show={showCountDown} value={timeRemaining} />

          <GameEffects animationState={{}} />

          <div
            ref={mainRef}
            className={`
              ${styles.main}
            `}
          >
            <RoomHeader
              roundName={roundName}
              roomName={name!}
              roundNumber={roundNumber}
              totalRounds={10}
            />

            <SoundEffects onLoad={handleSoundsLoaded} />

            <StatsRow nameFlash={false} />

            <div className={styles.contentRow}>
              <Flex direction="column" gap="3">
                <div
                  className={styles.slotContainer}
                  style={
                    {
                      "--room-color": "var(--neon-pink)",
                    } as React.CSSProperties
                  }
                >
                  {isRoundBreak ? <Leaderboard /> : <SlotGrid />}
                </div>
                <div className={styles.answerRow}>
                  <AnswerForm onSubmit={handleSubmitAnswer} />
                </div>
              </Flex>
              <ChatContainer />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
