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

import { useGameActions } from "./hooks/useGameActions";
import { useGameEvents } from "./hooks/useGameEvents";
import { useAnswer, useGameState } from "./hooks/useGameState";

export default function GameroomPage() {
  const searchParams = useSearchParams();
  const name = searchParams.get("name");
  const gameroom = useAtomValue(gameRoomAtom);

  // Global state hooks
  const { loading, roundName, isIntermission, timeRemaining, updateGameState } =
    useGameState();
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
          <CountdownOverlay
            show={isIntermission && timeRemaining === 5}
            value={timeRemaining}
          />

          <GameEffects animationState={{}} />

          <main
            ref={mainRef}
            className={`
              ${styles.main}
            `}
          >
            <RoomHeader
              roundName={roundName}
              roomName={name!}
              roundNumber={1}
              totalRounds={10}
            />

            <SoundEffects onLoad={handleSoundsLoaded} />

            <StatsRow nameFlash={false} />

            <div className={styles.contentRow}>
              <div
                className={styles.slotContainer}
                style={
                  { "--room-color": "var(--neon-pink)" } as React.CSSProperties
                }
              >
                <SlotGrid />
              </div>
              <ChatContainer />
            </div>

            <div className={styles.answerRow}>
              <AnswerForm onSubmit={handleSubmitAnswer} />
            </div>
          </main>
        </div>
      )}
    </>
  );
}
