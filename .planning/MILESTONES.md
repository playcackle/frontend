# Milestones

## v1.0 MVP (Shipped: 2026-03-11)

**Phases completed:** 4 phases, 6 plans
**Timeline:** 2026-02-25 → 2026-03-11 (14 days)
**Codebase:** ~13,000 LOC TypeScript

**Key accomplishments:**
1. Fixed round→intermission state sync: client auto-recovers to correct game phase without manual rejoin
2. Fixed reconnect state recovery: `request_state_sync` emitted on reconnect so client lands in correct phase after network loss
3. Chat message visual differentiation: correct answers (neon green + CORRECT badge), Bot Bob hints (purple + BOT badge), duplicate attempts (amber + TAKEN badge)
4. New user onboarding: multi-step walkthrough modal with screenshots, skippable, persisted so it's never shown twice
5. Landing page redesign: player card with Progresjonsscore, high scores (daily/weekly/monthly/yearly), playstyle percentile dashboard, global leaderboard

**Archive:** `.planning/milestones/v1.0-ROADMAP.md`, `.planning/milestones/v1.0-REQUIREMENTS.md`

---

