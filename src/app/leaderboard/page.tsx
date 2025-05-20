"use client";

import Header from "@/app/components/header";
import SynthwaveBackground from "@/app/components/synthwave-background";
import { Button } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import pageStyles from "../page.module.css";
import styles from "./leaderboard.module.css";

type LeaderboardEntry = {
  id: number;
  rank?: number;
  username: string;
  score: number;
  quizType: string;
  date: string;
};

export default function LeaderboardPage() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(
    []
  );
  const [sortBy, setSortBy] = useState<"score" | "date">("score");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  useEffect(() => {
    // Mock leaderboard data
    const mockData: LeaderboardEntry[] = [
      {
        id: 1,
        username: "SynthWave84",
        score: 9850,
        quizType: "80s Music",
        date: "2023-10-15",
      },
      {
        id: 2,
        username: "RetroGamer",
        score: 9200,
        quizType: "Retro Movies",
        date: "2023-10-18",
      },
      {
        id: 3,
        username: "NeonRider",
        score: 8750,
        quizType: "80s Music",
        date: "2023-10-12",
      },
      {
        id: 4,
        username: "Arcade_Master",
        score: 8500,
        quizType: "Vintage Tech",
        date: "2023-10-20",
      },
      {
        id: 5,
        username: "VHS_Collector",
        score: 8200,
        quizType: "Retro Movies",
        date: "2023-10-14",
      },
      {
        id: 6,
        username: "WalkmanFan",
        score: 7900,
        quizType: "Vintage Tech",
        date: "2023-10-19",
      },
      {
        id: 7,
        username: "CassetteKid",
        score: 7800,
        quizType: "80s Music",
        date: "2023-10-17",
      },
      {
        id: 8,
        username: "PixelPusher",
        score: 7600,
        quizType: "Pop Culture",
        date: "2023-10-16",
      },
      {
        id: 9,
        username: "BoomBox_Hero",
        score: 7400,
        quizType: "Pop Culture",
        date: "2023-10-13",
      },
      {
        id: 10,
        username: "MallRat1985",
        score: 7200,
        quizType: "Pop Culture",
        date: "2023-10-21",
      },
    ];

    setLeaderboardData(mockData);
  }, []);

  // Filter and sort the leaderboard data
  const filteredData = leaderboardData
    .filter(
      (entry) => activeCategory === "all" || entry.quizType === activeCategory
    )
    .sort((a, b) => {
      if (sortBy === "score") {
        return b.score - a.score;
      } else {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    })
    .map((entry, index) => ({ ...entry, rank: index + 1 }));

  const categories = [
    "all",
    "80s Music",
    "Retro Movies",
    "Vintage Tech",
    "Pop Culture",
  ];

  return (
    <div className={pageStyles.container}>
      <SynthwaveBackground />
      <Header />

      <main className={pageStyles.main}>
        <h1 className={styles.leaderboardTitle}>Leaderboard</h1>

        <div className={styles.leaderboardControls}>
          <div className={styles.categoryFilters}>
            {categories.map((category) => (
              <Button
                key={category}
                className={`${styles.categoryButton} ${
                  activeCategory === category ? styles.active : ""
                }`}
                onClick={() => setActiveCategory(category)}
              >
                {category === "all" ? "All Categories" : category}
              </Button>
            ))}
          </div>

          <div className={styles.sortOptions}>
            <Button
              className={`${styles.sortButton} ${
                sortBy === "score" ? styles.active : ""
              }`}
              onClick={() => setSortBy("score")}
            >
              Sort by Score
            </Button>
            <Button
              className={`${styles.sortButton} ${
                sortBy === "date" ? styles.active : ""
              }`}
              onClick={() => setSortBy("date")}
            >
              Sort by Date
            </Button>
          </div>
        </div>

        <div className={styles.leaderboardTableContainer}>
          <table className={styles.leaderboardTable}>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>Quiz Type</th>
                <th>Score</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((entry) => (
                <tr
                  key={entry.id}
                  className={entry.rank === 1 ? styles.topRank : ""}
                >
                  <td>
                    <span className={styles.rankBadge}>{entry.rank}</span>
                  </td>
                  <td>{entry.username}</td>
                  <td>{entry.quizType}</td>
                  <td className={styles.scoreCell}>
                    {entry.score.toLocaleString()}
                  </td>
                  <td>{new Date(entry.date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      <footer className={pageStyles.footer}>
        <p>© {new Date().getFullYear()} Retro Quiz | All Rights Reserved</p>
      </footer>
    </div>
  );
}
