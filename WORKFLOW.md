# GrowthOS Workflow

## Starting Point
You have a developer tool. You give GrowthOS your product URL and GitHub repo.

---

## Phase 1 — Understand
```
Product URL + GitHub repo
        ↓
Product Understanding Agent
- Fetches and reads your landing page
- Reads your README and package.json
- Claude extracts: what it does, who it's for, why developers share it, technical depth
        ↓
Product Profile (used by every downstream agent)
```

---

## Phase 2 — Discover
```
Product Profile
        ↓
Channel Discovery Agent
- Claude scores all 19 channels (0–100) for fit with your specific product
- GitHub, HN, Reddit, Twitter, Product Hunt, Dev.to, LinkedIn, Discord,
  Slack, Hashnode, npm, Awesome-lists, Template Platforms, Integration
  Marketplaces, Stack Overflow, Indie Hackers, Lobsters, Bluesky, Newsletter
        ↓
Ranked channel list: "HN: 91, GitHub: 88, Reddit: 79..."
```

---

## Phase 3 — Strategize + Write
```
Top channels
        ↓
Placement Strategy Agent
- For each channel: writes a fully-formed placement (150–400 words)
- No templates — real copy, channel-appropriate tone and format
        ↓
Asset Generation Agent
- 3 distinct variations per placement (enforced <85% word overlap)
- Routes by type: thread, README, pitch email, reply, article
        ↓
Content Variation Agent
- Ensures variations are genuinely different, not just paraphrased
```

---

## Phase 4 — You Approve
```
Dashboard shows each placement:
- Full written content
- Channel + format
- Predicted virality / effort / audience fit scores
- 3 variations to choose from
- Diff view if you edit

► APPROVE → queues for execution
► REJECT  → discarded
► MODIFY  → edit inline, re-queue
```
**Nothing posts without your explicit approval.**

---

## Phase 5 — Schedule
```
Approved placements
        ↓
Launch Sequence Agent
- Claude picks optimal timing
- High-competition channels (HN, PH, Twitter, Reddit) get a shared 2-hour window
  to concentrate upvotes at peak
- Supporting channels (Dev.to, LinkedIn, etc.) scheduled in surrounding hours
        ↓
BullMQ queue with timed execution jobs
```

---

## Phase 6 — Execute
```
Scheduled jobs fire
        ↓
Execution Agent → channel integrations:
- GitHub: commits files, opens PRs on awesome-lists
- Dev.to / Hashnode: publishes articles via API
- npm: README updates
- Product Hunt / LinkedIn / Twitter: posts via authenticated APIs
- Others: drafts ready to copy-paste (Discord, Slack, HN — no bot posting)
        ↓
UTM links embedded in every placement for tracking
```

---

## Phase 7 — Track + Rank
```
Traffic comes in
        ↓
UTM Event Capture → clicks, signups, activations per channel
        ↓
Tracking Dashboard:
- Funnel Chart: clicks → signups → activations → retained (per channel)
- ROI Ranker: 7-day sparklines, trend arrows, which channels are growing
- Channel Effectiveness Grid: click a channel → funnel filters to that channel
        ↓
You know exactly which channels convert, not just which get clicks
```

---

## Phase 8 — Intelligence (runs continuously in parallel)
```
6 agents watching the web at all times:

Competitor Agent     → which channels rivals use that you don't
In-the-Wild Agent    → GitHub Issues asking for tools like yours → draft reply ready
Trend Detection      → rising HN/Reddit topics → maps to your content
Ecosystem Targeting  → awesome-lists and repos to get mentioned in
Influencer Agent     → developer influencers → personalized outreach drafted
Viral Alert          → your post spikes → rapid-response options in 1 hour
```

---

## Phase 9 — Amplify + Repurpose
```
When something gains traction
        ↓
Cross-Channel Amplification Agent
- CHANNEL_AFFINITIES: HN spike → Reddit + Twitter follow-up
- Claude picks the best amplification targets while momentum is live

Content Repurposing Agent
- Takes a winning piece and reformats it for all 19 channels
- Channel-aware: thread for Twitter, long-form for Dev.to, short post for LinkedIn
```

---

## Phase 10 — Demo Generation (for video channels)
```
growthos demo --url http://localhost:3000 --description "..."
        ↓
Claude Haiku writes a 6–10 step narration script
        ↓
Playwright captures screenshots per step
        ↓
edge-tts synthesises narration (Aria + Andrew neural voices, alternating)
        ↓
ffmpeg stitches → demo.mp4 + demo.gif

MP4 → Product Hunt, LinkedIn, marketplaces
GIF → GitHub README, Reddit, Dev.to
```

---

## Net Result

| Without GrowthOS | With GrowthOS |
|---|---|
| Manual research across 19 channels | Scored and ranked automatically |
| Writing content from scratch | Fully-written, channel-native copy |
| Posting blind, no timing strategy | 2-hour launch window, coordinated drops |
| No idea which channels convert | UTM funnel per channel, ROI ranked |
| Missing real-time opportunities | 6 intelligence agents watching 24/7 |
| Demo video takes days | Auto-generated in minutes |
