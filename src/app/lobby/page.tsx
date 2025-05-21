"use client";

import Header from "@/app/components/header";
import SoundEffects from "@/app/components/sound-effects";
import SynthwaveBackground from "@/app/components/synthwave-background";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import ChatContainer from "./chat-container";
import ConfettiExplosion from "./confetti-explosion";
import styles from "./lobby.module.css";
import ParticleExplosion from "./particle-explosion";

// Import custom hooks
import { useAnimations } from "./hooks/useAnimations";
import { usePlayers } from "./hooks/usePlayers";

// Import components
import AnswerForm from "./components/AnswerForm";
import CountdownOverlay from "./components/CountdownOverlay";
import FeedbackTile from "./components/FeedbackTile";
import PlayerActionOverlay from "./components/PlayerActionOverlay";
import QuestionsGrid from "./components/QuestionsGrid";
import RoomHeader from "./components/RoomHeader";
import StatsRow from "./components/StatsRow";

// Import constants and utils

type Lobby = {
  id: string;
  token: string;
  game_ws_url: string;
  chat_ws_url: string;
};

export default function LobbyPage(props: Lobby) {
  const searchParams = useSearchParams();
  const gameWsUrl = searchParams.get("game_ws_url");

  // Refs
  const mainRef = useRef<HTMLDivElement>(null);

  // Custom hooks

  const {
    players,
    playerActions,
    playerName,
    updatePlayerScore,
    getPlayerById,
    getCurrentPlayer,
  } = usePlayers();

  const { animationState, triggerCorrectAnimations } = useAnimations();

  // State for sound loading
  const [soundsLoaded, setSoundsLoaded] = React.useState(false);

  // Add a new state for confetti position
  const [confettiPosition, setConfettiPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // Add this near the top of the component, after the other useState calls
  const [isClient, setIsClient] = useState(false);

  // Add this useEffect to handle client-side initialization
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className={styles.container}>
      <SynthwaveBackground />
      <Header />

      {/* Countdown overlay */}
      <CountdownOverlay
        show={gameState.showCountdown}
        value={gameState.countdownValue}
      />

      {/* Confetti explosion */}
      {isClient && gameState.showConfetti && confettiPosition && (
        <ConfettiExplosion
          isBonus={animationState.isBonus}
          x={confettiPosition.x}
          y={confettiPosition.y}
          centered={false}
          playerColor={getCurrentPlayer().color} // Add player color
        />
      )}

      {/* Player action overlays */}
      {isClient &&
        playerActions
          .filter((action) => !action.animationComplete)
          .map((action) => {
            const player = getPlayerById(action.playerId);
            if (!player) return null;

            const question = getQuestionById(action.questionId);
            if (!question) return null;

            return (
              <PlayerActionOverlay
                key={`${action.playerId}-${action.questionId}-${action.timestamp}`}
                action={action}
                player={player}
                questionPoints={question.points}
              />
            );
          })}

      <main
        ref={mainRef}
        className={`
          ${styles.main}
          ${animationState.screenShake ? styles.screenShake : ""}
          ${animationState.colorFlash ? styles.colorFlash : ""}
          ${animationState.zoomEffect ? styles.zoomEffect : ""}
          ${animationState.rotateEffect ? styles.rotateEffect : ""}
        `}
      >
        {/* Room title */}
        <RoomHeader room={currentRoom} roundNumber={gameState.roundNumber} />

        {/* Sound effects */}
        <SoundEffects onLoad={() => setSoundsLoaded(true)} />

        {/* Glitter overlay */}
        {animationState.showGlitter && (
          <div className={styles.glitterOverlay}></div>
        )}

        {/* Particle explosion */}
        {animationState.particlePosition && (
          <ParticleExplosion
            x={animationState.particlePosition.x}
            y={animationState.particlePosition.y}
            isBonus={animationState.isBonus}
          />
        )}

        {/* First row: Stats tiles */}
        <StatsRow
          activePlayers={currentRoom.activePlayers}
          isIntermission={gameState.isIntermission}
          timeRemaining={gameState.timeRemaining}
          intermissionTimeRemaining={gameState.intermissionTimeRemaining}
          players={players}
          nameFlash={animationState.nameFlash}
        />

        {/* Second row: Questions grid and chat */}
        <div className={styles.contentRow}>
          <QuestionsGrid
            questions={questions}
            bonusQuestions={bonusQuestions}
            animatingTile={animationState.animatingTile}
            timeExpired={gameState.timeExpired}
            isIntermission={gameState.isIntermission}
          />

          <ChatContainer />
        </div>

        {/* Third row: Answer input and feedback */}
        <div className={styles.answerRow}>
          <AnswerForm
            answer={answer}
            setAnswer={setAnswer}
            timeExpired={gameState.timeExpired}
            isIntermission={gameState.isIntermission}
            intermissionTimeRemaining={gameState.intermissionTimeRemaining}
            onSubmit={handleAnswerSubmit}
          />

          <FeedbackTile
            feedback={feedback}
            isIntermission={gameState.isIntermission}
            intermissionTimeRemaining={gameState.intermissionTimeRemaining}
            roundNumber={gameState.roundNumber}
          />
        </div>
      </main>
    </div>
  );
}
