"use client"
import styles from "./synthwave-background.module.css"

export default function SynthwaveBackground() {
  return (
    <div className={styles.synthwaveContainer}>
      <div className={styles.sky}></div>
      <div className={styles.stars}></div>
      <div className={styles.sun}></div>
      <div className={styles.grid}></div>
    </div>
  )
}
