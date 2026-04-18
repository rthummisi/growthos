# GrowthOS — Coding Contract

> This document is the complete, self-contained execution contract for a coding agent.  
> It defines every module, its implementation approach, its file location, its interfaces,  
> and its acceptance criteria. Build in the order specified. No placeholders. No stubs.

---

## Ground Rules (non-negotiable)

- No execution without user approval — the execution agent is always approval-gated
- No vague outputs — every agent output is a typed, structured object
- All generated assets are production-quality and copy-paste ready
- No placeholder content anywhere in the system
- Every placement suggestion includes a reasoning field
- Anti-spam rate limiting is enforced on every channel agent
- Brand voice is inherited from a single config and applied by all agents
- TypeScript strict mode everywhere — no `any`, no implicit types

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | Next.js + TypeScript + Tailwind CSS | Next 14, TS 5.x, Tailwind 3.x |
| Backend | Next.js API Routes (Node.js) | Next 14 |
| Database | PostgreSQL | 15+ |
| ORM | Prisma | Latest |
| Queue | BullMQ + Redis | Latest |
| Storage | MinIO (S3-compatible, local) | Latest |
| AI | Anthropic Claude SDK | Latest (`claude-sonnet-4-6`) |
| CLI | Node.js script, registered via `npm link` | — |
| Infra | Docker Compose (local only) | — |
| Charts | Recharts | Latest |
| DnD | @dnd-kit/core | Latest |
| Forms | React Hook Form + Zod | Latest |
| State | Zustand | Latest |
| Real-time | Server-Sent Events (SSE) via Next.js route handlers | — |

---

## Project Structure

```
growthos/
├── frontend/
│   ├── app/                        # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx                # redirect to /intake
│   │   ├── intake/page.tsx         # Module 1
│   │   ├── opportunities/page.tsx  # Module 2
│   │   ├── placements/page.tsx     # Module 3
│   │   ├── approvals/page.tsx      # Module 4
│   │   ├── workspace/page.tsx      # Module 5
│   │   ├── assets/page.tsx         # Module 6
│   │   ├── tracking/page.tsx       # Module 7
│   │   ├── admin/page.tsx          # Module 8
│   │   ├── scheduler/page.tsx
│   │   ├── competitors/page.tsx
│   │   ├── in-the-wild/page.tsx
│   │   ├── alerts/page.tsx
│   │   └── launch/page.tsx
│   ├── components/
│   │   ├── ui/                     # base primitives
│   │   ├── approval/               # approval card, bulk bar, variation switcher
│   │   ├── charts/                 # ROI ranker, funnel, heatmap, spike, calendar arc
│   │   ├── feed/                   # in-the-wild feed
│   │   ├── forms/                  # intake wizard, brand voice config, cadence config
│   │   ├── layout/                 # nav, approval badge, channel status indicators
│   │   ├── timeline/               # launch sequence planner
│   │   └── agents/                 # agent run progress view
│   ├── lib/
│   │   ├── api.ts                  # typed API client
│   │   ├── store.ts                # Zustand store
│   │   └── sse.ts                  # SSE subscription helpers
│   └── types/                      # shared frontend types (generated from Prisma)
├── backend/
│   ├── app/api/                    # Next.js API Route handlers
│   │   ├── products/route.ts
│   │   ├── run/route.ts
│   │   ├── suggestions/route.ts
│   │   ├── approvals/route.ts
│   │   ├── execution/route.ts
│   │   ├── assets/route.ts
│   │   ├── metrics/route.ts
│   │   ├── scheduler/route.ts
│   │   ├── competitors/route.ts
│   │   ├── trends/route.ts
│   │   ├── in-the-wild/route.ts
│   │   ├── alerts/route.ts
│   │   ├── utm/route.ts
│   │   ├── audit/route.ts
│   │   └── sse/route.ts            # SSE stream for agent progress
│   ├── lib/
│   │   ├── prisma.ts               # Prisma singleton
│   │   ├── redis.ts                # Redis/BullMQ singleton
│   │   ├── minio.ts                # MinIO client
│   │   ├── queue.ts                # queue workers registration
│   │   └── utm.ts                  # UTM generation utility
│   └── services/
│       ├── approval.service.ts
│       ├── scheduler.service.ts
│       ├── metrics.service.ts
│       └── audit.service.ts
├── agents/
│   ├── _core/
│   │   ├── base-agent.ts           # abstract base class all agents extend
│   │   ├── protocol.ts             # typed agent-to-agent message contracts
│   │   ├── brand-voice.ts          # brand voice config loader
│   │   └── rate-limiter.ts         # per-channel rate limiting
│   ├── product/
│   │   └── product-understanding.agent.ts
│   ├── channel/
│   │   └── channel-discovery.agent.ts
│   ├── placement/
│   │   └── placement-strategy.agent.ts
│   ├── scoring/
│   │   └── scoring-ranking.agent.ts
│   ├── asset/
│   │   └── asset-generation.agent.ts
│   ├── repurposing/
│   │   └── content-repurposing.agent.ts
│   ├── variation/
│   │   └── content-variation.agent.ts
│   ├── approval/
│   │   └── approval-orchestration.agent.ts
│   ├── execution/
│   │   └── execution.agent.ts
│   ├── feedback/
│   │   └── feedback-learning.agent.ts
│   ├── intelligence/
│   │   ├── competitor.agent.ts
│   │   ├── trend-detection.agent.ts
│   │   ├── in-the-wild.agent.ts
│   │   ├── ecosystem-targeting.agent.ts
│   │   ├── influencer.agent.ts
│   │   └── viral-alert.agent.ts
│   ├── community/
│   │   ├── karma-builder.agent.ts
│   │   ├── engagement-response.agent.ts
│   │   ├── account-warmup.agent.ts
│   │   └── anti-spam.agent.ts
│   └── channels/
│       ├── github.agent.ts
│       ├── producthunt.agent.ts
│       ├── hackernews.agent.ts
│       ├── reddit.agent.ts
│       ├── twitter.agent.ts
│       ├── discord.agent.ts
│       ├── slack.agent.ts
│       ├── devto.agent.ts
│       ├── hashnode.agent.ts
│       ├── linkedin.agent.ts
│       ├── newsletter.agent.ts
│       ├── npm-registry.agent.ts
│       ├── awesome-lists.agent.ts
│       ├── template-platforms.agent.ts
│       ├── integration-marketplace.agent.ts
│       ├── stackoverflow.agent.ts
│       ├── indiehackers.agent.ts
│       ├── lobsters.agent.ts
│       └── bluesky.agent.ts
├── shared/
│   ├── types/                      # canonical TypeScript types shared by all layers
│   │   ├── agent.types.ts
│   │   ├── channel.types.ts
│   │   ├── suggestion.types.ts
│   │   ├── approval.types.ts
│   │   ├── asset.types.ts
│   │   ├── metrics.types.ts
│   │   └── brand-voice.types.ts
│   └── constants/
│       ├── channels.ts             # enum of all 19 channels
│       └── scoring.ts              # scoring weight constants
├── cli/
│   ├── index.ts                    # growthos entrypoint
│   ├── commands/
│   │   ├── run.ts
│   │   ├── approve.ts
│   │   ├── metrics.ts
│   │   ├── status.ts
│   │   ├── schedule.ts
│   │   └── alerts.ts
│   └── package.json                # bin: { growthos: "./dist/index.js" }
├── infra/
│   └── docker-compose.yml          # Postgres + Redis + MinIO
├── prisma/
│   ├── schema.prisma
│   └── migrations/
└── .env.example
```

