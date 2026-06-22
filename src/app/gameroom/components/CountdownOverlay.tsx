import React from "react";
import styles from "./countdown.module.css";

interface CountdownOverlayProps {
  show: boolean;
  value: number;
}

const CountdownOverlay: React.FC<CountdownOverlayProps> = ({ show, value }) => {
  if (!show) return null;

  const displayValue = Math.max(0, Math.ceil(value));

  return (
    <div className={styles.countdownOverlay}>
      <div className={styles.countdownContainer}>
        <div className={styles.countdownValue}>{displayValue}</div>
        <div className={styles.countdownText}>SECONDS REMAINING</div>
      </div>
    </div>
  );
};

export default React.memo(CountdownOverlay);
