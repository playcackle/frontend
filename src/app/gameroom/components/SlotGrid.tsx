import styles from "../gameroom.module.css";
import { useGameState } from "../hooks/useGameState";
import SlotTile from "./SlotTile";

export default function SlotGrid() {
  const { slots, timeRemaining } = useGameState();

  // Calculate display state once for all tiles
  const isTimeUp = timeRemaining === 0;

  return (
    <div className={styles.slotGrid}>
      {slots.map((slot, i) => (
        <SlotTile
          key={slot.slot_id || i}
          slot={slot}
          entranceDelay={i * 33 + 100}
          revealDelay={i * 33 + 200}
          isTimeUp={isTimeUp}
        />
      ))}
    </div>
  );
}