---

## PHASE 1 — Infrastructure & Foundation

### Task 1–8: Project Bootstrap

**What:** Initialize the monorepo, configure all tooling, Docker services, and environment.

**How:**
1. Create directory structure exactly as above
2. `frontend/` — Next.js 14 app router, TypeScript strict, Tailwind, ESLint
3. `infra/docker-compose.yml`:
   ```yaml
   services:
     postgres:
       image: postgres:15
       environment: { POSTGRES_DB: growthos, POSTGRES_USER: growthos, POSTGRES_PASSWORD: growthos }
       ports: ["5432:5432"]
       volumes: ["pgdata:/var/lib/postgresql/data"]
     redis:
       image: redis:7
       ports: ["6379:6379"]
     minio:
       image: minio/minio
       command: server /data --console-address ":9001"
       ports: ["9000:9000", "9001:9001"]
       environment: { MINIO_ROOT_USER: growthos, MINIO_ROOT_PASSWORD: growthos }
       volumes: ["miniodata:/data"]
   volumes: { pgdata: {}, miniodata: {} }
   ```
4. `.env.example` must define: `DATABASE_URL`, `REDIS_URL`, `MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `ANTHROPIC_API_KEY`, `GITHUB_TOKEN`, `REDDIT_CLIENT_ID`, `REDDIT_SECRET`, `TWITTER_BEARER_TOKEN`, `PRODUCTHUNT_TOKEN`, `NEXT_PUBLIC_API_BASE`

**Acceptance:** `docker compose up` starts cleanly, all three services healthy.

---

### Task 4: PostgreSQL Schema (Prisma)

**File:** `prisma/schema.prisma`

**Full schema — implement all models exactly:**

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  orgs      OrganizationMember[]
}

model Organization {
  id        String   @id @default(cuid())
  name      String
  createdAt DateTime @default(now())
  members   OrganizationMember[]
  projects  Project[]
}

model OrganizationMember {
  id     String @id @default(cuid())
  userId String
  orgId  String
  role   String @default("member")
  user   User         @relation(fields: [userId], references: [id])
  org    Organization @relation(fields: [orgId], references: [id])
}

model Project {
  id        String   @id @default(cuid())
  orgId     String
  name      String
  createdAt DateTime @default(now())
  org       Organization @relation(fields: [orgId], references: [id])
  products  Product[]
}

model Product {
  id            String   @id @default(cuid())
  projectId     String
  url           String
  githubUrl     String?
  description   String
  icp           String?
  plgWedge      String?
  useCases      Json?
  whyDevsShare  String?
  brandVoiceId  String?
  createdAt     DateTime @default(now())
  project       Project  @relation(fields: [projectId], references: [id])
  brandVoice    BrandVoice? @relation(fields: [brandVoiceId], references: [id])
  suggestions   PlacementSuggestion[]
  competitors   Competitor[]
  metrics       PerformanceMetric[]
  calendar      ContentCalendar[]
  utmLinks      UtmTracking[]
}

model BrandVoice {
  id          String   @id @default(cuid())
  tone        String
  style       String
  vocabulary  Json
  preset      String?
  createdAt   DateTime @default(now())
  products    Product[]
}

model Channel {
  id          String @id @default(cuid())
  name        String @unique
  slug        String @unique
  cadence     String @default("daily")
  active      Boolean @default(true)
  lastRunAt   DateTime?
  suggestions PlacementSuggestion[]
  metrics     PerformanceMetric[]
}

model PlacementSuggestion {
  id            String   @id @default(cuid())
  productId     String
  channelId     String
  type          String
  title         String
  body          String
  reasoning     String
  viralityScore Int
  effortScore   Int
  audienceFit   Int
  timeToValue   Int
  status        String   @default("pending")
  expiresAt     DateTime?
  createdAt     DateTime @default(now())
  product       Product  @relation(fields: [productId], references: [id])
  channel       Channel  @relation(fields: [channelId], references: [id])
  versions      SuggestionVersion[]
  approvals     Approval[]
  assets        Asset[]
  utmLinks      UtmTracking[]
}

model SuggestionVersion {
  id           String   @id @default(cuid())
  suggestionId String
  body         String
  changedBy    String
  changedAt    DateTime @default(now())
  suggestion   PlacementSuggestion @relation(fields: [suggestionId], references: [id])
}

model Approval {
  id           String   @id @default(cuid())
  suggestionId String
  decision     String
  modifiedBody String?
  reason       String?
  decidedAt    DateTime @default(now())
  suggestion   PlacementSuggestion @relation(fields: [suggestionId], references: [id])
}

model ExecutionTask {
  id           String   @id @default(cuid())
  suggestionId String
  status       String   @default("queued")
  artifacts    Json?
  startedAt    DateTime?
  completedAt  DateTime?
  errorMsg     String?
  createdAt    DateTime @default(now())
}

model Asset {
  id           String   @id @default(cuid())
  suggestionId String
  type         String
  title        String
  content      String
  variationOf  String?
  storageKey   String?
  createdAt    DateTime @default(now())
  suggestion   PlacementSuggestion @relation(fields: [suggestionId], references: [id])
}

model PerformanceMetric {
  id          String   @id @default(cuid())
  productId   String
  channelId   String
  metricKey   String
  metricValue Float
  rawData     Json?
  fetchedAt   DateTime @default(now())
  product     Product  @relation(fields: [productId], references: [id])
  channel     Channel  @relation(fields: [channelId], references: [id])
}

model Competitor {
  id         String   @id @default(cuid())
  productId  String
  name       String
  url        String
  presence   Json
  gaps       Json?
  scannedAt  DateTime @default(now())
  product    Product  @relation(fields: [productId], references: [id])
}

model ContentCalendar {
  id          String   @id @default(cuid())
  productId   String
  channelSlug String
  phase       String
  scheduledAt DateTime
  status      String   @default("scheduled")
  suggestionId String?
  product     Product  @relation(fields: [productId], references: [id])
}

model UtmTracking {
  id           String   @id @default(cuid())
  productId    String
  suggestionId String?
  channelSlug  String
  utmSource    String
  utmMedium    String
  utmCampaign  String
  utmContent   String?
  clicks       Int      @default(0)
  signups      Int      @default(0)
  activations  Int      @default(0)
  createdAt    DateTime @default(now())
  product      Product  @relation(fields: [productId], references: [id])
  suggestion   PlacementSuggestion? @relation(fields: [suggestionId], references: [id])
}

model AuditLog {
  id        String   @id @default(cuid())
  actor     String
  action    String
  entityId  String?
  entityType String?
  payload   Json?
  createdAt DateTime @default(now())
}
```

