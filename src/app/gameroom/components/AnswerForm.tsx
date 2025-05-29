"use client";

import { Button } from "@radix-ui/themes";
import React from "react";
import styles from "../gameroom.module.css";
import { useAnswer, useGameState } from "../hooks/useGameState";

interface AnswerFormProps {
  onSubmit: (e: React.FormEvent) => void;
}

export default function AnswerForm({ onSubmit }: AnswerFormProps) {
  const { answer, setAnswer } = useAnswer();
  const { timeRemaining, isIntermission } = useGameState();

  const timeExpired = timeRemaining === 0;
  const isDisabled = timeExpired || isIntermission;

  return (
    <form className={styles.answerForm} onSubmit={onSubmit}>
      <input
        type="text"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        className={styles.answerInput}
        disabled={timeExpired || isIntermission}
      />
      <Button
        type="submit"
        className={styles.answerButton}
        disabled={isDisabled || !answer.trim()}
      >
        Submit
      </Button>
    </form>
  );
}
