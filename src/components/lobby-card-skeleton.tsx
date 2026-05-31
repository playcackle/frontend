import styles from "./lobby-card-skeleton.module.css";

type Props = {
  count?: number;
};

export default function LobbyCardSkeleton({ count = 4 }: Props) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className={styles.skeletonCard}
          style={{ animationDelay: `${index * 110}ms` }}
          aria-hidden="true"
        >
          <div className={styles.scanline} />
          <div className={`${styles.skeletonLine} ${styles.titleLine}`} />
          <div className={`${styles.skeletonLine} ${styles.badgeLine}`} />
          <div className={styles.capacityBlock}>
            <div className={`${styles.skeletonLine} ${styles.capacityText}`} />
            <div className={styles.capacityBar}>
              <div className={styles.capacityFill} />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