**Acceptance:** `npx prisma migrate dev` runs without error, all tables created.

---

### Tasks 9–10: CLI

**File:** `cli/index.ts`

**How:**
- Use `commander` for subcommand routing
- Commands call the Next.js backend via HTTP (localhost:3000)
- `growthos run` — POST /api/run, streams SSE progress to terminal
- `growthos approve` — GET /api/suggestions?status=pending, renders interactive TUI with `inquirer`, accepts decisions
- `growthos metrics --channel <slug>` — GET /api/metrics?channel=<slug>, pretty-prints table
- `growthos status` — GET /api/run/status, prints current agent swarm state
- `growthos schedule --channel <slug> --cadence daily|twice-daily` — PATCH /api/scheduler
- `growthos alerts` — GET /api/alerts, prints active viral alerts

**`cli/package.json` bin field:**
```json
{ "bin": { "growthos": "./dist/index.js" } }
```

**Acceptance:** `growthos --help` prints all subcommands from any directory after `npm link`.

---

## PHASE 2 — Agent Swarm Core

### Base Agent Contract

**File:** `agents/_core/base-agent.ts`

Every agent extends this class. No exceptions.

```typescript
export abstract class BaseAgent<TInput, TOutput> {
  abstract name: string
  abstract run(input: TInput): Promise<TOutput>

  protected async callClaude(systemPrompt: string, userPrompt: string): Promise<string> {
    // Use Anthropic SDK with claude-sonnet-4-6
    // Always include prompt caching headers on system prompts > 1000 tokens
    // Retry up to 3 times on rate limit with exponential backoff
  }

  protected enforceOutputContract(output: unknown, schema: ZodSchema): TOutput {
    // Parse and validate — throw descriptive error on failure, never return partial data
  }
}
```

### Agent-to-Agent Protocol

**File:** `agents/_core/protocol.ts`

All inter-agent messages are typed. Define these interfaces:

```typescript
export interface ProductProfile {
  productId: string
  icp: string
  plgWedge: string
  useCases: string[]
  whyDevsShare: string
  technicalSurface: string[]
  targetCommunities: string[]
}

export interface ChannelFitScore {
  channelSlug: string
  fitScore: number          // 0–100
  fitReason: string
  suggestedTypes: PlacementType[]
}

export interface PlacementSuggestionOutput {
  channelSlug: string
  type: PlacementType
  title: string
  body: string              // production-ready, no placeholders
  reasoning: string
  viralityScore: number     // 0–100
  effortScore: number       // 0–100 (lower = less effort)
  audienceFit: number       // 0–100
  timeToValue: number       // days estimate
}

export interface AssetOutput {
  suggestionId: string
  type: AssetType
  title: string
  content: string           // fully written, copy-paste ready
  variations: string[]      // N unique versions
}

export type PlacementType =
  | 'github-repo' | 'starter-template' | 'demo-sandbox'
  | 'try-it-yourself' | 'sdk-example' | 'blog-article'
  | 'community-post' | 'integration-plugin' | 'snippet-library'
  | 'package-listing' | 'answer-reply' | 'awesome-list-entry'
  | 'influencer-outreach' | 'newsletter-submission'

export type AssetType = 'readme' | 'post' | 'thread' | 'template' | 'snippet' | 'pitch' | 'reply'
```

---

### Task 12: Product Understanding Agent

**File:** `agents/product/product-understanding.agent.ts`

**Input:** `{ url: string, githubUrl?: string, description: string }`  
**Output:** `ProductProfile`

**How:**
1. Fetch URL content (Playwright headless if needed, otherwise fetch)
2. If githubUrl provided, fetch README + package.json + top-level files via GitHub API
3. Send to Claude with system prompt: extract ICP, PLG wedge, use cases, viral mechanisms, technical surface, target communities
4. Return typed `ProductProfile` — validate with Zod, no partial returns

**Acceptance:** Given a real product URL, returns non-empty, specific (not generic) ICP and PLG wedge.

---

### Task 13: Competitor Intelligence Agent

**File:** `agents/intelligence/competitor.agent.ts`

