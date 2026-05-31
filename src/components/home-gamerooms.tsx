import styles from "./home-gamerooms.module.css";
import GameroomTile from "@/components/gameroom-tile";
import LobbyCardSkeleton from "@/components/lobby-card-skeleton";
import type { LobbyInfo } from "@/hooks/useRealtimeLobbies";
import { Link } from "@tanstack/react-router";

type Props = {
  gamerooms: LobbyInfo[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
};

const PREVIEW_COUNT = 4;

export default function HomeGamerooms({ gamerooms, loading = false, error = null, onRetry }: Props) {
  const preview = gamerooms.slice(0, PREVIEW_COUNT);

  if (loading && gamerooms.length === 0) {
    return (
      <div className={styles.gameroomsSection} aria-label="Loading game rooms">
        <div className={styles.gameroomsGrid}>
          <LobbyCardSkeleton count={PREVIEW_COUNT} />
        </div>
      </div>
    );
  }

  if (error && gamerooms.length === 0) {
    return (
      <div className={styles.gameroomsEmpty}>
        <p>Could not load game rooms.</p>
        {onRetry && (
          <button className={styles.retryButton} onClick={onRetry}>
            Retry
          </button>
        )}
      </div>
    );
  }

  if (gamerooms.length === 0) {
    return (
      <div className={styles.gameroomsEmpty}>
        <p>No game rooms available right now. Check back soon!</p>
      </div>
    );
  }

  return (
    <div className={styles.gameroomsSection}>
      <div className={styles.gameroomsGrid}>
        {preview.map((room) => (
          <GameroomTile key={room.lobby_id} gameroom={room} />
        ))}
      </div>

      {gamerooms.length > PREVIEW_COUNT && (
        <div className={styles.gameroomsFooter}>
          <Link to="/gamerooms" className={styles.browseAllBtn}>
            Browse All {gamerooms.length} Rooms
          </Link>
        </div>
      )}
    </div>
  );
}
