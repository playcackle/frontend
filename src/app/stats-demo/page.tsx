"use client";

import { useState } from "react";
import styles from "./page.module.css";
import { StatsOverview } from "./components/StatsOverview";
import { CategoryBreakdown } from "./components/CategoryBreakdown";
import { AchievementShowcase } from "./components/AchievementShowcase";
import { PerformanceRadar } from "./components/PerformanceRadar";
import { ScoreTimeline } from "./components/ScoreTimeline";
import { PlayStyleAnalysis } from "./components/PlayStyleAnalysis";

// Mock data for demonstration
const mockPlayerStats = {
  id: "demo-player",
  name: "NeonMaster",
  total_score: 12450,
  games_played: 47,
  rounds_played: 235,
  total_slots_snapped: 892,
  overall_accuracy: 78.5,
  average_claim_rank: 2.3,
  rare_claims: 23,
  near_miss_count: 45,
  near_miss_rate: 12.4,
  avg_near_miss_similarity: 0.89,
  average_score_per_game: 264.9,
  average_score_per_round: 52.98,
  average_slots_per_game: 18.98,
  average_slots_per_round: 3.8,
};

const mockCategoryStats = [
  { name: "Movies & TV", score: 3420, gamesPlayed: 12, accuracy: 82.3, color: "pink" },
  { name: "Music", score: 2890, gamesPlayed: 10, accuracy: 75.1, color: "blue" },
  { name: "Science", score: 2150, gamesPlayed: 8, accuracy: 71.2, color: "purple" },
  { name: "History", score: 1980, gamesPlayed: 7, accuracy: 68.9, color: "green" },
  { name: "Sports", score: 1210, gamesPlayed: 6, accuracy: 65.4, color: "pink" },
  { name: "Geography", score: 800, gamesPlayed: 4, accuracy: 62.1, color: "blue" },
];

const mockAchievements = [
  { id: 1, title: "Speed Demon", description: "Snapped 5 slots in under 10 seconds", earned: true, rarity: "rare" },
  { id: 2, title: "Perfect Round", description: "Got 100% accuracy in a round", earned: true, rarity: "epic" },
  { id: 3, title: "Rare Hunter", description: "Claimed 10 rare slots", earned: true, rarity: "legendary" },
  { id: 4, title: "Streak Master", description: "Won 5 games in a row", earned: false, rarity: "epic" },
  { id: 5, title: "First Blood", description: "Be the first to snap in a round", earned: true, rarity: "common" },
  { id: 6, title: "Knowledge King", description: "Score 500+ in a single game", earned: true, rarity: "rare" },
];

const mockTimeline = [
  { date: "Apr 1", score: 180 },
  { date: "Apr 5", score: 245 },
  { date: "Apr 8", score: 210 },
  { date: "Apr 12", score: 320 },
  { date: "Apr 15", score: 290 },
  { date: "Apr 20", score: 380 },
  { date: "Apr 25", score: 415 },
  { date: "Apr 30", score: 360 },
  { date: "May 3", score: 450 },
];

export default function StatsDemoPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "categories" | "achievements" | "analysis">("overview");

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          <span className={styles.neonText}>PLAYER</span>
          <span className={styles.neonTextPink}>STATS</span>
        </h1>
        <p className={styles.subtitle}>Interactive Stats Explorer Demo</p>
      </header>

      <nav className={styles.tabNav}>
        <button
          className={`${styles.tab} ${activeTab === "overview" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={`${styles.tab} ${activeTab === "categories" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("categories")}
        >
          Categories
        </button>
        <button
          className={`${styles.tab} ${activeTab === "achievements" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("achievements")}
        >
          Achievements
        </button>
        <button
          className={`${styles.tab} ${activeTab === "analysis" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("analysis")}
        >
          Analysis
        </button>
      </nav>

      <div className={styles.content}>
        {activeTab === "overview" && (
          <div className={styles.overviewGrid}>
            <StatsOverview stats={mockPlayerStats} />
            <ScoreTimeline data={mockTimeline} />
          </div>
        )}

        {activeTab === "categories" && (
          <CategoryBreakdown categories={mockCategoryStats} />
        )}

        {activeTab === "achievements" && (
          <AchievementShowcase achievements={mockAchievements} />
        )}

        {activeTab === "analysis" && (
          <div className={styles.analysisGrid}>
            <PerformanceRadar stats={mockPlayerStats} />
            <PlayStyleAnalysis stats={mockPlayerStats} categories={mockCategoryStats} />
          </div>
        )}
      </div>

      <footer className={styles.footer}>
        <p className={styles.footerNote}>
          This is a demo page exploring fun ways to visualize player statistics
        </p>
      </footer>
    </main>
  );
}