**Input:** `{ productProfile: ProductProfile }`  
**Output:** `{ competitors: CompetitorPresence[], gaps: ChannelGap[] }`

```typescript
interface CompetitorPresence {
  name: string
  url: string
  channels: { slug: string; score: number; evidence: string }[]
}

interface ChannelGap {
  channelSlug: string
  competitorScore: number   // avg competitor presence 0–100
  yourScore: number         // 0 if not present
  priority: 'high' | 'medium' | 'low'
}
```

**How:**
- Use Claude to identify 3–5 direct competitors from product profile
- For each competitor, check known presence on all 19 channels (search APIs + heuristic URL patterns)
- Output gap list ranked by (competitorScore - yourScore)

---

### Task 16: Channel Discovery Agent

**File:** `agents/channel/channel-discovery.agent.ts`

**Input:** `ProductProfile`  
**Output:** `ChannelFitScore[]` — one entry per channel from the 19-channel list, sorted by fitScore desc

**How:**
- System prompt encodes all 19 channels with their audience characteristics
- Claude scores each channel 0–100 for this product
- Returns reasoning per channel — must be specific (e.g. "your CLI tool targets devs who are active on HN" not "devs use this channel")
- Never return fitScore without a fitReason

---

### Task 17: Placement Strategy Agent

**File:** `agents/placement/placement-strategy.agent.ts`

**Input:** `{ productProfile: ProductProfile, channelScores: ChannelFitScore[] }`  
**Output:** `PlacementSuggestionOutput[]`

**How:**
- Take top N channels (configurable, default 10)
- For each channel, spawn channel-specific agent (see Section 6)
- Consolidate all outputs
- Enforce: no vague `body` fields — each must be the actual content, not a description of what the content would say
- Deduplication: never produce two suggestions with identical type+channel combination in one run

---

### Task 18: Scoring & Ranking Agent

**File:** `agents/scoring/scoring-ranking.agent.ts`

**Input:** `PlacementSuggestionOutput[]`  
**Output:** same array, sorted, with composite `rank` field added

**Scoring formula:**
```
composite = (viralityScore * 0.35) + (audienceFit * 0.30) + ((100 - effortScore) * 0.20) + ((100 - timeToValue) * 0.15)
```

Weights are stored in `shared/constants/scoring.ts` and are user-configurable.

---

### Task 20: Asset Generation Agent

**File:** `agents/asset/asset-generation.agent.ts`

**Input:** `PlacementSuggestionOutput`  
**Output:** `AssetOutput`

**How:**
- Route to asset template by placement type
- README: full markdown, badges, install instructions, quickstart, why-use-this section — complete document, not an outline
- Post/thread: full text as it would be copy-pasted — no "[your product name]" style gaps
- Template: working code, not pseudocode
- Pass brand voice config to every generation call

---

### Task 21: Content Repurposing Engine

**File:** `agents/repurposing/content-repurposing.agent.ts`

**Input:** `{ coreIdea: string, productProfile: ProductProfile }`  
**Output:** `{ channel: string, content: string }[]` — one entry per of the 19 channels

**How:**
- One Claude call per channel format (parallel with Promise.all)
- Each format is native to that channel — a Reddit post doesn't read like a LinkedIn post
- All 19 outputs in one run

---

### Task 22: Content Variation Engine

**File:** `agents/variation/content-variation.agent.ts`

**Input:** `{ asset: AssetOutput, count: number }`  
**Output:** `string[]` — N unique versions

**How:**
- Generate variations that differ in hook, tone, opening, CTA — not just word substitutions
- Validate uniqueness: reject if cosine similarity > 0.85 between any two versions (use simple word overlap heuristic)

---

### Task 23: Approval Orchestration Agent

**File:** `agents/approval/approval-orchestration.agent.ts`

**Input:** `PlacementSuggestionOutput[]` with assets attached  
**Output:** Persisted `PlacementSuggestion` records in DB, status `pending`

**How:**
- Batch write to DB
- Format each suggestion as a decision packet: suggestion + reasoning + asset preview + expected impact
- Emit SSE event so frontend Approval Queue updates live

---

### Task 24: Execution Agent

**File:** `agents/execution/execution.agent.ts`

**Input:** `{ suggestionId: string, approvedAsset: AssetOutput }`  
**Output:** `{ taskId: string, artifacts: ExecutionArtifact[] }`

**Non-negotiable:** This agent checks `approval.decision === 'approved'` as its first line. If not approved, throw. Never execute on pending/rejected.

**Per placement type:**
- `github-repo` → create repo via GitHub API, commit README and starter files
- `community-post` → prepare formatted post object for manual posting (no auto-post without channel API consent)
- `awesome-list-entry` → create PR to target repo via GitHub API
- `package-listing` → prepare `npm publish` command with all files ready

---

## PHASE 3 — Intelligence & Channel Agents

### Tasks 26–31: Intelligence Agents

Each agent follows `BaseAgent<TInput, TOutput>` pattern. Key contracts:

**Trend Detection Agent** (`agents/intelligence/trend-detection.agent.ts`)
- Polls HN Algolia API, Reddit search, Twitter search API on schedule
- Output: `{ topic: string, velocity: number, relevanceScore: number, contentOpportunity: string }[]`

**"In The Wild" Monitor** (`agents/intelligence/in-the-wild.agent.ts`)
- Searches GitHub issues, Stack Overflow questions, Reddit posts for problem-space keywords
- Output: `{ source: string, url: string, title: string, matchReason: string, draftReply: string }[]`
- `draftReply` must be a complete, helpful reply — not a template

**Viral Moment Alert** (`agents/intelligence/viral-alert.agent.ts`)
- Polls metrics for all approved suggestions every 15 minutes
- Threshold: any metric that 3x'd in last hour
- Emits SSE event + desktop notification (node-notifier) on spike
- Output: `{ suggestionId: string, channel: string, metric: string, currentValue: number, baseline: number, rapidResponseOptions: string[] }`

### Tasks 36–54: Channel Agents (19 agents)

Each channel agent follows this interface:

