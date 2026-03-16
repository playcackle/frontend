---
phase: 5
slug: codebase-audit
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-12
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual code review + TypeScript compiler |
| **Config file** | tsconfig.json |
| **Quick run command** | `npx tsc --noEmit 2>&1 | head -30` |
| **Full suite command** | `npx tsc --noEmit && npx next build 2>&1 | tail -20` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx tsc --noEmit` to verify no new type errors introduced
- **After every plan wave:** Confirm findings are written to FINDINGS.md with impact/effort ratings
- **Before `/gsd:verify-work`:** FINDINGS.md must exist and cover all 4 dimensions
- **Max feedback latency:** ~30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 5-01-01 | 01 | 1 | AUDIT-01 | manual | `npx tsc --noEmit` | ✅ | ⬜ pending |
| 5-01-02 | 01 | 1 | AUDIT-02 | manual | `npx tsc --noEmit` | ✅ | ⬜ pending |
| 5-01-03 | 01 | 1 | AUDIT-03 | manual | `npx tsc --noEmit` | ✅ | ⬜ pending |
| 5-01-04 | 01 | 1 | AUDIT-04 | manual | `npx tsc --noEmit` | ✅ | ⬜ pending |
| 5-01-05 | 01 | 1 | AUDIT-05 | manual | `npx tsc --noEmit` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements — this is an audit phase with no code changes, so no test stubs are needed.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Code quality findings documented | AUDIT-01 | Requires code reading — no automated smell detector configured | Read FINDINGS.md, verify code quality section covers duplication, complexity, naming, sizing |
| Performance findings documented | AUDIT-02 | Requires architectural understanding | Read FINDINGS.md, verify performance section covers re-renders, bundle, animation |
| Architecture findings documented | AUDIT-03 | Requires architectural understanding | Read FINDINGS.md, verify architecture section covers hook boundaries, state, data flow |
| Type safety findings documented | AUDIT-04 | TypeScript compiler catches some but not semantic issues | Read FINDINGS.md, verify type safety section with specific file:line references |
| Findings prioritized by impact/effort | AUDIT-05 | Judgment call — no automation | Confirm each finding has impact (High/Med/Low) and effort (High/Med/Low) ratings |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or manual instructions
- [x] Sampling continuity: TypeScript compile check after every task
- [x] Wave 0: not needed (audit-only, no new code)
- [x] No watch-mode flags
- [x] Feedback latency < 30s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-03-12
