import styles from "../gameroom.module.css";
import { useGameState } from "../hooks/useGameState";
import { formatTime } from "../utils";

interface StatsRowProps {
  nameFlash?: boolean;
}

export default function StatsRow({ nameFlash }: StatsRowProps) {
  const { playerCount, isIntermission, timeRemaining, playerScore } =
    useGameState();

  return (
    <div className={styles.statsRow}>
      <div className={styles.statsTile}>
        <h3 className={styles.statsTitle}>Active Players</h3>
        <div className={styles.statsValue}>{playerCount}</div>
      </div>

      <div className={styles.statsTile}>
        <h3 className={styles.statsTitle}>
          {isIntermission ? "Intermission" : "Time Remaining"}
        </h3>
        <div
          className={`${styles.statsValue} ${
            !isIntermission && timeRemaining <= 30 ? styles.timerWarning : ""
          }`}
        >
          {formatTime(timeRemaining)}
        </div>
      </div>

      <div className={styles.statsTile}>
        <h3 className={styles.statsTitle}>Leaderboard</h3>
        <div className={styles.miniLeaderboard}>
          {/* {players.slice(0, 5).map((player, index) => (
            <div
              key={player.id}
              className={`${styles.leaderboardItem} ${
                player.name === "You" && nameFlash ? styles.nameFlash : ""
              }`}
            >
              <div className={styles.playerRank}>{index + 1}</div>
              <div
                className={styles.playerAvatar}
                style={{ background: player.color }}
              >
                {player.avatar}
              </div>
              <div className={styles.playerName}>{player.name}</div>
              <div className={styles.playerScore}>{player.score}</div>
            </div>
          ))} */}
        </div>
      </div>
    </div>
  );
}
