"use client";

import styles from "./page.module.css";

export default function GameroomsPage() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>
          <span className={styles.neonText}>GAMEROOMS</span>
          <span className={styles.neonTextPink}>OVERVIEW</span>
        </h1>
        <p className={styles.message}>
          Gameroom management tools will appear here soon. Use the sidebar to
          navigate to existing sections while this dashboard is under
          construction.
        </p>
      </div>
    </div>
  );
}
