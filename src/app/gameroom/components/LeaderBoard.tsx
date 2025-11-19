"use client";

import { useGameState } from "../hooks/useGameState";
import { Accolade } from "../types/state";
import styles from "./leaderboard.module.css";

// Map accolade types to emoji icons
const ACCOLADE_ICONS: Record<string, string> = {
  speed_demon: "⚡",
  first_blood: "🎯",
  sharpshooter: "🎯",
  perfectionist: "💯",
  machine_gun: "🔫",
  snapping_spree: "🔥",
  hot_streak: "🔥",
  clutch_player: "⏱️",
};

export default function Leaderboard() {
  const { scores, accolades } = useGameState();

  // Helper to get accolades for a specific player
  const getPlayerAccolades = (playerId: string): Accolade[] => {
    return accolades.filter((acc) => acc.player_id === playerId);
  };

  return (
    <div className={styles.leaderboardContainer}>
      <h2 className={styles.title}>Leaderboard</h2>
      <div className={styles.entriesContainer}>
        {scores.map((entry, index) => {
          const playerAccolades = getPlayerAccolades(entry.player_id);

          return (
            <div
              key={entry.player_id}
              className={styles.entry}
              data-rank={index + 1}
            >
              <div className={styles.rank}>#{index + 1}</div>
              <div className={styles.info}>
                <div className={styles.usernameRow}>
                  <span className={styles.username}>{entry.display_name}</span>
                  <span className={styles.score}>
                    {entry.score.toLocaleString()} pts
                  </span>
                </div>
                {playerAccolades.length > 0 && (
                  <div className={styles.accoladesRow}>
                    {playerAccolades.map((accolade, idx) => (
                      <span
                        key={idx}
                        className={styles.accoladeBadge}
                        title={accolade.description}
                      >
                        <span className={styles.accoladeIcon}>
                          {ACCOLADE_ICONS[accolade.accolade_type] || "🏆"}
                        </span>
                        <span className={styles.accoladeTitle}>
                          {accolade.title}
                        </span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
