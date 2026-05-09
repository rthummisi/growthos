# Changelog — GrowthOS

All notable changes to this project are documented here.
Versioning follows [Semantic Versioning](https://semver.org): MAJOR.MINOR.PATCH.

---

## [1.10.0] — 2026-05-08

### Added — Full Claude Prompt Caching
- Enabled prompt caching on all Claude API calls across the agent fleet
- Reduces redundant token spend on repeated context (brand profiles, competitor data)
- New agent files: `base-agent.js`, demo generation, narration, puppeteer capture, video builder

**Why this matters:** At scale, prompt caching cuts inference cost by 60–80% on cache hits. Every brand analysis and approval workflow now benefits.

---

## [1.9.0] — 2026-04

### Added — Short-Form Video Publishing
- Short-form video pipeline wired to publishing flow
- Instagram Reels and YouTube Shorts channel agents
- E2E test: `tests/e2e/short-form-video.spec.ts`

**Why this matters:** Short-form is now the dominant distribution channel. GrowthOS can plan, generate, and publish directly to Reels and Shorts.

---

## [1.8.1] — 2026-04

### Fixed
- Demo brought current with Competitive Effectiveness scoring
- Minor scoring calibration fixes

---

## [1.8.0] — 2026-04

### Added — Competitive Effectiveness Scoring
- Brand Visibility module now scores content against competitive benchmarks
- Competitive effectiveness metric added to the approval card
- Real-time competitor delta visible in the approvals dashboard

**Why this matters:** Brand teams can see not just their own visibility score but how it compares to direct competitors before approving any piece of content.

---

## [1.7.0] — 2026-03

### Improved — Brand Visibility Hardening
- Caching layer on brand visibility pipeline
- Fair Share of Voice (SOV) calculation
- Sentiment negation handling (no longer counts negative coverage as positive visibility)
- Trend integration and shared type system

---

## [1.4.3] — 2026-02

### Initial Tagged Release
- Full-stack growth operating system
- Brand visibility scoring, approval workflows
- Agent orchestration layer
- Frontend dashboard with React + TypeScript
