import { useMemo, useState, useCallback, useRef } from "react";
import { Volume2 } from "lucide-react";
import {
  createSoundGenerators,
  invokeSound,
  SOUND_CATALOG,
  type SoundType,
} from "@/components/sound-effects";
import styles from "./page.module.css";

/**
 * Sound Lab — audition every game sound effect without joining a game.
 * Uses the exact same procedural engine as live play (createSoundGenerators),
 * so what you hear here is what plays in-game. Dev/design tool.
 */
export default function SoundLabPage() {
  // One realtime generator set for the whole page (defaults to realtimeProvider).
  const generators = useMemo(() => createSoundGenerators(), []);
  const [playing, setPlaying] = useState<SoundType | null>(null);
  const clearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const play = useCallback(
    (type: SoundType) => {
      invokeSound(generators, type);
      setPlaying(type);
      if (clearTimer.current) clearTimeout(clearTimer.current);
      clearTimer.current = setTimeout(() => setPlaying(null), 450);
    },
    [generators],
  );

  const playGroup = useCallback(
    (types: SoundType[]) => {
      types.forEach((type, i) => {
        setTimeout(() => play(type), i * 650);
      });
    },
    [play],
  );

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <h1 className={styles.title}>Sound Lab</h1>
        <p className={styles.subtitle}>
          Audition every in-game sound effect. Same engine as live play — click
          a pad to hear how it feels.
        </p>
      </header>

      {SOUND_CATALOG.map((group) => (
        <section key={group.group} className={styles.group}>
          <div className={styles.groupHead}>
            <h2 className={styles.groupTitle}>{group.group}</h2>
            <span className={styles.groupBlurb}>{group.blurb}</span>
            <button
              type="button"
              className={styles.playAll}
              onClick={() => playGroup(group.sounds.map((s) => s.type))}
            >
              ▶ Play all
            </button>
          </div>

          <div className={styles.grid}>
            {group.sounds.map((sound) => (
              <button
                key={sound.type}
                type="button"
                className={`${styles.pad} ${
                  playing === sound.type ? styles.padPlaying : ""
                }`}
                onClick={() => play(sound.type)}
              >
                <Volume2 size={16} className={styles.padIcon} />
                <span className={styles.padLabel}>{sound.label}</span>
                <span className={styles.padType}>{sound.type}</span>
              </button>
            ))}
          </div>
        </section>
      ))}

      <p className={styles.hint}>
        Tip: sounds route through the shared master bus (warmth · compression ·
        reverb), so this is exactly what you'll hear in a match.
      </p>
    </div>
  );
}