```typescript
interface ChannelAgentInput {
  productProfile: ProductProfile
  channelFitScore: ChannelFitScore
  brandVoice: BrandVoiceConfig
  placementType: PlacementType
}

interface ChannelAgentOutput extends PlacementSuggestionOutput {
  channelSpecific: Record<string, unknown>  // channel-native metadata
}
```

**Per-agent specifics:**

| Agent | `channelSpecific` fields | Anti-spam rule |
|-------|--------------------------|----------------|
| GitHub | `topics: string[], demoUrl: string, tryItFlow: string` | max 1 repo/week |
| ProductHunt | `tagline: string, makerComment: string, gallery: string[], launchTime: string` | 1 launch/quarter |
| HackerNews | `showHnTitle: string, angle: string, hook: string, controversialFraming: string` | max 2 posts/month |
| Reddit | `subreddits: string[], tone: string, communityRulesCheck: boolean` | per-subreddit limits |
| Twitter/X | `thread: string[], hookVariations: string[], replyStarters: string[]` | max 5 threads/week |
| Discord | `targetServers: string[], channelFit: string, messageTone: string` | max 3/week |
| Slack | `workspaces: string[], dmVsPublic: string` | max 2/week |
| Dev.to | `tags: string[], seoTitle: string, canonicalUrl?: string` | max 2/week |
| Hashnode | `series: string, publicationSlug: string` | max 2/week |
| LinkedIn | `angle: string, carouselSlides?: string[]` | max 3/week |
| Newsletter | `publication: string, pitchFormat: string, timing: string` | 1/month per pub |
| npm Registry | `keywords: string[], registry: string` | 1 per release |
| Awesome Lists | `repoUrl: string, prBody: string, blurb: string` | 1 per list |
| Template Platforms | `platform: string, embedUrl: string, templateName: string` | 1 per template |
| Integration Marketplace | `marketplace: string, extensionAssets: string[]` | 1 per version |
| Stack Overflow | `questionUrls: string[], answerDraft: string` | max 5/day |
| IndieHackers | `milestoneType: string, threadAngle: string` | max 3/week |
| Lobste.rs | `tags: string[], linkPostStyle: string` | max 2/week |
| Bluesky | `starterPackFit: boolean, threadStrategy: string` | max 5/day |

---

## PHASE 4 — Scheduling & Calendar

### Task 55–56: Scheduler

**File:** `backend/services/scheduler.service.ts`

**How:**
- Use BullMQ repeatable jobs, one job per channel
- Cadence stored per-channel in `Channel.cadence` DB field
- On each job fire: trigger agent swarm for that channel, populate approval queue
- Job IDs: `schedule:${channelSlug}`
- Admin can pause/resume individual channels via API

### Task 57: Content Calendar Engine

**File:** `agents/calendar/content-calendar.agent.ts`

**Output:** `ContentCalendar[]` records

Phases map to suggestion types:
- Awareness → `community-post`, `answer-reply`, `awesome-list-entry`
- Consideration → `blog-article`, `demo-sandbox`, `starter-template`
- Conversion → `try-it-yourself`, `github-repo`, `newsletter-submission`

Arc spans configurable number of weeks (default: 8 weeks). Calendar is visualized in the Scheduler Control UI.

### Task 61: Launch Sequence Orchestrator

**File:** `agents/launch/launch-sequence.agent.ts`

**Output:** `{ channel: string, scheduledAt: DateTime, content: PlacementSuggestionOutput }[]`

Rule: PH + HN + Twitter + Reddit all within a 2-hour window. Other channels within ±24 hours.

---

## PHASE 5 — Backend APIs

All routes: `backend/app/api/[resource]/route.ts` using Next.js App Router `GET`/`POST`/`PATCH`/`DELETE` named exports.

### Full API Contract

| Method | Path | Body/Query | Response |
|--------|------|-----------|----------|
| POST | /api/products | `{ url, githubUrl?, description, brandVoice? }` | `Product` |
| POST | /api/run | `{ productId }` | `{ runId: string }` + SSE stream at /api/sse |
| GET | /api/suggestions | `?productId&status&channelSlug&page&limit` | `{ suggestions: PlacementSuggestion[], total: number }` |
| POST | /api/approvals | `{ suggestionId, decision, modifiedBody?, reason? }` | `Approval` |
| POST | /api/execution | `{ suggestionId }` | `ExecutionTask` |
| GET | /api/assets | `?suggestionId` | `Asset[]` |
| PUT | /api/assets/:id | `{ content }` | `Asset` |
| GET | /api/metrics | `?productId&channelSlug` | `PerformanceMetric[]` |
| POST | /api/metrics/refresh | `{ productId, channelSlug? }` | triggers metric fetch, SSE progress |
| GET | /api/scheduler | — | `Channel[]` with cadence |
| PATCH | /api/scheduler | `{ channelSlug, cadence, active }` | `Channel` |
| GET | /api/competitors | `?productId` | `{ competitors: Competitor[], gaps: ChannelGap[] }` |
| GET | /api/trends | `?productId` | trend opportunities array |
| GET | /api/in-the-wild | `?productId` | matches array |
| GET | /api/alerts | `?productId` | viral alerts array |
| POST | /api/utm | `{ productId, channelSlug, suggestionId? }` | `UtmTracking` with UTM params |
| POST | /api/utm/event | `{ utmContent, event: 'click'\|'signup'\|'activation' }` | 200 |
| GET | /api/utm/report | `?productId` | conversion report per channel |
| GET | /api/audit | `?entityId&entityType&page` | `AuditLog[]` |
| GET | /api/sse | `?runId` | SSE stream — events: `agent:start`, `agent:done`, `agent:error`, `queue:update`, `alert:spike` |

**SSE event format:**
```typescript
interface SSEEvent {
  type: 'agent:start' | 'agent:done' | 'agent:error' | 'queue:update' | 'alert:spike'
  agentName?: string
  payload: unknown
  timestamp: string
}
```

---

## PHASE 6 — Frontend Modules

### Design System

**File:** `frontend/components/ui/` — build these primitives first:

