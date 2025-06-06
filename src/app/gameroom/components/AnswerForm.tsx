"use client";

import { Button, Flex } from "@radix-ui/themes";
import React from "react";
import styles from "../gameroom.module.css";
import { useAnswer, useGameState } from "../hooks/useGameState";
import AnswerBubbles, { BubbleAnswer } from "./answerChips/AnswerBubbles";
import AnswerChips, { AnswerChip } from "./answerChips/AnswerChips";

interface AnswerFormProps {
  onSubmit: (e: React.FormEvent) => void;
  bubbles: BubbleAnswer[];
  onBubbleComplete: (id: string) => void;
  recentAnswers: AnswerChip[];
}

export default function AnswerForm({
  onSubmit,
  bubbles,
  onBubbleComplete,
  recentAnswers,
}: AnswerFormProps) {
  const { answer, setAnswer } = useAnswer();
  const { timeRemaining, isRoundBreak } = useGameState();

  const timeExpired = timeRemaining === 0;
  const isDisabled = timeExpired || isRoundBreak;

  return (
    <Flex direction="column">
      <AnswerBubbles bubbles={bubbles} onBubbleComplete={onBubbleComplete} />
      <form className={styles.answerForm} onSubmit={onSubmit}>
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className={styles.answerInput}
          disabled={timeExpired || isRoundBreak}
        />
        <Button
          type="submit"
          className={styles.answerButton}
          disabled={isDisabled || !answer.trim()}
        >
          Submit
        </Button>
      </form>
      <AnswerChips answers={recentAnswers} />
    </Flex>
  );
}
