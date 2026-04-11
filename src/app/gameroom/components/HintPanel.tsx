"use client";

import { useAtomValue } from "jotai";
import PlayerAvatar from "./PlayerAvatar";
import styles from "./HintPanel.module.css";
import { isRoundBreakAtom, roundHintsAtom, slotsAtom } from "../store/gameAtoms";

export default function HintPanel() {
  const hints = useAtomValue(roundHintsAtom);
  const slots = useAtomValue(slotsAtom);
  const isRoundBreak = useAtomValue(isRoundBreakAtom);

  if (isRoundBreak) return null;

  // Hide hints whose referenced slot has already been answered.
  const snappedCanonicals = new Set(
    slots
      .filter((s) => s.is_snapped && s.canonical_text)
      .map((s) => s.canonical_text.toLowerCase()),
  );
  const visibleHints = hints.filter(
    (h) =>
      !h.canonical_text || !snappedCanonicals.has(h.canonical_text.toLowerCase()),
  );

  return (
    <div className={styles.hintPanel}>
      <div className={styles.hintPanelHeader}>
        <PlayerAvatar playerId="botbob" displayName="BotBob" size="small" />
        <span className={styles.hintPanelTitle}>BOT BOB</span>
      </div>
      <div className={styles.hintList}>
        {visibleHints.length === 0 ? (
          <div className={styles.hintEmpty}>Give it a minute. This is painful to watch.</div>
        ) : (
          visibleHints.map((hint, index) => (
            <div key={index} className={styles.hintItem}>
              {hint.text}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