- `Button` — variants: primary, secondary, ghost, danger, approve, reject
- `Card` — with header, body, footer slots
- `Badge` — variants: channel (one per channel with channel color), status, score
- `ScoreBar` — horizontal bar 0–100 with color gradient (green → yellow → red)
- `Modal` — backdrop, close on escape, focus trap
- `Drawer` — right-side slide-in panel
- `Skeleton` — loading placeholder for all data shapes
- `Toast` — top-right notifications, auto-dismiss
- `Tabs` — horizontal tabs with active underline
- `Input`, `Textarea`, `Select`, `Slider`, `Toggle`, `Checkbox`

**Color palette (Tailwind config):**
- Background: `zinc-950` (near black)
- Surface: `zinc-900`
- Border: `zinc-800`
- Accent: `violet-500` (primary actions)
- Approve: `emerald-500`
- Reject: `red-500`
- Defer: `amber-500`
- Modify: `blue-500`
- Text primary: `zinc-50`
- Text secondary: `zinc-400`

**Typography:**
- Font: `Inter` (body), `JetBrains Mono` (code, asset content, CLI output)
- Scale: 12/14/16/20/24/32px

---

### Module 1 — Product Intake (Task 95 + 108M + 108N)

**File:** `frontend/app/intake/page.tsx`  
**Components:** `frontend/components/forms/ProductIntakeWizard.tsx`, `BrandVoiceConfig.tsx`

**Wizard steps (step indicator at top, progress bar):**

**Step 1 — Product URL**
- Large centered input for product URL
- Secondary input for GitHub URL (optional)
- Validate URL format on blur
- Show URL preview card (favicon + title fetched client-side) on valid URL

**Step 2 — Description**
- `<textarea>` with character count (max 500)
- Below: AI-suggested description loaded from product URL (fetched on step entry)
- "Use suggestion" button to copy in

**Step 3 — Brand Voice Config** (`BrandVoiceConfig.tsx`)
- Tone slider: Technical ←→ Approachable (1–10)
- Style slider: Formal ←→ Conversational (1–10)
- Vocabulary tags: add/remove keywords to use / keywords to avoid (two tag inputs)
- Preset profile buttons: "Technical OSS", "Founder-led", "DevRel-style", "Community-first" — clicking one pre-fills all sliders
- Live copy preview: below config, show a sample sentence that updates as sliders move (call Claude with debounce)

**Step 4 — Confirm & Launch**
- Summary card of all inputs
- "Analyze Product" CTA button
- On submit: POST /api/products → POST /api/run → redirect to /opportunities?runId=xxx and SSE stream opens

---

### Module 2 — Opportunity Engine (Task 96 + 108C)

**File:** `frontend/app/opportunities/page.tsx`

**Layout:** Two-column — channel list (left, 60%) + competitor gap heatmap (right, 40%)

**Channel list:**
- 19 rows, one per channel
- Each row: channel logo/icon, name, `fitScore` as `ScoreBar`, presence status indicator (`108R`), suggested placement types as badges
- Sortable by fitScore, effortScore, audienceFit
- Clicking a channel expands inline: fit reason, competitor presence, suggested types detail

**Competitor Gap Heatmap** (`frontend/components/charts/CompetitorHeatmap.tsx`):
- Grid: rows = competitors + "You", columns = 19 channels
- Cell color: emerald (strong presence) → zinc (absent)
- Hover: tooltip with evidence / URL
- "Gaps" badge on cells where competitor is green and you are empty

---

### Module 3 — Placement Generator (Task 97)

**File:** `frontend/app/placements/page.tsx`

**Layout:** Masonry grid of strategy cards

**Strategy Card** per suggestion:
- Header: channel badge + placement type badge
- Title (large)
- Score row: Virality `ScoreBar`, Effort `ScoreBar` (inverted color), Audience Fit `ScoreBar`
- Reasoning paragraph (collapsible if > 3 lines)
- Preview of asset body (first 200 chars, "View full asset" expands)
- Footer: "Add to Approval Queue" button → changes card state to "Queued"

**Filters:** channel multi-select, placement type multi-select, min virality score slider

---

### Module 4 — Approval Queue (Tasks 98 + 108F + 108G + 108H)

**File:** `frontend/app/approvals/page.tsx`

**Layout:** List of approval cards with bulk action bar at top

**Bulk Action Bar** (`frontend/components/approval/BulkActionBar.tsx`):
- Shows when 1+ items selected: "X selected — Approve All | Reject All | Defer All"
- Confirm dialog before bulk action
- 5-second undo window after bulk action (toast with countdown)

**Approval Card** (`frontend/components/approval/ApprovalCard.tsx`):
- Checkbox top-left for bulk select
- Channel badge + type badge + virality score badge
- Title + reasoning
- Asset preview panel (right side, 40% width): full asset content in monospace, scrollable
- **Variation Switcher** (`frontend/components/approval/VariationSwitcher.tsx`): if N > 1 variations exist, show "Version 1 / 3 ←→" controls, highlight diff lines between versions in yellow
- Action buttons: Approve (emerald), Modify (blue → opens edit modal), Reject (red), Defer (amber)
- Modify modal: editable textarea pre-filled with asset content, "Save & Approve" CTA

**Status filters:** All | Pending | Approved | Rejected | Deferred

---

### Module 5 — Execution Workspace (Task 99)

**File:** `frontend/app/workspace/page.tsx`

**Layout:** Table of execution tasks

Columns: Channel | Placement Type | Status (badge) | Artifacts | Started | Completed | Actions

Status badges: `queued` (zinc), `running` (violet animated pulse), `done` (emerald), `failed` (red)

Artifacts column: clickable links to created repos, files, PR URLs

"Retry" button on failed tasks.

---

### Module 6 — Asset Studio (Task 100 + 108H)

**File:** `frontend/app/assets/page.tsx`

**Layout:** Sidebar (asset list) + main editor pane

Asset list: grouped by channel, shows type badge and status

Main pane:
- Asset content in `<textarea>` styled as markdown editor (monospace, line numbers via CSS counter)
- Variation switcher at top: "Variation 1 of N" with diff view toggle
- "Copy to clipboard" button (prominent, top-right of pane)
- "Regenerate" button — triggers new variation generation
- Preview toggle: raw text ↔ rendered markdown

