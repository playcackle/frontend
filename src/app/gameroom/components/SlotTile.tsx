"use client";

import React, { useMemo } from "react";
import styles from "../gameroom.module.css";
import { useAnimationState } from "../hooks/useGameState";
import type { Slot } from "../types";

interface SlotTileProps {
  slot: Slot;
  isBonus?: boolean;
  revealDelay: number;
  entranceDelay: number;
  isTimeUp: boolean; // Passed from parent instead of calculating internally
}

const SlotTile: React.FC<SlotTileProps> = ({
  slot,
  revealDelay = 0,
  entranceDelay = 0,
  isTimeUp = false,
}) => {
  // Only get animation state, not time-dependent state
  const { entranceAnimation, attentionAnimation, animatingTile } =
    useAnimationState();

  // Memoize all calculations based on props
  const displayState = useMemo(() => {
    const shouldShowContent = slot.taken || (isTimeUp && !slot.taken);
    const shouldShowAttention = isTimeUp && !slot.taken;

    return {
      shouldShowContent,
      shouldShowAttention,
      roomColor: slot.taken ? "var(--neon-purple)" : "var(--neon-pink)",
    };
  }, [slot.taken, isTimeUp]);

  const tileClassNames = useMemo(
    () =>
      [
        styles.slotTile,
        slot.is_rare ? styles.bonusTile : "",
        slot.taken ? styles.answered : "",
        slot.slot_id === animatingTile ? styles.correctPulse : "",
        entranceAnimation,
        displayState.shouldShowAttention ? attentionAnimation : "",
      ].join(" "),
    [
      slot.taken,
      slot.is_rare,
      slot.slot_id,
      animatingTile,
      entranceAnimation,
      attentionAnimation,
      displayState.shouldShowAttention,
    ]
  );

  console.log(
    `Entrance animation: ${entranceAnimation} Delay: ${entranceDelay}`
  );

  console.log("slot is snapped: " + slot.taken);
  const content = useMemo(() => {
    if (displayState.shouldShowContent) {
      return (
        <div className={styles.answeredContent}>
          <div className={styles.correctAnswer}>{slot.text_preview}</div>
          {slot.snapped_by_display_name && (
            <div className={styles.playerBadge}>
              <div
                className={styles.playerBadgeAvatar}
                style={{ background: "var(--neon-blue)" }}
              >
                {slot.snapped_by_display_name}
              </div>
              <div className={styles.playerBadgeName}>
                {slot.snapped_by_display_name}
              </div>
            </div>
          )}
        </div>
      );
    }
    return <div className={styles.questionMark}>?</div>;
  }, [
    displayState.shouldShowContent,
    slot.text_preview,
    slot.snapped_by_display_name,
  ]);

  return (
    <div
      id={`slot-${slot.slot_id}`}
      className={tileClassNames}
      style={
        {
          "--animate-delay": revealDelay || entranceDelay,
          "--room-color": displayState.roomColor,
        } as React.CSSProperties
      }
    >
      {content}
    </div>
  );
};

// Optimized memo comparison - only re-render when these specific props change
export default React.memo(SlotTile, (prevProps, nextProps) => {
  return (
    prevProps.slot.slot_id === nextProps.slot.slot_id &&
    prevProps.slot.taken === nextProps.slot.taken &&
    prevProps.slot.text_preview === nextProps.slot.text_preview &&
    prevProps.slot.snapped_by_display_name ===
      nextProps.slot.snapped_by_display_name &&
    prevProps.isTimeUp === nextProps.isTimeUp &&
    prevProps.revealDelay === nextProps.revealDelay &&
    prevProps.entranceDelay === nextProps.entranceDelay
  );
});
