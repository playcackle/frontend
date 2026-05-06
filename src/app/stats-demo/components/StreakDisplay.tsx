"use client";

import { useState, useEffect } from "react";
import styles from "./StreakDisplay.module.css";

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
  lastPlayedDate: string;
  weeklyActivity: boolean[]; // 7 days, true if played
}

export function StreakDisplay({ currentStreak, longestStreak, lastPlayedDate, weeklyActivity }: StreakDisplayProps) {
  const [showCelebration, setShowCelebration] = useState(false);
  const [animatedStreak, setAnimatedStreak] = useState(0);

  useEffect(() => {
    // Animate the streak counter
    const duration = 1200;
    const steps = 30;
    const increment = currentStreak / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= currentStreak) {
        setAnimatedStreak(currentStreak);
        clearInterval(timer);
        // Trigger celebration for streaks >= 3
        if (currentStreak >= 3) {
          setShowCelebration(true);
          setTimeout(() => setShowCelebration(false), 2000);
        }
      } else {
        setAnimatedStreak(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [currentStreak]);

  const dayNames = ["M", "T", "W", "T", "F", "S", "S"];
  const streakLevel = currentStreak >= 30 ? "legendary" : currentStreak >= 14 ? "epic" : currentStreak >= 7 ? "rare" : "common";

  return (
    <div className={styles.container}>
      {/* Celebration particles */}
      {showCelebration && (
        <div className={styles.celebration}>
          {[...Array(20)].map((_, i) => (
            <div key={i} className={styles.particle} style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 0.5}s`,
              backgroundColor: ['#0ff', '#ff00aa', '#ff6600', '#00ff88'][i % 4]
            }} />
          ))}
        </div>
      )}

      <div className={styles.header}>
        <div className={styles.fireIcon} data-level={streakLevel}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 23c-3.866 0-7-3.134-7-7 0-2.577 1.409-4.835 3.5-6.036V9c0-2.21 1.79-4 4-4h-1c0-2.21 1.79-4 4-4v1c0 2.21-1.79 4-4 4h1c2.21 0 4 1.79 4 4v.964C18.591 12.165 20 14.423 20 17c0 3.866-3.134 7-7 7z"/>
          </svg>
        </div>
        <div className={styles.streakInfo}>
          <span className={styles.streakLabel}>Current Streak</span>
          <div className={styles.streakValue} data-level={streakLevel}>
            {animatedStreak}
            <span className={styles.streakUnit}>days</span>
          </div>
        </div>
      </div>

      {/* Weekly activity */}
      <div className={styles.weeklyActivity}>
        <span className={styles.weeklyLabel}>This Week</span>
        <div className={styles.dayGrid}>
          {weeklyActivity.map((played, i) => (
            <div key={i} className={styles.dayItem}>
              <div 
                className={`${styles.dayCircle} ${played ? styles.dayActive : ""}`}
                data-level={played ? streakLevel : "none"}
              >
                {played && (
                  <svg viewBox="0 0 24 24" fill="currentColor" className={styles.checkIcon}>
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                  </svg>
                )}
              </div>
              <span className={styles.dayName}>{dayNames[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className={styles.statsRow}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Longest Streak</span>
          <span className={styles.statValue}>{longestStreak} days</span>
        </div>
        <div className={styles.divider} />
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Last Played</span>
          <span className={styles.statValue}>{lastPlayedDate}</span>
        </div>
      </div>

      {/* Streak milestones */}
      <div className={styles.milestones}>
        <span className={styles.milestoneLabel}>Milestones</span>
        <div className={styles.milestoneTrack}>
          <div 
            className={styles.milestoneFill} 
            style={{ width: `${Math.min((currentStreak / 30) * 100, 100)}%` }}
          />
          <div className={`${styles.milestone} ${currentStreak >= 3 ? styles.reached : ""}`} style={{ left: "10%" }}>
            <span>3</span>
          </div>
          <div className={`${styles.milestone} ${currentStreak >= 7 ? styles.reached : ""}`} style={{ left: "23%" }}>
            <span>7</span>
          </div>
          <div className={`${styles.milestone} ${currentStreak >= 14 ? styles.reached : ""}`} style={{ left: "47%" }}>
            <span>14</span>
          </div>
          <div className={`${styles.milestone} ${currentStreak >= 30 ? styles.reached : ""}`} style={{ left: "100%" }}>
            <span>30</span>
          </div>
        </div>
      </div>

      {/* Motivational message */}
      <div className={styles.motivation}>
        {currentStreak === 0 && "Start your streak today!"}
        {currentStreak >= 1 && currentStreak < 3 && "Great start! Keep it going!"}
        {currentStreak >= 3 && currentStreak < 7 && "You&apos;re on fire! Aim for 7 days!"}
        {currentStreak >= 7 && currentStreak < 14 && "A whole week! Incredible dedication!"}
        {currentStreak >= 14 && currentStreak < 30 && "Two weeks strong! Legend status awaits!"}
        {currentStreak >= 30 && "LEGENDARY! You&apos;re unstoppable!"}
      </div>
    </div>
  );
}
