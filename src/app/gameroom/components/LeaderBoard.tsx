"use client";

import {
  Award,
  BadgeCheck,
  Crosshair,
  Flame,
  LucideIcon,
  Repeat2,
  Swords,
  Timer,
  TrendingUp,
  Zap,
} from "lucide-react";

import { useGameState } from "../hooks/useGameState";
import { Accolade } from "../types/state";
import styles from "./leaderboard.module.css";

// Map accolade types to dedicated vector icons for a sharper look
const ACCOLADE_ICONS: Record<string, LucideIcon> = {
  speed_demon: Zap,
  first_blood: Swords,
  sharpshooter: Crosshair,
  perfectionist: BadgeCheck,
  machine_gun: Repeat2,
  snapping_spree: Flame,
  hot_streak: TrendingUp,
  clutch_player: Timer,
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
                    {playerAccolades.map((accolade, idx) => {
                      const IconComponent =
                        ACCOLADE_ICONS[accolade.accolade_type] || Award;

                      return (
                        <span
                          key={idx}
                          className={styles.accoladeBadge}
                          title={accolade.description}
                        >
                          <IconComponent
                            aria-hidden="true"
                            className={styles.accoladeIcon}
                          />
                          <span className={styles.accoladeTitle}>
                            {accolade.title}
                          </span>
                        </span>
                      );
                    })}
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
