import React from "react";
import styles from "./countdown.module.css";

interface CountdownOverlayProps {
  show: boolean;
  value: number;
  topicName?: string | null;
  topicPrompt?: string | null;
}

const CountdownOverlay: React.FC<CountdownOverlayProps> = ({ show, value, topicName, topicPrompt }) => {
  if (!show) return null;

  const displayValue = Math.max(0, Math.ceil(value));

  return (
    <div className={styles.countdownOverlay}>
      <div className={styles.countdownContainer}>
        {topicName && (
          <div className={styles.topicSection}>
            <div className={styles.topicLabel}>NEXT TOPIC</div>
            <div className={styles.topicName}>{topicName}</div>
            {topicPrompt && <div className={styles.topicPrompt}>{topicPrompt}</div>}
          </div>
        )}
        <div className={styles.countdownValue}>{displayValue}</div>
        <div className={styles.countdownText}>SECONDS REMAINING</div>
      </div>
    </div>
  );
};

export default React.memo(CountdownOverlay);
