import { useAtomValue } from "jotai";
import React, { useEffect, useRef, useState } from "react";
import { roundPromptAtom } from "../store/gameAtoms";
import { Slot } from "../types/state";
import styles from "./HintGrid.module.css";

interface HintGridProps {
  slots: Slot[];
}

export const HintGrid: React.FC<HintGridProps> = ({ slots }) => {
  const roundPrompt = useAtomValue(roundPromptAtom);
  const totalAnswers = slots.length;
  const snappedMap = new Map(
    slots.filter((s) => s.is_snapped).map((s) => [s.id, s]),
  );
  const foundCount = snappedMap.size;
  const remaining = totalAnswers - foundCount;

  const snappedOrderRef = useRef<string[]>(
    slots.filter((s) => s.is_snapped).map((s) => s.id),
  );
  const [newlyFound, setNewlyFound] = useState<Set<string>>(new Set());
  const [snappedOrder, setSnappedOrder] = useState<string[]>(
    () => snappedOrderRef.current,
  );

  useEffect(() => {
    const existing = new Set(snappedOrderRef.current);
    const newIds = slots
      .filter((s) => s.is_snapped && !existing.has(s.id))
      .map((s) => s.id);

    if (newIds.length === 0) return;

    const updated = [...snappedOrderRef.current, ...newIds];
    snappedOrderRef.current = updated;
    setSnappedOrder(updated);
    setNewlyFound(new Set(newIds));
    const t = setTimeout(() => setNewlyFound(new Set()), 800);
    return () => clearTimeout(t);
  }, [slots]);

  const snappedSlotIds = new Set(
    slots.filter((s) => s.is_snapped && s.id).map((s) => String(s.id)),
  );

  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const fillPct = totalAnswers > 0 ? foundCount / totalAnswers : 0;
  const strokeDash = circumference * fillPct;

  return (
    <div className={styles.hintGridContainer}>
      {/* Hero: progress ring + status text */}
      <div className={styles.hintGridHero}>
        <div className={styles.progressRingWrapper}>
          <svg className={styles.progressRingSvg} viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="7"
            />
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="var(--neon-pink)"
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - strokeDash}
              className={styles.progressRingFill}
            />
          </svg>
          <div className={styles.progressRingLabel}>
            <span className={styles.progressRingCount}>{foundCount}</span>
            <span className={styles.progressRingTotal}>/ {totalAnswers}</span>
          </div>
        </div>

        <div className={styles.hintGridStatus}>
          <p className={styles.hintGridStatusTitle}>{roundPrompt}</p>
          <p className={styles.hintGridStatusSub}>
            {remaining > 0
              ? `${remaining} of ${totalAnswers} still to find — keep typing!`
              : "Amazing round, you got them all!"}
          </p>

          {/* Mini dot indicators per slot */}
          <div className={styles.hintDotRow}>
            {slots.map((slot) => {
              const dotState = slot.is_snapped ? "found" : "empty";
              const isEmptyRare = !slot.is_snapped && slot.is_rare;
              return (
                <div
                  key={slot.id}
                  className={`${styles.hintDot} ${styles[`hintDot_${dotState}`]} ${slot.is_rare && slot.is_snapped ? styles.hintDotBonus : ""} ${isEmptyRare ? styles.hintDotEmptyRare : ""}`}
                >
                  {isEmptyRare && <span className={styles.hintDot2x}>2x</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Found answer chips */}
      {foundCount > 0 && (
        <div className={styles.foundChipGrid}>
          {snappedOrder.flatMap((id) => {
            const slot = snappedMap.get(id);
            if (!slot) return [];
            const isNew = newlyFound.has(slot.id);
            return [
              <div
                key={slot.id}
                className={`${styles.foundChip} ${slot.is_rare ? styles.foundChipBonus : ""} ${isNew ? styles.foundChipNew : ""}`}
              >
                <div className={styles.foundChipContent}>
                  <span className={styles.foundChipText}>
                    {slot.canonical_text}
                  </span>
                  {slot.snapped_by_display_name && (
                    <span className={styles.foundChipPlayer}>
                      {slot.snapped_by_display_name}
                    </span>
                  )}
                </div>
                {slot.is_rare && (
                  <span className={styles.foundChipMultiplier}>2x</span>
                )}
              </div>,
            ];
          })}
        </div>
      )}

      {/* Placeholder when nothing found */}
      {foundCount === 0 && (
        <div className={styles.hintGridPlaceholder}>
          <p>
            Type answers in the chat to fill this up. There are{" "}
            <strong>{totalAnswers}</strong> answers to find. PSSSSST! Hints may
            appear below....
          </p>
        </div>
      )}

      {/* Hints section — only shows unsnapped slots that have a text_preview */}
      {(() => {
        const hintSlots = slots.filter(
          (s) =>
            !s.is_snapped && s.text_preview && s.text_preview.trim() !== "",
        );
        if (hintSlots.length === 0) return null;
        return (
          <div className={styles.hintsSection}>
            <div className={styles.hintsGrid}>
              {hintSlots.map((slot) => (
                <div key={slot.id} className={styles.hintChip}>
                  <span className={styles.hintChipText}>
                    {slot.text_preview}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default React.memo(HintGrid);
