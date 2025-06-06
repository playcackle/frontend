"use client";
import styles from "./answerChip.module.css";

export type AnswerChip = {
  id: string;
  text: string;
};

interface AnswerChipsProps {
  answers: AnswerChip[];
}
export default function AnswerChips({ answers }: AnswerChipsProps) {
  if (answers.length === 0) return null;

  return (
    <div className={styles.answerChipsContainer}>
      <div className={styles.chipsLabel}>Recent Answers:</div>
      <div className={styles.chipsList}>
        {answers.map((answer) => (
          <div key={answer.id} className={styles.answerChip}>
            <span className={styles.chipText}>{answer.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
