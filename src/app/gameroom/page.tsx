"use client";

import SoundEffects from "@/app/components/sound-effects";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import ConfettiExplosion from "./confetti-explosion";
import styles from "./gameroom.module.css";
import ParticleExplosion from "./particle-explosion";

// Import custom hooks
import { useAnimations } from "./hooks/useAnimations";

// Import components
import { useAtomValue } from "jotai";
import Progress from "../loading";
import { gameRoomAtom } from "../store/lobby";
import ChatContainer from "./chat-container";
import AnswerForm from "./components/AnswerForm";
import CountdownOverlay from "./components/CountdownOverlay";
import RoomHeader from "./components/RoomHeader";
import SlotTile from "./components/SlotTile";
import StatsRow from "./components/StatsRow";
import { useGameSocket } from "./hooks/useGameWs";
import {
  FinalScore,
  NewRoundStartingPayload,
  PlayerScore,
  Slot,
  SubmissionFeedbackPayload,
} from "./types";
import {
  getRandomAttentionAnimation,
  getRandomEntranceAnimation,
} from "./utils";

export default function GameroomPage() {
  const searchParams = useSearchParams();
  const name = searchParams.get("name");
  const [answer, setAnswer] = useState<string>("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const gameroom = useAtomValue(gameRoomAtom);

  if (!gameroom) {
    return <div>Loading gameroom...</div>;
  }

  const gameRoomWs = useGameSocket(gameroom.game_ws_url, gameroom.token);

  // Refs
  const mainRef = useRef<HTMLDivElement>(null);

  // Custom hooks
  const { animationState, triggerCorrectAnimations } = useAnimations();

  const [loading, setLoading] = useState(false);
  const [soundsLoaded, setSoundsLoaded] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiPosition, setConfettiPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const [playerCount, setPlayerCount] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(45);
  const [playerScore, setPlayerScore] = useState<PlayerScore[]>([]); // Replace any with Player type if available
  const [finalScore, setFinalScore] = useState<FinalScore[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [entranceAnimation, setEntranceAnimation] = useState("");
  const [isIntermission, setIsIntermission] = useState(false);
  const [animatingTile, setAnimatingTile] = useState("");
  const [attentionAnimation, setAttentionAnimation] = useState("");

  useEffect(() => {
    setLoading(!gameRoomWs);
  }, [gameRoomWs]);
  useEffect(() => {
    if (!gameRoomWs) return;
    // Listen for lobby_tick to update activePlayers and timeRemaining
    gameRoomWs.onEvent("lobby_tick", (data) => {
      if (slots.length === 0) {
        setSlots([]);
      }
      console.log("[Game WS] lobby_tick event received:", data);
      setPlayerCount(data.player_count);
      setTimeRemaining(data.time_remaining_seconds ?? 0);
    });
    // Listen for round_over_timeout to update leaderboard
    gameRoomWs.onEvent("round_over_timeout", (data) => {
      setPlayerScore(data.player_scores);
      setIsIntermission(true);
    });
    gameRoomWs.onEvent(
      "new_round_starting",
      (data: NewRoundStartingPayload) => {
        debugger;
        setEntranceAnimation(getRandomEntranceAnimation());
        setSlots(data.answer_slots);
        setIsIntermission(false);
      }
    );
    // Listen for round_over_all_snapped to update leaderboard
    gameRoomWs.onEvent("round_over_all_snapped", (data) => {
      setPlayerScore(data.player_scores);
      setIsIntermission(true);
    });

    // Listen for game_over to update leaderboard
    gameRoomWs.onEvent("game_over", (data) => {
      setFinalScore(data.final_scores);
    });
    // Listen for submission feedback
    gameRoomWs.onEvent(
      "submission_feedback",
      (data: SubmissionFeedbackPayload) => {
        console.log("[Game WS] Submission feedback:", data);
        setIsSubmitting(false);
        if (data.status === "correct") {
          const animation = getRandomAttentionAnimation();
          setAttentionAnimation(animation);
          setAnimatingTile(data.slot_id!);
          // Trigger animations for correct answer
          triggerCorrectAnimations(
            parseInt(data.slot_id!),
            null,
            mainRef,
            false
          );
          // Play success sound
          if (typeof window !== "undefined" && "playFallbackAudio" in window) {
            (window as any).playFallbackAudio();
          }
          setTimeout(() => {}, 300);
        }
      }
    );
  }, [gameRoomWs, triggerCorrectAnimations]);

  const handleSubmitAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim() || isSubmitting || !gameRoomWs) return;
    setIsSubmitting(true);
    gameRoomWs.sendEvent("submit_answer", answer);
    setAnswer(""); // Clear the input after submission
  };

  return (
    <>
      {loading && <Progress />}
      {!loading && (
        <div className={styles.container}>
          {/* Countdown overlay */}
          <CountdownOverlay
            show={isIntermission && timeRemaining === 5}
            value={timeRemaining}
          />

          {/* Confetti explosion */}
          {true && confettiPosition && (
            <ConfettiExplosion
              isBonus={animationState.isBonus}
              x={confettiPosition.x}
              y={confettiPosition.y}
              centered={false}
              playerColor={"--neon-blue"} // Add player color
            />
          )}

          <main
            ref={mainRef}
            className={`
          ${styles.main}
          ${animationState.shake ? styles.shake : ""}
          ${animationState.colorFlash ? styles.colorFlash : ""}
          ${animationState.zoomEffect ? styles.zoomEffect : ""}
          ${animationState.rotateEffect ? styles.rotateEffect : ""}
        `}
          >
            {/* Room title */}
            <RoomHeader name={name!} roundNumber={1} />

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
              activePlayers={playerCount}
              isIntermission={false}
              timeRemaining={timeRemaining}
              intermissionTimeRemaining={90}
              players={playerScore}
              nameFlash={animationState.nameFlash}
            />

            {/* Second row: Slots grid and chat */}
            <div className={styles.contentRow}>
              <div
                className={styles.slotContainer}
                style={
                  { "--room-color": "var(--neon-pink)" } as React.CSSProperties
                }
              >
                <div className={styles.slotGrid}>
                  {slots.map((slot, i) => (
                    <SlotTile
                      className={`
                  ${styles.main}
                  ${animationState.shake ? styles.shake : ""}
                  ${animationState.colorFlash ? styles.colorFlash : ""}
                  ${animationState.zoomEffect ? styles.zoomEffect : ""}
                  ${animationState.rotateEffect ? styles.rotateEffect : ""}
                `}
                      key={slot.slot_id}
                      slot={slot}
                      isAnimating={animatingTile === slot.slot_id}
                      timeExpired={timeRemaining === 0}
                      isIntermission={isIntermission}
                      entranceAnimation={entranceAnimation}
                      entranceDelay={i + 20}
                      revealDelay={i + 10}
                      animation={attentionAnimation}
                      revealAnimation={entranceAnimation}
                    />
                  ))}
                </div>
              </div>
              <ChatContainer />
            </div>

            {/* Third row: Answer input and feedback */}
            <div className={styles.answerRow}>
              <AnswerForm
                answer={answer}
                setAnswer={setAnswer}
                timeExpired={timeRemaining === 0}
                isIntermission={false}
                intermissionTimeRemaining={10}
                onSubmit={handleSubmitAnswer}
              />
            </div>
          </main>
        </div>
      )}
    </>
  );
}
