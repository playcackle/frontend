"use client";

import { useEffect, useState } from "react";
import LoadingGrid from "./components/loading-grid";
import styles from "./loading.module.css";

const Progress = () => {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("INITIALIZING");

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.floor(Math.random() * 10) + 1;
      });
    }, 300);

    // Change loading text periodically
    const texts = [
      "INITIALIZING",
      "LOADING DATA",
      "REWINDING TAPE",
      "TUNING FREQUENCY",
      "ADJUSTING TRACKING",
      "SYNCING BEATS",
      "CHARGING FLUX",
      "BOOTING UP",
    ];

    let textIndex = 0;
    const textInterval = setInterval(() => {
      textIndex = (textIndex + 1) % texts.length;
      setLoadingText(texts[textIndex]);
    }, 2500);

    return () => {
      clearInterval(interval);
      clearInterval(textInterval);
    };
  }, []);

  return (
    <div className={styles.loadingContainer}>
      <div className={styles.scanlines}></div>

      <div className={styles.loadingTextContainer}>
        <div className={styles.loadingText}>
          <span className={styles.neonText}>{loadingText}</span>
        </div>

        <div className={styles.progressContainer}>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>
      <LoadingGrid />
    </div>
  );
};

export default Progress;
