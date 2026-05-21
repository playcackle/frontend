
import { useCallback } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { Gamepad2, LogOut } from "lucide-react";
import { playAgainStateAtom, timeRemainingAtom, updatePlayAgainStateAtom } from "../store/gameAtoms";
import { formatTime } from "../utils";
import styles from "./OptInPanel.module.css";

interface OptInPanelProps {
  onPlayAgainResponse?: (wantToPlay: boolean) => void;
  disabled?: boolean;
  currentUserId?: string | null;
}

export default function OptInPanel({ onPlayAgainResponse, disabled = false, currentUserId }: OptInPanelProps) {
  const { confirmedCount, neededToStart, userResponse, playersWaiting, playerResponses } = useAtomValue(playAgainStateAtom);
  const updatePlayAgainState = useSetAtom(updatePlayAgainStateAtom);
  const timeRemaining = useAtomValue(timeRemainingAtom);

  const userStatus = userResponse === "yes" ? "in" : userResponse === "no" ? "out" : "pending";

  const otherResponses = Object.entries(playerResponses).filter(([pid]) => pid !== currentUserId);
  const pendingCount = Math.max(0, playersWaiting - 1 - otherResponses.length);

  const playerCircles = [
    { status: userStatus, displayName: "You" },
    ...otherResponses.map(([, data]) => ({
      status: data.response as "in" | "out" | "pending",
      displayName: data.displayName,
    })),
    ...Array(pendingCount).fill(null).map(() => ({ status: "pending" as const, displayName: "?" })),
  ];

  const progressPercentage = playersWaiting > 0 ? Math.round((confirmedCount / playersWaiting) * 100) : 0;

  const handleResponse = useCallback((wantToPlay: boolean) => {
    updatePlayAgainState({ userResponse: wantToPlay ? "yes" : "no" });
    onPlayAgainResponse?.(wantToPlay);
  }, [onPlayAgainResponse, updatePlayAgainState]);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h2 className={styles.title}>Rematch?</h2>

        <p className={styles.subtitle}>
          Keep the game going with the same crew!
        </p>

        <div className={styles.playerIndicators}>
          {playerCircles.map((player, index) => (
            <div
              key={index}
              className={`${styles.playerCircle} ${
                player.status === "in" ? styles.in :
                player.status === "out" ? styles.out :
                styles.pending
              }`}
              title={player.displayName}
            />
          ))}
        </div>

        <div className={styles.buttonGroup}>
          <button
            className={`${styles.button} ${styles.yesButton} ${userResponse === "yes" ? styles.selected : ""}`}
            onClick={() => handleResponse(true)}
            disabled={disabled || userResponse !== null}
          >
            <Gamepad2 size={24} />
            <span>In</span>
          </button>

          <button
            className={`${styles.button} ${styles.noButton} ${userResponse === "no" ? styles.selected : ""}`}
            onClick={() => handleResponse(false)}
            disabled={disabled || userResponse !== null}
          >
            <LogOut size={24} />
            <span>Out</span>
          </button>
        </div>

        <div className={styles.statusContainer}>
          <p className={styles.optInCount}>
            {confirmedCount} / {playersWaiting} opted in
          </p>

          <p className={styles.playersNeeded}>
            {neededToStart > 0
              ? `${neededToStart} more needed to start`
              : "Ready to play!"}
          </p>

          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {userResponse ? (
            <p className={styles.responseStatus}>
              {userResponse === "yes"
                ? "You're in! Waiting for others..."
                : "See you next time!"}
            </p>
          ) : (
            <p className={styles.timeout}>
              Auto-closing in {formatTime(timeRemaining)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
