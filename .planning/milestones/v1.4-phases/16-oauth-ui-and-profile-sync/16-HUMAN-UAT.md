---
status: partial
phase: 16-oauth-ui-and-profile-sync
source: [16-VERIFICATION.md]
started: 2026-03-30T12:00:00Z
updated: 2026-03-30T12:00:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. Discord OAuth flow on /login
expected: Click Discord button, redirects to Discord auth, then back to `/` authenticated
result: [pending]

### 2. Discord OAuth flow on /register (new user)
expected: Display name and avatar pre-populated from Discord on first sign-in
result: [pending]

### 3. Disabled Google button visual state
expected: Greyed-out appearance, `not-allowed` cursor, no hover animation, no action on click
result: [pending]

### 4. Profile avatar rendering for OAuth user
expected: Circular Discord avatar from CDN with neon border on /profile
result: [pending]

### 5. Profile initials fallback for email/password user
expected: First-letter fallback on /profile, no broken image
result: [pending]

## Summary

total: 5
passed: 0
issues: 0
pending: 5
skipped: 0
blocked: 0

## Gaps
