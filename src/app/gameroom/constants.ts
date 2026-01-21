import {
  BadgeCheck,
  Crosshair,
  Flame,
  LucideIcon,
  Repeat2,
  Swords,
  Timer,
  TrendingUp,
  Zap,
} from "lucide-react";

// SOUND_EFFECTS
export const SOUND_SUCCESS = [
  "success1",
  "success2",
  "success3",
  "success4",
  "success5",
] as const;
export const SOUND_SNAPPED = [
  "playerSnap1",
  "playerSnap2",
  "playerSnap3",
  "playerSnap4",
  "playerSnap5",
] as const;
export const SOUND_BONUS = [
  "bonus1",
  "bonus2",
  "bonus3",
  "bonus4",
  "bonus5",
] as const;
export const SOUND_ERROR = "error" as const;
export const SOUND_COUNTDOWN = "countdown" as const;
export const SOUND_TIME_UP = "timeUp" as const;
export const SOUND_NEW_ROUND = "timeUp" as const;

export const ATTENTION_ANIMATIONS = [
  "pulse",
  "bounce",
  "shake",
  "wobble",
  "swing",
  "flash",
  "rubberBand",
  "tada",
] as const;

export type AccoladeType = {
  icon: LucideIcon;
  title: string;
  description: string;
  gameOverDescription?: string;
};

export const ACCOLADE_LIST: Record<string, AccoladeType> = {
  speed_demon: {
    icon: Zap,
    title: "Speed Demon",
    description: "Fastest snap of the round",
    gameOverDescription: "Fastest snapper of them all",
  },
  first_blood: {
    icon: Swords,
    title: "First Blood",
    description: "First to snap in the round",
    gameOverDescription: "Insisting an drawing the First Blood!",
  },
  sharpshooter: {
    icon: Crosshair,
    title: "Sharpshooter",
    description: "Best snap accuracy across all rounds",
  },
  perfectionist: {
    icon: BadgeCheck,
    title: "Perfectionist",
    description: "All snaps correct, no wrong guesses",
  },
  machine_gun: {
    icon: Repeat2,
    title: "Machine Gun",
    description: "Most snaps in a short window",
  },
  snapping_spree: {
    icon: Flame,
    title: "Snapping Spree",
    description: "Multiple snaps in quick succession",
  },
  hot_streak: {
    icon: TrendingUp,
    title: "Hot Streak",
    description: "Consistent snapping over time",
  },
  clutch_player: {
    icon: Timer,
    title: "Clutch Player",
    description: "Snapped in the final seconds",
  },
};
