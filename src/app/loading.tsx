import LoadingGrid from "@/app/components/loading-grid";
import styles from "./loading.module.css";

export default function Loading() {
  return (
    <div className={styles.loadingContainer}>
      <LoadingGrid />
      <div className={styles.loadingContent}>
        <div className={styles.loadingText}>
          <span className={styles.neonText}>LOADING</span>
        </div>
        <div className={styles.loadingDots}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
}
