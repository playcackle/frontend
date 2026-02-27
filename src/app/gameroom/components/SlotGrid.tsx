"use client";

import { useAtomValue } from "jotai";
import React, { useState } from "react";
import styles from "../gameroom.module.css";
import { slotsAtom } from "../store/gameAtoms";
import { Slot } from "../types/state";
import AnswerGrid from "./AnswerGrid";
import SlotTile from "./SlotTile";

function SlotGrid() {
  const slots = useAtomValue(slotsAtom);
  const [isChipView, setIsChipView] = useState(false);

  return (
    <div className={styles.slotGridWrapper}>
      {/* Toggle button */}
      <div className={styles.slotGridToggleRow}>
        <button
          className={`${styles.viewToggleBtn} ${!isChipView ? styles.viewToggleBtnActive : ""}`}
          onClick={() => setIsChipView(false)}
          aria-pressed={!isChipView}
          title="Tile view"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <rect x="1" y="1" width="6" height="6" rx="1" />
            <rect x="9" y="1" width="6" height="6" rx="1" />
            <rect x="1" y="9" width="6" height="6" rx="1" />
            <rect x="9" y="9" width="6" height="6" rx="1" />
          </svg>
          Tiles
        </button>
        <button
          className={`${styles.viewToggleBtn} ${isChipView ? styles.viewToggleBtnActive : ""}`}
          onClick={() => setIsChipView(true)}
          aria-pressed={isChipView}
          title="List view"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <circle cx="8" cy="4" r="6" />
            <rect x="1" y="10" width="14" height="2" rx="1" />
            <rect x="1" y="13.5" width="10" height="2" rx="1" />
          </svg>
          Progress
        </button>
      </div>

      {isChipView ? (
        <AnswerGrid />
      ) : (
        <div className={styles.slotGrid}>
          {slots.map((slot: Slot, i: number) => (
            <SlotTile
              key={slot.id || i}
              slot={slot}
              entranceDelay={`${i * 80}ms`}
              revealDelay={i * 100 - (i > 0 ? 88 : 0)}
              className=""
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default React.memo(SlotGrid);
