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
        <h3 className={styles.statsTitle}>Active Players</h3>
        <div className={styles.statsValue}>{playerCount}</div>
      </div>

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
      </div>

      <div className={styles.statsTile}>
        <h3 className={styles.statsTitle}>Leaderboard</h3>
        <div className={styles.miniLeaderboard}>
          {scores.slice(0, 5).map((player, index) => (
            <div
              key={player.player_id}
              className={`${styles.leaderboardItem} ${
                player.display_name === "You" && nameFlash
                  ? styles.nameFlash
                  : ""
              }`}
            >
              <div className={styles.playerRank}>{index + 1}</div>

              <div className={styles.playerName}>{player.display_name}</div>
              <div className={styles.scores}>{player.score}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
