import { useAtomValue } from "jotai";
import { useSearch } from "@tanstack/react-router";
import React, { useEffect, useState } from "react";
import {
  isRoundBreakAtom,
  roundExampleAtom,
  roundNameAtom,
  roundNumberAtom,
  roundPromptAtom,
  timeRemainingAtom,
  totalRoundsAtom,
} from "../store/gameAtoms";
import { formatTime } from "../utils";
import styles from "./StatsRow.module.css";

interface StatsTileProps {
  tooltip: string;
  children: React.ReactNode;
  wide?: boolean;
}

const StatsTileWithTooltip = ({ tooltip, children, wide }: StatsTileProps) => (
  <div
    className={`${styles.statsTileWrapper} ${wide ? styles.statsTileWrapperWide : ""}`}
  >
    <div className={styles.statsTile}>{children}</div>
    <div className={styles.statsTileTooltip}>{tooltip}</div>
  </div>
);

const StatsRow = React.memo(() => {
  const roundName = useAtomValue(roundNameAtom);
  const roundExample = useAtomValue(roundExampleAtom);
  const roundNumber = useAtomValue(roundNumberAtom);
  const totalRounds = useAtomValue(totalRoundsAtom);
  const roundPrompt = useAtomValue(roundPromptAtom);
  const isRoundBreak = useAtomValue(isRoundBreakAtom);
  const timeRemaining = useAtomValue(timeRemainingAtom);

  const [roundText, setRoundText] = useState("Round number");
  const [timeText, setTimeText] = useState("Time remaining");
  const search = useSearch({ strict: false });
  const queryRoomName = (search as Record<string, string | undefined>).name ?? "";

  const timeRemainingMessages: string[] = [
    "Hurry up.",
    "Don't freeze.",
    "Move it.",
    "Stop thinking.",
    "Try faster.",
    "Panic.",
    "Don't blow it.",
    "Tick-tock! F*uck face.",
    "Figure it out.",
  ];

  const roundMessages: string[] = [
    "Try harder.",
    "Don't mess up.",
    "Prove something.",
    "Impress me… somehow.",
    "Shock me. Please.",
    "Don't flop again.",
    "Keep up.",
    "Don't embarrass yourself.",
    "Let's see you struggle.",
  ];

  useEffect(() => {
    const roundMessage =
      roundMessages[Math.floor(Math.random() * roundMessages.length)];

    setRoundText(roundMessage.replace("X", String(roundNumber)));
    const timeRemaining =
      timeRemainingMessages[
        Math.floor(Math.random() * timeRemainingMessages.length)
      ];
    setTimeText(timeRemaining);
  }, [roundName]);

  return (
    <div className={styles.statsRow}>
      {!isRoundBreak && (
        <StatsTileWithTooltip
          tooltip={
            roundExample
              ? `${roundPrompt || roundName} — e.g. ${roundExample}`
              : roundPrompt || roundName || ""
          }
          wide
        >
          <div className={styles.categoryMeta}>
            <h3 className={styles.statsTitle}>Looking for:</h3>
            {roundExample && (
              <span className={styles.statsExampleInline}>
                <span className={styles.statsExampleLabel}>e.g.</span>
                <span className={styles.statsExampleValue}>{roundExample}</span>
              </span>
            )}
          </div>
          <div className={styles.statsCategory}>{roundName}</div>
        </StatsTileWithTooltip>
      )}
      <StatsTileWithTooltip
        tooltip={
          isRoundBreak
            ? "Take a breather. The next round starts shortly."
            : "Time left in this round. Type faster."
        }
      >
        <h3 className={styles.statsTitle}>
          {isRoundBreak ? "Intermission" : timeText}
        </h3>
        <div
          className={`${styles.statsValue} ${
            !isRoundBreak && timeRemaining <= 30 ? styles.timerWarning : ""
          }`}
        >
          {formatTime(timeRemaining)}
        </div>
      </StatsTileWithTooltip>
      <StatsTileWithTooltip tooltip="Which round you're on out of the total rounds in this game.">
        <h3 className={styles.statsTitle}>{roundText}</h3>
        <div className={styles.statsValue}>
          {roundNumber} / {totalRounds}
        </div>
      </StatsTileWithTooltip>
      <StatsTileWithTooltip tooltip="The name of this game room.">
        <h3 className={styles.statsTitle}>Gameroom:</h3>
        <div className={styles.statsValue}>{queryRoomName}</div>
      </StatsTileWithTooltip>
    </div>
  );
});

export default StatsRow;
