"use client";

import * as Dialog from "@radix-ui/react-dialog";
import confetti from "canvas-confetti";
import { Award } from "lucide-react";
import { VisuallyHidden } from "radix-ui";
import { useCallback, useEffect, useRef, useState } from "react";
import { ACCOLADE_LIST, AccoladeType } from "../constants";
import { PlayerAccolade } from "../types/payloads";
import styles from "./PostGameModal.module.css";

interface PostgameAccoladesProps {
  isOpen: boolean;
  onClose: () => void;
  accolades: PlayerAccolade[];
  onComplete?: () => void;
}

const SLIDE_DURATION = 5000; // 5 seconds per slide
const COLORS = ["gold", "pink", "blue", "green", "purple"];

type TopAccolade = {
  player_id: string;
  display_name: string;
  score: number;
  top_accolade: string;
  top_count: number;
  color: string;
  accolade: AccoladeType;
};

function getTopAccolades(players: PlayerAccolade[]): Array<TopAccolade> {
  return players.map((player) => {
    let topAccolade = "";
    let topCount = 0;

    for (const [accolade, count] of Object.entries(player.accolades_count)) {
      if (count > topCount) {
        topCount = count;
        topAccolade = accolade;
      }
    }

    return {
      player_id: player.player_id,
      display_name: player.display_name,
      score: player.score,
      top_accolade: topAccolade,
      top_count: topCount,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      accolade: ACCOLADE_LIST[topAccolade],
    };
  });
}

export default function PostgameAccolades({
  isOpen,
  onClose,
  accolades,
  onComplete,
}: PostgameAccoladesProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [topAccolades, setTopAccolades] = useState<TopAccolade[]>(
    getTopAccolades(accolades),
  );
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const accoladesRef = useRef<TopAccolade[]>([]);

  const goToNextSlide = useCallback(() => {
    const total = accoladesRef.current.length;
    setCurrentSlide((prev) => {
      if (prev + 1 >= total) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setTimeout(() => {
          onComplete?.();
        }, 1000);
        return prev;
      }
      return prev + 1;
    });
    setIsAnimating(false);
    setTimeout(() => setIsAnimating(true), 50);
  }, [onComplete]);

  const goToPrevSlide = useCallback(() => {
    setCurrentSlide((prev) => {
      if (prev <= 0) return prev;
      return prev - 1;
    });
    setIsAnimating(false);
    setTimeout(() => setIsAnimating(true), 50);
  }, []);

  const fireConfetti = useCallback(() => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 10000,
    };

    const randomInRange = (min: number, max: number) =>
      Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ["#ff0080", "#00ffff", "#ffff00", "#ff00ff", "#00ff00"],
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ["#ff0080", "#00ffff", "#ffff00", "#ff00ff", "#00ff00"],
      });
    }, 250);
  }, []);

  useEffect(() => {
    if (isOpen && accolades.length > 0) {
      const generatedAccolades = getTopAccolades(accolades);
      accoladesRef.current = generatedAccolades;
      setTopAccolades(generatedAccolades);
      setCurrentSlide(0);
      setIsAnimating(true);

      // Fire confetti on open (announcing winner)
      setTimeout(() => {
        fireConfetti();
      }, 500);
    }
  }, [isOpen, accolades, fireConfetti]);

  useEffect(() => {
    if (!isOpen || accoladesRef.current.length === 0) return;

    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      goToNextSlide();
    }, SLIDE_DURATION);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isOpen, goToNextSlide]);
  const currentAccolade = topAccolades[currentSlide];

  const IconComponent = currentAccolade?.accolade?.icon || Award;

  if (!currentAccolade) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={styles.content}>
          <VisuallyHidden.Root>
            <Dialog.Title>Postgame Accolades</Dialog.Title>
            <Dialog.Description>
              Award ceremony showing player achievements from the quiz round
            </Dialog.Description>
          </VisuallyHidden.Root>
          <div className={styles.slideshow}>
            <div className={styles.progressBar}>
              {accolades.map((_, index) => (
                <div
                  key={index}
                  className={`${styles.progressDot} ${index === currentSlide ? styles.activeDot : ""} ${index < currentSlide ? styles.completedDot : ""}`}
                />
              ))}
            </div>

            <div
              className={`${styles.slide} ${isAnimating ? styles.slideIn : ""}`}
            >
              <div
                className={`${styles.iconContainer} ${styles[currentAccolade.color]}`}
              >
                <span className={styles.icon}>
                  <IconComponent />
                </span>
              </div>

              <h2
                className={`${styles.accoladeTitle} ${styles[`title${currentAccolade.color}`]}`}
              >
                {currentAccolade.accolade.title}
              </h2>

              <p className={styles.subtitle}>
                {currentAccolade.accolade.gameOverDescription ||
                  currentAccolade.accolade.description}
              </p>

              <div className={styles.playerCard}>
                <span className={styles.playerName}>
                  {currentAccolade.display_name}
                </span>
                <span className={styles.playerScore}>
                  {currentAccolade.score.toLocaleString()} pts
                </span>
              </div>

              {currentAccolade.top_accolade === "winner" && (
                <div className={styles.winnerGlow} />
              )}
            </div>

            <div className={styles.navigation}>
              <button
                className={styles.navButton}
                onClick={goToPrevSlide}
                disabled={currentSlide === 0}
              >
                PREV
              </button>
              <span className={styles.slideCounter}>
                {currentSlide + 1} / {accolades.length}
              </span>
              <button
                className={styles.navButton}
                onClick={goToNextSlide}
                disabled={currentSlide === accolades.length - 1}
              >
                NEXT
              </button>
            </div>

            <button className={styles.skipButton} onClick={onClose}>
              SKIP THE DRAMA
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