---

### Module 7 — Tracking Dashboard (Tasks 101 + 108A + 108B + 108L)

**File:** `frontend/app/tracking/page.tsx`

**Layout:** Four sections

**Section 1 — Channel ROI Ranker** (`frontend/components/charts/ROIRanker.tsx`):
- Ranked list: channel name, effectiveness score (0–100), ROI score, trend arrow (↑↓ vs last week)
- Sparkline trend line (7-day) per channel using Recharts `<LineChart>`
- Re-sorts live on metrics refresh
- "Refresh All" button top-right — triggers POST /api/metrics/refresh, shows loading skeleton per row

**Section 2 — Full-Funnel Conversion Chart** (`frontend/components/charts/FunnelChart.tsx`):
- Sankey or stepped funnel: Channel Clicks → Signups → Activations → Retention
- Per-channel drilldown: click a channel in ROI ranker → funnel filters to that channel
- Recharts `<FunnelChart>` or custom SVG

**Section 3 — Per-Channel Effectiveness** (`frontend/components/charts/ChannelEffectivenessGrid.tsx`):
- Grid of channel cards: engagement metrics, last-updated timestamp, on-demand refresh button (`108L`)
- Refresh UX: skeleton replaces content during fetch, "Last updated: 3m ago" timestamp below

**Section 4 — On-Demand Metrics Refresh UX** (`108L`):
- Per-channel: last-updated timestamp + "Refresh" button
- Loading state: `<Skeleton>` animation
- On completion: animate in new values

---

### Module 8 — Admin Panel (Task 102)

**File:** `frontend/app/admin/page.tsx`

Three tabs: Agents | Scheduler | System

**Agents tab:** Table of all agents — name, status (idle/running/error), last run time, total runs

**Scheduler tab:** Same as Scheduler Control UI (see below)

**System tab:** Postgres connected (green/red), Redis connected, MinIO connected, ENV vars present (masked values)

---

### Scheduler Control UI (Task 103 + 108O)

**File:** `frontend/app/scheduler/page.tsx`

**Per-Channel Cadence Configurator** (`frontend/components/forms/CadenceConfig.tsx`):
- Table: one row per channel
- Toggle: active / paused
- Select: daily | twice-daily | weekly | per-launch-only
- "Next run" timestamp (computed from cadence + lastRunAt)
- "Bulk set all to daily" button at top
- Save button — PATCH /api/scheduler

**Content Calendar Arc View** (`frontend/components/charts/CalendarArcView.tsx`):
- Horizontal timeline, 8 weeks
- Three lanes: Awareness (top, blue), Consideration (middle, violet), Conversion (bottom, emerald)
- Each scheduled item is a pill on the timeline showing channel badge + placement type
- Hover: shows full suggestion title and scheduled date

---

### Competitor Intelligence UI (Task 104 + 108C)

**File:** `frontend/app/competitors/page.tsx`

Full-page competitor gap heatmap (same component as Module 2 right panel but full width).

Above heatmap: summary cards — "5 channels where all competitors outperform you" with gap score.

Below heatmap: ranked gap list — channel | your score | competitor avg score | gap | CTA "Generate placement for this channel"

---

### "In the Wild" Feed UI (Task 105 + 108I)

**File:** `frontend/app/in-the-wild/page.tsx`

**Live Feed Component** (`frontend/components/feed/InTheWildFeed.tsx`):
- Auto-polls /api/in-the-wild every 60 seconds
- Each item: source badge (GitHub/Reddit/SO), title, URL (external link), match reason (why your product is the answer), draft reply preview (first 100 chars)
- "Draft Reply" button → opens Drawer with full draft reply in editable textarea → "Add to Approval Queue" CTA
- Filters: source select, match score slider

---

### Viral Alert UI (Task 106 + 108J)

**File:** `frontend/app/alerts/page.tsx`

**Global notification panel:** `108J` — alert badge in nav (count of unread alerts, animates on new)

Alert page:
- Each alert: channel badge, post title, metric that spiked (e.g. "HN points: 12 → 187 in 1h"), spike graph (mini sparkline)
- Rapid-response content queue: 3 pre-generated response options, each with "Add to Approval Queue" button
- "Dismiss" button per alert

---

### Launch Sequence Planner UI (Task 107 + 108P)

**File:** `frontend/app/launch/page.tsx`

**Drag-and-Drop Timeline** (`frontend/components/timeline/LaunchTimeline.tsx`):
- Horizontal timeline with hour slots (−24h to +24h relative to launch zero)
- @dnd-kit/core for drag
- Each channel as a draggable pill — color-coded by channel
- Snap to 30-minute slots
- Conflict detection: if two high-competition channels land within 15 minutes, show warning badge
- "PH + HN window" highlighted zone (2-hour window, dashed border) — snapping into this zone triggers confirmation
- Save → writes ContentCalendar records

---

### Global Layout & Navigation (108Q + 108R)

**File:** `frontend/app/layout.tsx`, `frontend/components/layout/Nav.tsx`

**Sidebar nav** (left, 240px, collapsible to 64px):
- Logo + "GrowthOS" wordmark
- Nav items: Intake | Opportunities | Placements | Approvals | Workspace | Assets | Tracking | Scheduler | Competitors | In the Wild | Alerts | Launch | Admin
- **Global Approval Badge** (`108Q`): on "Approvals" nav item, count badge of pending approvals, pulses on new items
- **Channel Presence Status** (`108R`): small dot per channel in Opportunities and Scheduler views — emerald (active), violet (pending approval), zinc (not present), amber (needs attention)

**SSE connection:** On app load, open SSE connection to /api/sse. Wire events:
- `queue:update` → re-fetch approval count → update badge
- `alert:spike` → show Toast notification with link to /alerts
- `agent:start` / `agent:done` → update agent run progress view

---

### Agent Run Progress View (108K)

**File:** `frontend/components/agents/AgentRunProgress.tsx`

Shown in: a drawer triggered from any "Running" status indicator

