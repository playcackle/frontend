"use client";

import Header from "@/app/components/header";
import SoundEffects from "@/app/components/sound-effects";
import SynthwaveBackground from "@/app/components/synthwave-background";
import { useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import ChatContainer from "./chat-container";
import ConfettiExplosion from "./confetti-explosion";
import ParticleExplosion from "./particle-explosion";
import styles from "./quiz-room.module.css";

// Import custom hooks
import { useAnimations } from "./hooks/useAnimations";
import { useGameState } from "./hooks/useGameState";
import { useMessages } from "./hooks/useMessages";
import { usePlayers } from "./hooks/usePlayers";
import { useQuestions } from "./hooks/useQuestions";

// Import components
import AnswerForm from "./components/AnswerForm";
import CountdownOverlay from "./components/CountdownOverlay";
import FeedbackTile from "./components/FeedbackTile";
import PlayerActionOverlay from "./components/PlayerActionOverlay";
import QuestionsGrid from "./components/QuestionsGrid";
import RoomHeader from "./components/RoomHeader";
import StatsRow from "./components/StatsRow";

// Import constants and utils
import { QUIZ_ROOMS } from "./constants";
import { getCurrentTime, getRandomAttentionAnimation } from "./utils";

export default function QuizRoomPage() {
  const searchParams = useSearchParams();
  const roomId = searchParams.get("roomId") || "music"; // Default to music if no roomId is provided
  const currentRoom = QUIZ_ROOMS[roomId] || QUIZ_ROOMS.music;

  // Refs
  const mainRef = useRef<HTMLDivElement>(null);

  // Custom hooks
  const {
    messages,
    chatInput,
    answer,
    feedback,
    setChatInput,
    setAnswer,
    setFeedback,
    addMessage,
    handleSendMessage,
  } = useMessages();

  const {
    players,
    playerActions,
    playerName,
    updatePlayerScore,
    addPlayerAction,
    markPlayerActionComplete,
    getPlayerById,
    getCurrentPlayer,
    getOtherPlayers,
    setLastAnsweringPlayer,
  } = usePlayers();

  const {
    gameState,
    startIntermission,
    startNewRound,
    handleTimeExpired,
    setOtherPlayerAnswering,
    setShowConfetti,
  } = useGameState({
    onTimeExpired: () => {
      // Update feedback
      setFeedback("Time's up! Revealing all answers...");

      // Reveal all unanswered questions
      revealAllUnansweredQuestions(players);

      // Start intermission after a short delay
      setTimeout(() => {
        startIntermission();
      }, 3000);
    },
    onIntermissionEnd: () => startNewRound(),
    addMessage,
  });

  const {
    questions,
    bonusQuestions,
    resetQuestionsForNewRound,
    markQuestionAsAnswered,
    revealAllUnansweredQuestions,
    areAllQuestionsAnswered,
    getUnansweredQuestions,
    getQuestionById,
  } = useQuestions(gameState.roundNumber);

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

  // Effect to reset questions when round changes
  useEffect(() => {
    resetQuestionsForNewRound(gameState.roundNumber);
  }, [gameState.roundNumber, resetQuestionsForNewRound]);

  // Function to check if all questions are answered
  const checkAllQuestionsAnswered = useCallback(() => {
    if (
      areAllQuestionsAnswered() &&
      !gameState.timeExpired &&
      !gameState.isIntermission
    ) {
      // Update feedback
      setFeedback("All questions answered! Round complete!");

      // Show confetti explosion
      setShowConfetti(true);

      // Add a message to the chat
      addMessage({
        user: "System",
        text: "All questions have been answered! Round complete!",
        time: getCurrentTime(),
      });

      // Start intermission after a short delay
      setTimeout(() => {
        startIntermission();
      }, 3000);
    }
  }, [
    areAllQuestionsAnswered,
    gameState.timeExpired,
    gameState.isIntermission,
    setFeedback,
    setShowConfetti,
    addMessage,
    startIntermission,
  ]);

  // Handle question click
  const handleQuestionClick = useCallback(
    (
      question: { answered: any; id: number; points: number },
      event: React.MouseEvent<Element, MouseEvent> | null | undefined
    ) => {
      // Don't allow clicking if another player is currently answering or during intermission
      if (
        !question.answered &&
        !gameState.timeExpired &&
        !gameState.isIntermission
      ) {
        // Get a random attention animation
        const animation = `animate__animated ${getRandomAttentionAnimation()}`;

        // Trigger animations
        triggerCorrectAnimations(question.id, event, mainRef);

        // Show confetti for bonus questions
        if (question.id >= 9) {
          // This is a bonus question (IDs 9 and above are bonus questions)
          setShowConfetti(false); // Reset first to avoid duplicate renders

          // Get the position of the question tile
          const questionElement = event!.currentTarget;
          const rect = questionElement.getBoundingClientRect();
          const x = rect.left + rect.width / 2;
          const y = rect.top + rect.height / 2;

          setTimeout(() => {
            // Set the confetti position and show it
            setConfettiPosition({ x, y });
            setShowConfetti(true);

            // Hide confetti after animation completes
            setTimeout(() => {
              setShowConfetti(false);
            }, 3000);
          }, 0);
        }

        // Get current player
        const currentPlayer = getCurrentPlayer();

        // Mark question as answered
        markQuestionAsAnswered(
          question.id,
          currentPlayer.name,
          currentPlayer.avatar,
          currentPlayer.color,
          animation
        );

        // Update feedback
        setFeedback(`Correct! +${question.points} points`);

        // Update player score
        updatePlayerScore(currentPlayer.id, question.points);

        // Check if all questions are now answered
        setTimeout(() => {
          checkAllQuestionsAnswered();
        }, 500);
      }
    },
    [
      gameState.timeExpired,
      gameState.isIntermission,
      triggerCorrectAnimations,
      getCurrentPlayer,
      markQuestionAsAnswered,
      setFeedback,
      updatePlayerScore,
      checkAllQuestionsAnswered,
      setShowConfetti,
      setConfettiPosition,
    ]
  );

  // Handle answer submission
  const handleAnswerSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!answer.trim() || gameState.timeExpired || gameState.isIntermission)
        return;

      // Get unanswered questions
      const unansweredQuestions = getUnansweredQuestions();
      if (unansweredQuestions.length > 0) {
        // Select a random unanswered question
        const randomIndex = Math.floor(
          Math.random() * unansweredQuestions.length
        );
        const selectedQuestion = unansweredQuestions[randomIndex];

        // Get current player
        const currentPlayer = getCurrentPlayer();

        // Get a random attention animation
        const animation = `animate__animated ${getRandomAttentionAnimation()}`;

        // Trigger animations
        triggerCorrectAnimations(selectedQuestion.id, null, mainRef);

        // Show confetti for bonus questions
        if (selectedQuestion.id >= 9) {
          // This is a bonus question
          setShowConfetti(false); // Reset first

          // Find the question element by ID
          const questionElement = document.getElementById(
            `question-${selectedQuestion.id}`
          );
          if (questionElement) {
            const rect = questionElement.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;

            setConfettiPosition({ x, y });
          } else {
            // Fallback to center of the questions container
            const questionsContainer = document.querySelector(
              `.${styles.questionsContainer}`
            );
            if (questionsContainer) {
              const rect = questionsContainer.getBoundingClientRect();
              setConfettiPosition({
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2,
              });
            }
          }

          setTimeout(() => {
            setShowConfetti(true);

            // Hide confetti after animation completes
            setTimeout(() => {
              setShowConfetti(false);
            }, 3000);
          }, 0);
        }

        // Mark question as answered
        markQuestionAsAnswered(
          selectedQuestion.id,
          currentPlayer.name,
          currentPlayer.avatar,
          currentPlayer.color,
          animation
        );

        // Update feedback
        setFeedback(`Correct! +${selectedQuestion.points} points`);

        // Update player score
        updatePlayerScore(currentPlayer.id, selectedQuestion.points);

        // Check if all questions are now answered
        setTimeout(() => {
          checkAllQuestionsAnswered();
        }, 500);
      } else {
        setFeedback("All questions have been answered!");
      }

      // Clear answer input
      setAnswer("");
    },
    [
      answer,
      gameState.timeExpired,
      gameState.isIntermission,
      getUnansweredQuestions,
      getCurrentPlayer,
      triggerCorrectAnimations,
      markQuestionAsAnswered,
      setFeedback,
      updatePlayerScore,
      checkAllQuestionsAnswered,
      setAnswer,
      setShowConfetti,
      setConfettiPosition,
    ]
  );

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
            onQuestionClick={handleQuestionClick}
          />

          <ChatContainer
            messages={messages}
            chatInput={chatInput}
            setChatInput={setChatInput}
            handleSendMessage={(e) => handleSendMessage(e, playerName)}
          />
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
