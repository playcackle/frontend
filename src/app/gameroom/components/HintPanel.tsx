"use client";

import { useAtomValue } from "jotai";
import PlayerAvatar from "./PlayerAvatar";
import styles from "./HintPanel.module.css";
import { isRoundBreakAtom, roundHintsAtom } from "../store/gameAtoms";

export default function HintPanel() {
  const hints = useAtomValue(roundHintsAtom);
  const isRoundBreak = useAtomValue(isRoundBreakAtom);

  if (isRoundBreak) return null;

  return (
    <div className={styles.hintPanel}>
      <div className={styles.hintPanelHeader}>
        <PlayerAvatar playerId="botbob" displayName="BotBob" size="small" />
        <span className={styles.hintPanelTitle}>BOT BOB</span>
      </div>
      <div className={styles.hintList}>
        {hints.length === 0 ? (
          <div className={styles.hintEmpty}>Give it a minute. This is painful to watch.</div>
        ) : (
          hints.map((hint, index) => (
            <div key={index} className={styles.hintItem}>
              {hint.text}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
