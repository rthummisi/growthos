# GrowthOS

> An AI agent swarm that figures out where your product should exist and helps you deploy it there — with approval-based execution.

GrowthOS is a production-ready, agent-swarm-powered PLG growth engine that:

- Understands your product deeply
- Identifies every channel where it should be distributed
- Decides how it should be positioned in each channel
- Generates all required assets (repos, READMEs, demos, posts, templates)
- Asks you ONLY for approval / modification / rejection
- Executes ONLY after approval
- Tracks outcomes and continuously improves

**Invoked locally as:** `growthos`

---

## What This Is

A fully automated DevRel + PLG distribution engine.

- System does the thinking
- System prepares options
- User approves decisions
- System executes
- System learns

## What This Is NOT

- Not a generic analytics dashboard
- Not a BI tool
- Not a product metrics platform

---

## Architecture — Agent Swarm

GrowthOS is built as a coordinated agent swarm. Each agent has a clear responsibility and communicates through structured outputs.

### Core Agents

| Agent | Responsibility |
|-------|---------------|
| Product Understanding Agent | Ingests product URL, docs, GitHub repo → outputs ICP, PLG wedge, use cases, "why devs share this" |
| Channel Discovery Agent | Maps product to all relevant distribution channels |
| Placement Strategy Agent | Consolidates channel outputs, standardizes structure, adds reasoning |
| Scoring & Ranking Agent | Scores opportunities by virality, effort, audience fit, time-to-value |
| Asset Generation Agent | Generates READMEs, posts, templates, snippets — all copy-paste ready |
| Content Repurposing Engine | 1 core idea → 19 channel-native formats automatically |
| Content Variation Engine | Generates N unique versions per asset to avoid spam detection |
| Approval Orchestration Agent | Packages everything into structured approval queue |
| Execution Agent | Executes ONLY after user approval |
| Feedback & Learning Agent | Ingests metrics, updates scoring model over time |

### Intelligence & Monitoring Agents

| Agent | Responsibility |
|-------|---------------|
| Competitor Intelligence Agent | Maps competitor channel presence, identifies gaps |
| Trend Detection Agent | Monitors HN/Reddit/Twitter for spiking topics → content opportunities |
| "In The Wild" Monitor Agent | Finds GitHub issues, SO questions, Reddit posts your product solves |
| GitHub Ecosystem Targeting Agent | Finds active repos where product fits as dependency/mention |
| Developer Influencer Identifier | Finds devs 1k–50k followers in your problem space |
| Viral Moment Alert System | Detects post spikes, triggers rapid-response content queue |
| Cross-Channel Amplification | When post exceeds threshold, auto-queues amplification on other channels |

### Community & Engagement Agents

| Agent | Responsibility |
|-------|---------------|
| Community Karma Builder | Schedules helpful contributions before self-promotion |
| Engagement Response Agent | Monitors comments, drafts replies for approval |
| Account Warm-Up Module | Credibility-building sequence before promotional posting |
| Anti-Spam / Rate Limiting Layer | Per-channel frequency rules, human-pattern variation |

### Channel Agents (19 dedicated agents)

| # | Channel |
|---|---------|
| 1 | GitHub |
| 2 | Product Hunt |
| 3 | Hacker News |
| 4 | Twitter/X |
| 5 | Reddit |
| 6 | Discord |
| 7 | Slack |
| 8 | Dev.to |
| 9 | Hashnode |
| 10 | LinkedIn |
| 11 | Newsletter Ecosystems (TLDR, Bytes, console.dev) |
| 12 | npm / Package Registries (PyPI, crates.io) |
| 13 | Awesome Lists |
| 14 | Template Platforms (CodeSandbox, StackBlitz, Replit) |
| 15 | Integration Marketplaces (VS Code, JetBrains) |
| 16 | Stack Overflow |
| 17 | IndieHackers |
| 18 | Lobste.rs |
| 19 | Bluesky |

---

## Core Modules

