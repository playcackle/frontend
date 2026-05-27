import type { PlayerPlaystyleProfile } from "@/lib/api/players";

export const EMPTY_PLAYSTYLE_PROFILE: PlayerPlaystyleProfile = {
  archetype: "Unclassified Menace",
  summary: "Play more games so Bot Bob can diagnose you.",
  dimensions: [
    {
      key: "quickdraw",
      label: "Quickdraw",
      raw: 0,
      normalized: 0,
      description: "Fast first strikes, early claims, and rapid snap chains.",
    },
    {
      key: "deadeye",
      label: "Deadeye",
      raw: 0,
      normalized: 0,
      description: "Clean conversions, accurate typing, and fewer wasted shots.",
    },
    {
      key: "board_pressure",
      label: "Board Pressure",
      raw: 0,
      normalized: 0,
      description: "Volume, streaks, scoring, and hostile board takeover behavior.",
    },
    {
      key: "ice_blood",
      label: "Ice Blood",
      raw: 0,
      normalized: 0,
      description: "Late-round composure, rare clutch claims, and recovering your own fumbles.",
    },
    {
      key: "gremlin_energy",
      label: "Gremlin Energy",
      raw: 0,
      normalized: 0,
      description: "Snipes, hints, near-misses, donuts, and other legally fascinating incidents.",
    },
  ],
  top_traits: [],
  total_accolades: 0,
};
