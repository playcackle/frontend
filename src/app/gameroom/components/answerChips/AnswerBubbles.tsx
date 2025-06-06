"use client";

import { useEffect } from "react";
import styles from "./answerChip.module.css";

export type BubbleAnswer = {
  id: string;
  text: string;
};

interface AnswerBubblesProps {
  bubbles: BubbleAnswer[];
  onBubbleComplete: (id: string) => void;
}

export default function AnswerBubbles({
  bubbles,
  onBubbleComplete,
}: AnswerBubblesProps) {
  useEffect(() => {
    // Set up timers to remove bubbles after animation completes
    bubbles.forEach((bubble) => {
      const timer = setTimeout(() => {
        onBubbleComplete(bubble.id);
      }, 1500); // Changed from 2500 to 1500ms (1.5 seconds total animation time)

      return () => clearTimeout(timer);
    });
  }, [bubbles, onBubbleComplete]);

  return (
    <div className={styles.bubblesContainer}>
      {bubbles.map((bubble, index) => (
        <div
          key={bubble.id}
          className={styles.answerBubble}
          style={{
            left: "20px", // Fixed position from left side
            animationDelay: `${index * 0.2}s`, // Stagger bubbles if multiple
          }}
        >
          <div className={styles.bubbleContent}>
            <div className={styles.bubbleText}>{bubble.text}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
