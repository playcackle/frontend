# Requirements: Quiz Game Frontend

**Defined:** 2026-02-25
**Core Value:** Players must always know where they are in the game and what their actions mean — reliable state, readable feedback, and visible progress are what keep them coming back.

## v1 Requirements

### State Sync

- [ ] **STATE-01**: Client automatically re-syncs to current game state when round transitions to intermission — no manual rejoin required
- [ ] **STATE-02**: If game state is lost or stale during a transition, a loading/reconnecting indicator is shown (never display stale state silently)
- [ ] **STATE-03**: Client can recover to the correct game phase (intermission, lobby, round) after any WebSocket reconnection

### Onboarding

- [ ] **ONBRD-01**: New users see a multi-step walkthrough modal on first visit
- [ ] **ONBRD-02**: Walkthrough includes screenshots of actual gameplay at each step
- [ ] **ONBRD-03**: Walkthrough explains core mechanics: how to answer, how Bot Bob hints work, how scoring works
- [ ] **ONBRD-04**: User can skip the walkthrough at any step
- [ ] **ONBRD-05**: Walkthrough is not shown again after it has been completed or skipped

### Landing Page

- [ ] **LAND-01**: Authenticated user sees a player card with their Progresjonsscore on the landing page
- [ ] **LAND-02**: Player card shows high scores for daily, weekly, monthly, and yearly timeframes
- [ ] **LAND-03**: Landing page includes a playstyle dashboard showing player percentile per category
- [ ] **LAND-04**: Landing page includes a global leaderboard
- [ ] **LAND-05**: Existing lobby browser remains on the landing page

### Chat UX

- [ ] **CHAT-01**: Correct answer submissions are visually distinguished in the unified chat feed (distinct color or animation)
- [ ] **CHAT-02**: Bot Bob hint messages are visually distinguished in the unified chat feed
- [ ] **CHAT-03**: Duplicate answer attempts (answer already submitted/correct) are visually distinguished from regular attempts

## v2 Requirements

### Notifications

- **NOTF-01**: User receives notification when their rank changes during intermission
- **NOTF-02**: User can configure which game events trigger visual alerts

### Social

- **SOCL-01**: Player can view another player's profile/stats from the leaderboard
- **SOCL-02**: Friends list and friend comparison on Progresjonsscore

## Out of Scope

| Feature | Reason |
|---------|--------|
| Backend game logic changes | Game server is external — frontend only |
| Mobile native app | Web-first; mobile later |
| New game modes | Out of scope for this milestone |
| Leaderboard filtering by friends | v2 — social features deferred |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| STATE-01 | — | Pending |
| STATE-02 | — | Pending |
| STATE-03 | — | Pending |
| ONBRD-01 | — | Pending |
| ONBRD-02 | — | Pending |
| ONBRD-03 | — | Pending |
| ONBRD-04 | — | Pending |
| ONBRD-05 | — | Pending |
| LAND-01 | — | Pending |
| LAND-02 | — | Pending |
| LAND-03 | — | Pending |
| LAND-04 | — | Pending |
| LAND-05 | — | Pending |
| CHAT-01 | — | Pending |
| CHAT-02 | — | Pending |
| CHAT-03 | — | Pending |

**Coverage:**
- v1 requirements: 16 total
- Mapped to phases: 0
- Unmapped: 16 ⚠️

---
*Requirements defined: 2026-02-25*
*Last updated: 2026-02-25 after initial definition*
