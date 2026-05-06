"use client";

import { useState, useEffect } from "react";
import { Trophy, Gamepad2, Zap, Target, Gem, Medal, BarChart3, Cpu } from "lucide-react";
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
  Icon: React.FC<{ size?: number }>;
  description: string;
};

function buildStatCards(stats: Stats): StatCard[] {
  return [
    {
      label: "Total Score",
      value: stats.total_score.toLocaleString(),
      subValue: `${stats.average_score_per_game.toFixed(0)} avg/game`,
      accent: "pink",
      Icon: Trophy,
      description: "Your all-time accumulated points across all games",
    },
    {
      label: "Games Played",
      value: String(stats.games_played),
      subValue: `${stats.rounds_played} rounds`,
      accent: "blue",
      Icon: Gamepad2,
      description: "Total number of game sessions you've participated in",
    },
    {
      label: "Slots Snapped",
      value: String(stats.total_slots_snapped),
      subValue: `${stats.average_slots_per_game.toFixed(1)} avg/game`,
      accent: "purple",
      Icon: Zap,
      description: "Answers you've claimed before anyone else",
    },
    {
      label: "Accuracy",
      value: stats.overall_accuracy !== null ? `${stats.overall_accuracy.toFixed(1)}%` : "—",
      subValue: stats.near_miss_count !== null ? `${stats.near_miss_count} near misses` : undefined,
      accent: "green",
      Icon: Target,
      description: "Percentage of correct answers out of all attempts",
    },
    {
      label: "Rare Claims",
      value: stats.rare_claims !== null ? String(stats.rare_claims) : "—",
      subValue: "bonus points",
      accent: "pink",
      Icon: Gem,
      description: "Hard-to-find answers worth extra points",
    },
    {
      label: "Avg Rank",
      value: stats.average_claim_rank !== null ? `#${stats.average_claim_rank.toFixed(1)}` : "—",
      subValue: "claim position",
      accent: "blue",
      Icon: Medal,
      description: "How quickly you snap answers compared to others",
    },
  ];
}

export function StatsOverview({ stats }: Props) {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [animatedValues, setAnimatedValues] = useState<string[]>([]);
  const statCards = buildStatCards(stats);

  // Animate values on mount
  useEffect(() => {
    const values = statCards.map(card => card.value);
    setAnimatedValues(values);
  }, []);

  return (
    <div className={styles.container}>
      {/* Corner decorations */}
      <div className={styles.cornerTL} />
      <div className={styles.cornerTR} />
      <div className={styles.cornerBL} />
      <div className={styles.cornerBR} />

      <div className={styles.headerRow}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.titleIcon}><BarChart3 size={20} /></span>
          Quick Stats
        </h2>
        <div className={styles.systemStatus}>
          <Cpu size={14} className={styles.cpuIcon} />
          <span>SYSTEM ONLINE</span>
        </div>
      </div>
      
      <div className={styles.grid}>
        {statCards.map((card, index) => (
          <div
            key={card.label}
            className={`${styles.card} ${styles[`card_${card.accent}`]}`}
            onMouseEnter={() => setHoveredCard(index)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className={styles.cardGlow} />
            <div className={styles.cardIcon}><card.Icon size={24} /></div>
            <div className={styles.cardContent}>
              <div className={`${styles.cardValue} ${styles[`value_${card.accent}`]}`}>
                {animatedValues[index] || card.value}
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

      {/* XP Bar with arcade styling */}
      <div className={styles.levelMeter}>
        <div className={styles.levelHeader}>
          <div className={styles.levelBadge}>
            <span className={styles.levelNumber}>15</span>
            <span className={styles.levelLabelInner}>LVL</span>
          </div>
          <div className={styles.levelInfo}>
            <span className={styles.levelLabel}>Experience Progress</span>
            <span className={styles.levelValue}>2,450 / 3,600 XP</span>
          </div>
          <div className={styles.levelPercent}>68%</div>
        </div>
        <div className={styles.levelTrack}>
          <div 
            className={styles.levelProgress} 
            style={{ width: "68%" }}
          >
            <div className={styles.levelProgressShine} />
          </div>
          <div className={styles.levelMarkers}>
            {[25, 50, 75].map(mark => (
              <div key={mark} className={styles.levelMarker} style={{ left: `${mark}%` }} />
            ))}
          </div>
        </div>
        <div className={styles.levelFooter}>
          <span className={styles.xpNeeded}>1,150 XP to Level 16</span>
          <span className={styles.xpBonus}>+50% XP Boost Active</span>
        </div>
      </div>
    </div>
  );
}