| Module | Description |
|--------|-------------|
| 1 — Product Intake | URL + GitHub + description + brand voice config |
| 2 — Opportunity Engine | Channel list with relevance scores + competitor gap overlay |
| 3 — Placement Generator | Strategy cards per channel with reasoning, effort, virality score |
| 4 — Approval Queue | Approve / modify / reject / defer with asset preview + bulk actions |
| 5 — Execution Workspace | Tasks, owners, artifacts, dependencies, status tracking |
| 6 — Asset Studio | View/edit assets — copy-paste ready, variation switcher |
| 7 — Tracking Dashboard | Per-channel effectiveness, ROI ranker, conversion funnel |
| 8 — Admin Panel | Agents, scheduler, system health |

---

## Approval-First Operating Model

```
1. Research automatically
2. Generate automatically
3. Rank automatically
4. Package automatically
5. WAIT for approval
   → approve / modify / reject / defer
6. Execute only after approval
```

No execution without approval. Ever.

---

## Scheduling

- Promotion runs **daily or twice-daily** per channel
- Configurable cadence per channel
- Content calendar with awareness → consideration → conversion arc
- Launch Sequence Orchestrator for coordinated multi-channel launches

---

## Effectiveness Measurement

Every channel placement has on-demand effectiveness metrics:

- Per-channel engagement (stars, upvotes, impressions, downloads)
- Normalised effectiveness score (0–100)
- Channel ROI ranker (re-ranked by actual signups/activations, not just engagement)
- UTM generation + full conversion tracking
- Full-funnel view: channel → click → signup → activation → retention

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js + TypeScript + Tailwind |
| Backend | Node.js / Next API Routes |
| Database | PostgreSQL |
| Queue | Redis |
| Storage | MinIO (S3-compatible, local) |
| Runtime | Local machine only |
| CLI | `growthos` (globally registered) |

---

## Project Structure

```
growthos/
├── frontend/
├── backend/
├── agents/
│   ├── product_agent/
│   ├── channel_agents/
│   │   ├── github_agent/
│   │   ├── producthunt_agent/
│   │   ├── hn_agent/
│   │   ├── reddit_agent/
│   │   ├── twitter_agent/
│   │   ├── discord_agent/
│   │   ├── slack_agent/
│   │   ├── devto_agent/
│   │   ├── hashnode_agent/
│   │   ├── linkedin_agent/
│   │   ├── newsletter_agent/
│   │   ├── npm_agent/
│   │   ├── awesome_lists_agent/
│   │   ├── template_platforms_agent/
│   │   ├── integration_marketplace_agent/
│   │   ├── stackoverflow_agent/
│   │   ├── indiehackers_agent/
│   │   ├── lobsters_agent/
│   │   └── bluesky_agent/
│   ├── intelligence_agents/
│   │   ├── competitor_agent/
│   │   ├── trend_agent/
│   │   ├── in_the_wild_agent/
│   │   ├── ecosystem_targeting_agent/
│   │   ├── influencer_agent/
│   │   └── viral_alert_agent/
│   ├── placement_agent/
│   ├── scoring_agent/
│   ├── asset_agent/
│   ├── repurposing_agent/
│   ├── variation_agent/
│   ├── approval_agent/
│   ├── execution_agent/
│   ├── engagement_agent/
│   ├── community_agent/
│   └── feedback_agent/
├── shared/
├── infra/
└── docs/
```

---

## Database Models

- users
- organizations
- projects
- products
- channels
- placement_suggestions
- suggestion_versions
- approvals
- execution_tasks
- assets
- performance_metrics
- competitors
- content_calendar
- utm_tracking
- audit_logs

---

## Definition of Done

- [ ] User can input product → system generates 10+ placement ideas across 5+ channels
- [ ] Approval flow works end-to-end
- [ ] Assets are generated and copy-paste ready
- [ ] Execution workspace works
- [ ] GitHub repo generation works via API
- [ ] Tracking and effectiveness measurement works per channel
- [ ] Scheduler runs daily/twice-daily automatically
- [ ] Competitor gap scanner works
- [ ] "In the wild" monitor surfaces real matches
- [ ] UTM tracking connects channel to conversions
- [ ] UI is clean and usable
- [ ] `growthos` CLI works from any terminal directory

---

## Core Principle

> "I gave it my product, and it figured out how to make it spread — then asked me what to approve."

Not: "I had to think through growth strategy myself."
