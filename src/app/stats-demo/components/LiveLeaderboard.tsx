"use client";

import { useState, useEffect, useCallback } from "react";
import styles from "./LiveLeaderboard.module.css";

interface Player {
  id: string;
  name: string;
  score: number;
  avatar: string;
  trend: "up" | "down" | "same";
  isYou?: boolean;
}

interface LiveLeaderboardProps {
  currentPlayerId?: string;
}

const initialPlayers: Player[] = [
  { id: "1", name: "NeonMaster", score: 12450, avatar: "N", trend: "same", isYou: true },
  { id: "2", name: "PixelQueen", score: 14280, avatar: "P", trend: "up" },
  { id: "3", name: "ByteHunter", score: 13920, avatar: "B", trend: "down" },
  { id: "4", name: "CyberPunk99", score: 11750, avatar: "C", trend: "up" },
  { id: "5", name: "GlitchWiz", score: 10890, avatar: "G", trend: "same" },
  { id: "6", name: "DataDancer", score: 10420, avatar: "D", trend: "down" },
  { id: "7", name: "QuantumLeap", score: 9870, avatar: "Q", trend: "up" },
  { id: "8", name: "VectorVibe", score: 9340, avatar: "V", trend: "same" },
  { id: "9", name: "SynthWave", score: 8920, avatar: "S", trend: "down" },
  { id: "10", name: "RetroRacer", score: 8450, avatar: "R", trend: "up" },
];

export function LiveLeaderboard({ currentPlayerId = "1" }: LiveLeaderboardProps) {
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "friends" | "weekly">("all");

  // Simulate live score updates
  const simulateUpdate = useCallback(() => {
    setPlayers(prev => {
      const updated = prev.map(player => {
        // Random score change
        if (Math.random() > 0.7 && !player.isYou) {
          const change = Math.floor(Math.random() * 150) - 30;
          const newScore = Math.max(0, player.score + change);
          return {
            ...player,
            score: newScore,
            trend: change > 50 ? "up" as const : change < -20 ? "down" as const : player.trend
          };
        }
        return player;
      });
      
      // Sort by score
      return [...updated].sort((a, b) => b.score - a.score);
    });
    
    setLastUpdate(new Date().toLocaleTimeString());
  }, []);

  useEffect(() => {
    const interval = setInterval(simulateUpdate, 5000);
    return () => clearInterval(interval);
  }, [simulateUpdate]);

  const getRankBadge = (rank: number) => {
    if (rank === 1) return { emoji: "gold", color: "#ffd700" };
    if (rank === 2) return { emoji: "silver", color: "#c0c0c0" };
    if (rank === 3) return { emoji: "bronze", color: "#cd7f32" };
    return null;
  };

  const yourRank = players.findIndex(p => p.id === currentPlayerId) + 1;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h3 className={styles.title}>
            <span className={styles.liveIndicator} />
            Live Leaderboard
          </h3>
          {lastUpdate && (
            <span className={styles.lastUpdate}>Updated {lastUpdate}</span>
          )}
        </div>
        
        <div className={styles.filters}>
          <button 
            className={`${styles.filterBtn} ${filter === "all" ? styles.active : ""}`}
            onClick={() => setFilter("all")}
          >
            Global
          </button>
          <button 
            className={`${styles.filterBtn} ${filter === "friends" ? styles.active : ""}`}
            onClick={() => setFilter("friends")}
          >
            Friends
          </button>
          <button 
            className={`${styles.filterBtn} ${filter === "weekly" ? styles.active : ""}`}
            onClick={() => setFilter("weekly")}
          >
            Weekly
          </button>
        </div>
      </div>

      {/* Your position highlight */}
      <div className={styles.yourPosition}>
        <span className={styles.yourLabel}>Your Position</span>
        <div className={styles.yourRank}>
          <span className={styles.rankNumber}>#{yourRank}</span>
          <span className={styles.rankTotal}>of {players.length}</span>
        </div>
      </div>

      {/* Leaderboard list */}
      <div className={styles.list}>
        {players.map((player, index) => {
          const rank = index + 1;
          const badge = getRankBadge(rank);
          
          return (
            <div 
              key={player.id}
              className={`${styles.row} ${player.isYou ? styles.isYou : ""}`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Rank */}
              <div className={styles.rank} data-badge={badge?.emoji}>
                {badge ? (
                  <div className={styles.medalBadge} style={{ borderColor: badge.color }}>
                    <span style={{ color: badge.color }}>{rank}</span>
                  </div>
                ) : (
                  <span className={styles.rankText}>{rank}</span>
                )}
              </div>

              {/* Player info */}
              <div className={styles.playerInfo}>
                <div 
                  className={styles.avatar}
                  style={{ 
                    background: player.isYou 
                      ? "linear-gradient(135deg, #0ff, #ff00aa)" 
                      : `linear-gradient(135deg, hsl(${player.id.charCodeAt(0) * 30}, 70%, 50%), hsl(${player.id.charCodeAt(0) * 30 + 30}, 70%, 40%))`
                  }}
                >
                  {player.avatar}
                </div>
                <div className={styles.nameSection}>
                  <span className={styles.playerName}>
                    {player.name}
                    {player.isYou && <span className={styles.youBadge}>You</span>}
                  </span>
                </div>
              </div>

              {/* Trend indicator */}
              <div className={`${styles.trend} ${styles[player.trend]}`}>
                {player.trend === "up" && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 4l-8 8h6v8h4v-8h6z" />
                  </svg>
                )}
                {player.trend === "down" && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 20l8-8h-6V4h-4v8H4z" />
                  </svg>
                )}
                {player.trend === "same" && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4 11h16v2H4z" />
                  </svg>
                )}
              </div>

              {/* Score */}
              <div className={styles.scoreSection}>
                <span className={styles.score}>{player.score.toLocaleString()}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <button className={styles.viewAllBtn}>
          View Full Leaderboard
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
