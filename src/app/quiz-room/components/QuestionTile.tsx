"use client";

import React, { useEffect, useState } from "react";
import styles from "../quiz-room.module.css";
import type { Question } from "../types";

interface QuestionTileProps {
  question: Question;
  isAnimating: boolean;
  timeExpired: boolean;
  isIntermission: boolean;
  onClick: (question: Question, event: React.MouseEvent) => void;
  isBonus?: boolean;
}

const QuestionTile: React.FC<QuestionTileProps> = ({
  question,
  isAnimating,
  timeExpired,
  isIntermission,
  onClick,
  isBonus = false,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prepare animationDelay only after mount to avoid SSR mismatch
  const animationDelay = mounted
    ? timeExpired && !question.answered
      ? `${question.revealDelay}s`
      : `${question.entranceDelay}s`
    : undefined;

  const tileClassNames = [
    styles.questionTile,
    isBonus ? styles.bonusTile : "",
    question.answered ? styles.answered : "",
    mounted && isAnimating ? styles.correctPulse : "",
    mounted ? question.animation : "",
    mounted ? question.entranceAnimation : "",
    mounted && timeExpired && !question.answered
      ? question.revealAnimation
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      id={`question-${question.id}`}
      className={tileClassNames}
      style={
        {
          "--room-color": isBonus ? "var(--neon-purple)" : "var(--neon-pink)",
          animationDelay,
        } as React.CSSProperties
      }
    >
      {question.answered || (timeExpired && !question.answered) ? (
        <div className={styles.answeredContent}>
          <div className={styles.correctAnswer}>{question.correctAnswer}</div>
          {question.answeredBy && (
            <div className={styles.playerBadge}>
              <div
                className={styles.playerBadgeAvatar}
                style={{
                  background: question.playerColor || "var(--neon-blue)",
                }}
              >
                {question.playerAvatar || question.answeredBy.substring(0, 2)}
              </div>
              <div className={styles.playerBadgeName}>
                {question.answeredBy}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.questionMark}>?</div>
      )}
    </div>
  );
};

export default React.memo(QuestionTile);