Content:
- Header: "Agent Swarm Running — started X ago"
- List of all agents in the run: name | status badge (waiting/running/done/error) | duration
- Streaming log output (monospace, auto-scroll to bottom) — fed by SSE `agent:start`/`agent:done` events
- Completion estimate (remaining agents × avg agent time)
- "Cancel Run" button (red, confirm dialog)

---

## PHASE 7 — Integrations

### Task 108 (SPEC §12): GitHub API

**File:** `backend/lib/integrations/github.ts`

Operations:
- `createRepo(name, description, isPrivate)` → repo URL
- `commitFiles(repoUrl, files: {path, content}[])` → commit SHA
- `fetchTraffic(repoUrl)` → `{ views, clones, stars, forks }`
- `searchIssues(query)` → issue array
- `createPR(repoUrl, title, body, branch)` → PR URL

Use Octokit. Token from `GITHUB_TOKEN` env.

### Task 109–117: Other API Integrations

Each integration lives in `backend/lib/integrations/<platform>.ts`.

Every integration module exports:
- `post(content)` — submit content
- `fetchMetrics(entityId)` — return `Record<string, number>`

Platforms: Reddit (snoowrap), Twitter (twitter-api-v2), ProductHunt (GraphQL), Hacker News (Algolia read-only), npm registry API, Dev.to REST API, Hashnode GraphQL, LinkedIn API, Stack Overflow search API.

---

## PHASE 8 — Effectiveness Measurement

### Tasks 62–75: Metrics

**File:** `backend/services/metrics.service.ts`

`fetchChannelMetrics(productId, channelSlug)`:
- Route to per-channel metric fetcher
- Normalize all metrics to `PerformanceMetric` records
- Compute effectiveness score 0–100 using weighted formula:
  ```
  score = (engagement * 0.4) + (conversionContribution * 0.4) + (velocity * 0.2)
  ```
  where engagement, conversion, and velocity are normalized per-channel

`computeROIRank(productId)`:
- For all channels with data, compute ROI = signups + (activations * 2)
- Sort descending — this is the ROI ranker order

---

## PHASE 9 — UTM & Conversion

**File:** `backend/lib/utm.ts`

`generateUtm(productId, channelSlug, suggestionId?)`:
- Format: `?utm_source=<channel>&utm_medium=growthos&utm_campaign=<productId>&utm_content=<suggestionId>`
- Persist to `UtmTracking` table

`trackEvent(utmContent, event)`:
- Increment appropriate counter on `UtmTracking` record
- Emit AuditLog entry

---

## PHASE 10 — QA

All E2E tests use Playwright. Test files in `tests/e2e/`.

| Test | File | Assertion |
|------|------|-----------|
| Product → 10+ suggestions | `e2e/product-intake.spec.ts` | ≥10 `PlacementSuggestion` records created |
| Approval flow | `e2e/approval-flow.spec.ts` | ExecutionTask only created after Approval with `decision=approved` |
| Scheduler fires | `e2e/scheduler.spec.ts` | BullMQ job completes, new suggestions appear |
| Metrics fetch | `e2e/metrics.spec.ts` | `PerformanceMetric` records populated with non-zero values |
| Variation uniqueness | `e2e/variation.spec.ts` | All N variations have word-overlap similarity < 0.85 |
| Competitor gap | `e2e/competitor.spec.ts` | `ChannelGap[]` contains at least 5 entries with non-zero competitorScore |
| In the wild | `e2e/in-the-wild.spec.ts` | At least 3 matches returned for a real product URL |
| UTM to conversion | `e2e/utm.spec.ts` | Click event increments `clicks`, signup event increments `signups` |
| Asset copy-paste | `e2e/asset-quality.spec.ts` | Asset content contains no "[" or "your product" placeholder strings |
| CLI works | `e2e/cli.spec.ts` | `growthos --version` returns from any tmp directory |

---

## Execution Order

Build in this sequence. Each phase is a dependency for the next.

```
Phase 1  Infrastructure (tasks 1–10)
Phase 2  Shared types + Agent core (protocol.ts, base-agent.ts, brand-voice.ts)
Phase 3  Product Understanding + Channel Discovery agents (tasks 12, 16)
Phase 4  Placement Strategy + Scoring agents (tasks 17, 18)
Phase 5  Asset Generation + Variation + Repurposing (tasks 20, 21, 22)
Phase 6  Approval Orchestration + Execution agents (tasks 23, 24)
Phase 7  Intelligence agents (tasks 13, 14, 26–31)
Phase 8  All 19 channel agents (tasks 36–54)
Phase 9  Community + Anti-spam agents (tasks 32–35)
Phase 10 Scheduling + Calendar (tasks 55–61)
Phase 11 All backend APIs (tasks 80–94)
Phase 12 Metrics + UTM (tasks 62–79)
Phase 13 Integrations (tasks 108–117)
Phase 14 Design system + Global layout (nav, badge, status indicators)
Phase 15 Frontend Module 1 — Intake
Phase 16 Frontend Module 2 — Opportunities
Phase 17 Frontend Module 3 — Placements
Phase 18 Frontend Module 4 — Approvals
Phase 19 Frontend Modules 5–8 + remaining UIs
Phase 20 E2E tests (tasks 118–127)
```

---

## Definition of Done

A task is done when:
1. Code compiles with `tsc --noEmit` — zero errors
2. The specific acceptance criteria above is met
3. No `any` types
4. No placeholder strings in any generated content
5. ESLint passes
6. The feature works end-to-end in browser or CLI as described

---

## Constraints for the Executing Agent

- Use `claude-sonnet-4-6` as the model ID for all Claude SDK calls
- Enable prompt caching on all system prompts exceeding 1000 tokens
- Never use `process.exit()` in agent code — throw typed errors
- All database writes go through Prisma — no raw SQL
- All file storage goes through MinIO client — no local filesystem for assets
- SSE endpoint must handle client disconnects gracefully
- Every API route must write an `AuditLog` record for mutating operations
- Rate limiter in `agents/_core/rate-limiter.ts` must be checked before every channel agent `post()` call
