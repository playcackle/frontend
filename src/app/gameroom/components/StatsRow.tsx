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

  useEffect(() => {
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
          <div className={styles.statsMetaRow}>
            <h3 className={styles.statsTitle}>Looking for:</h3>
            {roundExample && (
              <span className={styles.statsMetaAccent}>
                <span className={styles.statsMetaAccentLabel}>e.g.</span>
                <span className={styles.statsMetaAccentValue}>
                  {roundExample}
                </span>
              </span>
            )}
          </div>
          <div className={styles.statsCategory}>{roundName}</div>
        </StatsTileWithTooltip>
      )}
      <StatsTileWithTooltip
        tooltip={
          isRoundBreak
            ? `Take a breather. The next round starts shortly. Round ${roundNumber} of ${totalRounds}.`
            : `Time left in this round. Type faster. Round ${roundNumber} of ${totalRounds}.`
        }
      >
        <div className={styles.statsMetaRow}>
          <h3 className={styles.statsTitle}>
            {isRoundBreak ? "Intermission" : timeText}
          </h3>
          <span className={styles.statsMetaAccent}>
            <span className={styles.statsMetaAccentLabel}>Round</span>
            <span className={styles.statsMetaAccentValue}>
              {roundNumber} / {totalRounds}
            </span>
          </span>
        </div>
        <div
          className={`${styles.statsValue} ${
            !isRoundBreak && timeRemaining <= 30 ? styles.timerWarning : ""
          }`}
        >
          {formatTime(timeRemaining)}
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
