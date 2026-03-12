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

## Milestone: v1.1 — Audit

**Shipped:** 2026-03-12
**Phases:** 1 | **Plans:** 2

### What Was Built

1. Code quality audit (AUDIT-01): 13 findings covering oversized files (`sound-effects.tsx` at 1,448 lines), 3 duplication patterns, 4 naming inconsistencies, 2 dead code items, 2 complexity hotspots
2. Performance audit (AUDIT-02): 15 findings covering 4 components subscribing to full `gameStateAtom` instead of derived selectors, performance mode bypass in effects, 3 bundle concerns, 4 slow render paths
3. Architecture audit (AUDIT-03): 9 findings including Rules of Hooks violation (crash risk), dual performance mode systems with incompatible localStorage keys, Bot Bob detection in 3 places
4. Type safety audit (AUDIT-04): 13 findings covering 2 `@ts-ignore`, 7 `as any`, 1 `as unknown as` (confirmed runtime bug), EventPayloadMap gaps
5. Consolidated `FINDINGS.md` — 41 findings, executive summary, confirmed bugs section, 45-entry priority table for v1.2

### What Worked

- **Audit-only milestone before improvements** — surfaced 2 confirmed bugs that were invisible at the codebase surface level: answer reveal animation that has never worked, and a crash-level React hook order violation
- **Two-plan wave structure** — Wave 1 (quality + performance) produced a draft that Wave 2 (architecture + type safety + consolidation) consumed directly. No rework, clean dependency
- **Findings format with stable IDs** (FINDING-Q##, FINDING-P##, FINDING-A##, FINDING-T##) — enables precise cross-references in v1.2 planning without ambiguity
- **Read-only audit discipline** — auditors modified zero source files; all output went to documentation only, keeping audit findings clean and uncontaminated by fixes

### What Was Inefficient

- ESLint could not run during the audit (binary not in PATH, config format mismatch with ESLint 9.x) — manual lint coverage filled the gap but automated output would have been cleaner
- No `/gsd:audit-milestone` before completing — acceptable for a single-phase audit milestone, but worth noting for future multi-phase milestones

### Patterns Established

- Audit findings indexed with stable IDs per dimension: `FINDING-Q##` (quality), `FINDING-P##` (performance), `FINDING-A##` (architecture), `FINDING-T##` (type safety)
- "Bugs" section in FINDINGS.md surfaces confirmed runtime failures separately from smell/risk — higher visibility for planners
- Cross-referencing bugs across sections (FINDING-T10 = FINDING-P13) rather than duplicating content — priority table de-duplicates correctly

### Key Lessons

- **A clean `tsc` output does not mean type safety** — it means suppressions are in place. Documenting this explicitly in audit tooling output sets the right expectation for future readers.
- **Audit before improve** — the audit revealed that the answer reveal animation has never worked since its introduction. This would not have been caught in a features-first v1.2 sprint.
- **Performance mode bypass should be gated at the constraint level** — the PROJECT.md constraint exists but wasn't enforced during v1.0 feature development. The audit surfaced it; enforcement goes in v1.2.

### Cost Observations

- Sessions: 1 session (single day, 2026-03-12)
- Both plans: ~25 min each via GSD executor agents
- Fully automated — zero manual implementation steps

---

## Cross-Milestone Trends

| Metric | v1.0 | v1.1 |
|--------|------|------|
| Phases | 4 | 1 |
| Plans | 6 | 2 |
| Avg plan duration | ~2 min (GSD phases) | ~25 min |
| Timeline | 14 days | 1 day |
| LOC | ~13,000 TS | ~13,000 TS (audit-only) |
| Outside-GSD phases | 2 (Phases 3, 4) | 0 |
| Confirmed bugs found | 0 | 2 |
