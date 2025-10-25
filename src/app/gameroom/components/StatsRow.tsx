import styles from "../gameroom.module.css";
import { useGameState } from "../hooks/useGameState";
import { formatTime } from "../utils";

interface StatsRowProps {
  nameFlash?: boolean;
}

export default function StatsRow({ nameFlash }: StatsRowProps) {
  const { playerCount, isRoundBreak, timeRemaining, scores } = useGameState();

  return (
    <div className={styles.statsRow}>
      <div className={styles.statsTile}>
        <h3 className={styles.statsTitle}>
          {isRoundBreak ? "Intermission" : "Time Remaining"}
        </h3>
        <div
          className={`${styles.statsValue} ${
            !isRoundBreak && timeRemaining <= 30 ? styles.timerWarning : ""
          }`}
        >
          {formatTime(timeRemaining)}
        </div>
        <div className={styles.playersCount}>{playerCount} Players</div>
      </div>
    </div>
  );
}
