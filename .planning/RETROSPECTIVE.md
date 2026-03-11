# Retrospective: Quiz Game Frontend

## Milestone: v1.0 — MVP

**Shipped:** 2026-03-11
**Phases:** 4 | **Plans:** 6

### What Was Built

1. State sync reliability: client auto-recovers to correct game phase on round transitions and reconnects via `request_state_sync`/`lobby_state_sync` pattern
2. Chat visual differentiation: correct answers (neon green + CORRECT badge), Bot Bob hints (purple + BOT badge), duplicate attempts (amber + TAKEN badge)
3. New user onboarding: multi-step walkthrough modal with screenshots, skippable, shown only once using persistence
4. Landing page redesign: player card with Progresjonsscore, high scores (daily/weekly/monthly/yearly), playstyle percentile dashboard, global leaderboard

### What Worked

- **Ref-indirection pattern for circular useCallback** worked cleanly with zero rework — minimal invasive change that solved a tricky React patterns problem
- **Extending existing event system** (`lobby_state_sync`) rather than adding new backend events kept scope tight and the fix isolated to frontend
- **CSS Modules class-per-message-type** approach made the Chat UX phase fast (1 plan, 1 commit for all CSS, 1 plan for TypeScript wiring)
- **Outside-GSD completion** for Phases 3 & 4 worked pragmatically — summaries captured the full success criteria with all checkboxes

### What Was Inefficient

- REQUIREMENTS.md checkboxes weren't kept in sync for Phases 3 & 4 (implemented outside GSD) — traceability table showed "Pending" even after completion
- Plans in ROADMAP.md Phase 1 had unchecked checkboxes even after completion — minor but creates ambiguity
- No milestone audit before completing — could have missed integration gaps

### Patterns Established

- `setSocketState((prev) => ...)` functional update pattern for reading state in async Socket.IO callbacks
- `sendEventRef` ref-capture pattern for calling `sendEvent` from stale-closure-prone callbacks
- CSS Modules base + modifier classes (`.messageBadge` + `.messageBadgeBot`, etc.) for variant styling
- `:global(.performance-mode)` CSS guard at CSS layer for animation suppression (no React atom reads needed)

### Key Lessons

- **Check REQUIREMENTS.md checkboxes at each phase completion**, not just at milestone end — avoids the 3/16 mismatch at close
- **Run `/gsd:audit-milestone` before completing** — even if all phases are done, the audit catches integration gaps
- For phases implemented outside GSD, still update ROADMAP.md plan checkboxes and REQUIREMENTS.md at the time of completion

### Cost Observations

- Sessions: ~6 sessions across 14 days
- Phases 1 & 2: Fast execution via GSD (2 min/plan avg) — well-scoped plans
- Phases 3 & 4: Implemented manually outside GSD — no execution time tracked

---

## Cross-Milestone Trends

| Metric | v1.0 |
|--------|------|
| Phases | 4 |
| Plans | 6 |
| Avg plan duration | ~2 min (GSD phases) |
| Timeline | 14 days |
| LOC | ~13,000 TS |
| Outside-GSD phases | 2 (Phases 3, 4) |
