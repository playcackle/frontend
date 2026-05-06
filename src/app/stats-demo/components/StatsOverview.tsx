"use client";

import { useState } from "react";
import styles from "./StatsOverview.module.css";

type Stats = {
  total_score: number;
  games_played: number;
  rounds_played: number;
  total_slots_snapped: number;
  overall_accuracy: number | null;
  average_claim_rank: number | null;
  rare_claims: number | null;
  near_miss_count: number | null;
  average_score_per_game: number;
  average_score_per_round: number;
  average_slots_per_game: number;
  average_slots_per_round: number;
};

type Props = {
  stats: Stats;
};

type StatCard = {
  label: string;
  value: string;
  subValue?: string;
  accent: "blue" | "pink" | "purple" | "green";
  icon: string;
  description: string;
};

function buildStatCards(stats: Stats): StatCard[] {
  return [
    {
      label: "Total Score",
      value: stats.total_score.toLocaleString(),
      subValue: `${stats.average_score_per_game.toFixed(0)} avg/game`,
      accent: "pink",
      icon: "🏆",
      description: "Your all-time accumulated points across all games",
    },
    {
      label: "Games Played",
      value: String(stats.games_played),
      subValue: `${stats.rounds_played} rounds`,
      accent: "blue",
      icon: "🎮",
      description: "Total number of game sessions you've participated in",
    },
    {
      label: "Slots Snapped",
      value: String(stats.total_slots_snapped),
      subValue: `${stats.average_slots_per_game.toFixed(1)} avg/game`,
      accent: "purple",
      icon: "⚡",
      description: "Answers you've claimed before anyone else",
    },
    {
      label: "Accuracy",
      value: stats.overall_accuracy !== null ? `${stats.overall_accuracy.toFixed(1)}%` : "—",
      subValue: stats.near_miss_count !== null ? `${stats.near_miss_count} near misses` : undefined,
      accent: "green",
      icon: "🎯",
      description: "Percentage of correct answers out of all attempts",
    },
    {
      label: "Rare Claims",
      value: stats.rare_claims !== null ? String(stats.rare_claims) : "—",
      subValue: "bonus points",
      accent: "pink",
      icon: "💎",
      description: "Hard-to-find answers worth extra points",
    },
    {
      label: "Avg Rank",
      value: stats.average_claim_rank !== null ? `#${stats.average_claim_rank.toFixed(1)}` : "—",
      subValue: "claim position",
      accent: "blue",
      icon: "🥇",
      description: "How quickly you snap answers compared to others",
    },
  ];
}

export function StatsOverview({ stats }: Props) {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const statCards = buildStatCards(stats);

  return (
    <div className={styles.container}>
      <h2 className={styles.sectionTitle}>
        <span className={styles.titleIcon}>📊</span>
        Quick Stats
      </h2>
      
      <div className={styles.grid}>
        {statCards.map((card, index) => (
          <div
            key={card.label}
            className={`${styles.card} ${styles[`card_${card.accent}`]}`}
            onMouseEnter={() => setHoveredCard(index)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className={styles.cardIcon}>{card.icon}</div>
            <div className={styles.cardContent}>
              <div className={`${styles.cardValue} ${styles[`value_${card.accent}`]}`}>
                {card.value}
              </div>
              <div className={styles.cardLabel}>{card.label}</div>
              {card.subValue && (
                <div className={styles.cardSubValue}>{card.subValue}</div>
              )}
            </div>
            
            {hoveredCard === index && (
              <div className={styles.tooltip}>
                {card.description}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className={styles.levelMeter}>
        <div className={styles.levelHeader}>
          <span className={styles.levelLabel}>Experience Level</span>
          <span className={styles.levelValue}>Level 12</span>
        </div>
        <div className={styles.levelTrack}>
          <div 
            className={styles.levelProgress} 
            style={{ width: "68%" }}
          />
        </div>
        <div className={styles.levelFooter}>
          <span>2,450 XP</span>
          <span>3,600 XP to Level 13</span>
        </div>
      </div>
    </div>
  );
}
