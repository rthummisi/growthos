-- Demo seed data — runs once via prisma migrate deploy, never again
-- Safe to re-run: all inserts use ON CONFLICT DO NOTHING

-- Organisation + Project (required parents for Product)
INSERT INTO "Organization" ("id", "name", "createdAt")
VALUES ('demo-org-1', 'GrowthOS Demo', NOW())
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Project" ("id", "orgId", "name", "createdAt")
VALUES ('demo-project-1', 'demo-org-1', 'GrowthOS', NOW())
ON CONFLICT ("id") DO NOTHING;

-- Product
INSERT INTO "Product" ("id", "projectId", "url", "githubUrl", "description", "icp", "plgWedge", "whyDevsShare", "createdAt")
VALUES (
  'demo-product-1',
  'demo-project-1',
  'https://github.com/rthummisi/growthos',
  'https://github.com/rthummisi/growthos',
  'AI-powered PLG distribution engine for developer tools. Automates content creation, scheduling, and tracking across 19 channels.',
  'Developer tool founders, indie hackers, OSS maintainers',
  'Manual distribution across 19 channels is a full-time job. GrowthOS automates it.',
  'Saves hours per week, surfaces which channels actually convert, handles the writing.',
  NOW()
) ON CONFLICT ("id") DO NOTHING;

-- Channels (no productId — global lookup table)
-- Use DO NOTHING to skip on either id or slug conflicts
INSERT INTO "Channel" ("id", "slug", "name") VALUES
  ('demo-ch-hn',  'hackernews',   'Hacker News')   ON CONFLICT DO NOTHING;
INSERT INTO "Channel" ("id", "slug", "name") VALUES
  ('demo-ch-gh',  'github',       'GitHub')         ON CONFLICT DO NOTHING;
INSERT INTO "Channel" ("id", "slug", "name") VALUES
  ('demo-ch-rd',  'reddit',       'Reddit')         ON CONFLICT DO NOTHING;
INSERT INTO "Channel" ("id", "slug", "name") VALUES
  ('demo-ch-tw',  'twitter',      'Twitter/X')      ON CONFLICT DO NOTHING;
INSERT INTO "Channel" ("id", "slug", "name") VALUES
  ('demo-ch-ph',  'producthunt',  'Product Hunt')   ON CONFLICT DO NOTHING;
INSERT INTO "Channel" ("id", "slug", "name") VALUES
  ('demo-ch-dt',  'devto',        'Dev.to')         ON CONFLICT DO NOTHING;
INSERT INTO "Channel" ("id", "slug", "name") VALUES
  ('demo-ch-li',  'linkedin',     'LinkedIn')       ON CONFLICT DO NOTHING;
INSERT INTO "Channel" ("id", "slug", "name") VALUES
  ('demo-ch-ih',  'indiehackers', 'Indie Hackers')  ON CONFLICT DO NOTHING;

-- Placement suggestions — use subselect so we get the real channel id regardless of seed order
INSERT INTO "PlacementSuggestion" (
  "id", "productId", "channelId", "title", "type", "body",
  "viralityScore", "effortScore", "audienceFit", "timeToValue",
  "reasoning", "status", "createdAt"
) VALUES
(
  'demo-sug-1', 'demo-product-1', (SELECT "id" FROM "Channel" WHERE "slug" = 'hackernews' LIMIT 1),
  'Show HN: GrowthOS – AI agent swarm that distributes your dev tool across 19 channels',
  'post',
  E'Hey HN! I built GrowthOS after spending 3 months manually posting my last tool across Hacker News, Reddit, Dev.to, and Product Hunt.\n\nGrowthOS is an AI agent swarm that:\n- Analyses your product URL and GitHub repo\n- Scores 19 distribution channels for your specific product\n- Writes fully-formed, channel-native placements (no templates)\n- Puts them in an approval queue — nothing posts without your OK\n- Tracks clicks → signups → activations via UTM links\n\nThe key insight: each channel has a completely different voice. A Show HN post sounds nothing like a Reddit post or a Dev.to article. Most tools just blast the same copy everywhere. GrowthOS adapts.\n\nWould love feedback on the channel scoring — how do you decide which channels to prioritise for a new dev tool launch?',
  87, 12, 94, 3,
  'HN is the highest-fit channel for developer tools. Show HN posts with technical depth and honest tradeoffs perform best.',
  'pending', NOW()
),
(
  'demo-sug-2', 'demo-product-1', (SELECT "id" FROM "Channel" WHERE "slug" = 'reddit' LIMIT 1),
  'Built an AI that writes and tracks all my dev tool''s distribution content',
  'post',
  E'Long-time lurker, occasional poster. I launched a few dev tools last year and the distribution was honestly brutal.\n\nI''d spend 2–3 hours writing a HN post, a Reddit post, a Dev.to article, a Twitter thread — all for the same product. And I never knew which channel actually drove signups.\n\nSo I built GrowthOS. It:\n1. Reads your product URL + GitHub README\n2. Scores 19 channels for fit (0–100) based on your actual product\n3. Writes fully-formed content per channel — not templates, real copy\n4. Approval gate — you review everything before it posts\n5. UTM tracking so you see which channels convert\n\nHappy to share the approach if anyone''s interested.',
  72, 8, 81, 2,
  'r/SideProject and r/programming are strong fits for tools that help other builders.',
  'approved', NOW()
),
(
  'demo-sug-3', 'demo-product-1', (SELECT "id" FROM "Channel" WHERE "slug" = 'devto' LIMIT 1),
  'How I automated developer tool distribution with an AI agent swarm',
  'article',
  E'## The Problem\n\nEvery time I launched a developer tool, I faced the same exhausting process.\n\n## The Solution: GrowthOS\n\nGrowthOS is an AI agent swarm that handles the full distribution workflow.\n\n**Phase 1:** Product Understanding\n**Phase 2:** Channel Discovery — 19 channels scored for fit.\n**Phase 3:** Content Generation — fully-written placements per channel.\n**Phase 4:** Approval Gate — everything waits for your review.\n**Phase 5:** Tracking — UTM links feed a real funnel.',
  68, 15, 78, 5,
  'Long-form technical articles perform well on Dev.to, especially how-it-works pieces.',
  'pending', NOW()
),
(
  'demo-sug-4', 'demo-product-1', (SELECT "id" FROM "Channel" WHERE "slug" = 'twitter' LIMIT 1),
  'Twitter thread: How GrowthOS works',
  'thread',
  E'1/ I spent 3 months manually distributing my dev tools across HN, Reddit, Dev.to, Product Hunt.\n\nThen I built GrowthOS to automate all of it.\n\n2/ GrowthOS solves this with an AI agent swarm:\n① Fetch your URL + GitHub README\n② Score 19 channels for fit\n③ Write channel-native content\n④ Approval gate\n⑤ UTM tracking → real funnel data',
  79, 5, 85, 1,
  'Technical founders share tools on Twitter. Threads with a clear story outperform single posts.',
  'pending', NOW()
)
ON CONFLICT ("id") DO NOTHING;

-- Performance metrics
INSERT INTO "PerformanceMetric" ("id", "productId", "channelId", "metricKey", "metricValue", "rawData", "fetchedAt") VALUES
  (gen_random_uuid(), 'demo-product-1', (SELECT "id" FROM "Channel" WHERE "slug"='hackernews'  LIMIT 1), 'points',      247,  '{"source":"demo"}'::jsonb, NOW()),
  (gen_random_uuid(), 'demo-product-1', (SELECT "id" FROM "Channel" WHERE "slug"='github'      LIMIT 1), 'stars',       183,  '{"source":"demo"}'::jsonb, NOW()),
  (gen_random_uuid(), 'demo-product-1', (SELECT "id" FROM "Channel" WHERE "slug"='reddit'      LIMIT 1), 'upvotes',     142,  '{"source":"demo"}'::jsonb, NOW()),
  (gen_random_uuid(), 'demo-product-1', (SELECT "id" FROM "Channel" WHERE "slug"='twitter'     LIMIT 1), 'impressions', 8900, '{"source":"demo"}'::jsonb, NOW()),
  (gen_random_uuid(), 'demo-product-1', (SELECT "id" FROM "Channel" WHERE "slug"='devto'       LIMIT 1), 'views',       2100, '{"source":"demo"}'::jsonb, NOW()),
  (gen_random_uuid(), 'demo-product-1', (SELECT "id" FROM "Channel" WHERE "slug"='producthunt' LIMIT 1), 'votes',       89,   '{"source":"demo"}'::jsonb, NOW()),
  (gen_random_uuid(), 'demo-product-1', (SELECT "id" FROM "Channel" WHERE "slug"='linkedin'    LIMIT 1), 'reach',       3400, '{"source":"demo"}'::jsonb, NOW());

-- UTM tracking
INSERT INTO "UtmTracking" ("id", "productId", "channelSlug", "utmSource", "utmMedium", "utmCampaign", "clicks", "signups", "activations", "createdAt") VALUES
  (gen_random_uuid(), 'demo-product-1', 'hackernews',  'hackernews',  'social', 'demo-launch', 847,  134, 89, NOW()),
  (gen_random_uuid(), 'demo-product-1', 'github',      'github',      'social', 'demo-launch', 612,  98,  71, NOW()),
  (gen_random_uuid(), 'demo-product-1', 'reddit',      'reddit',      'social', 'demo-launch', 423,  67,  41, NOW()),
  (gen_random_uuid(), 'demo-product-1', 'twitter',     'twitter',     'social', 'demo-launch', 1240, 89,  52, NOW()),
  (gen_random_uuid(), 'demo-product-1', 'devto',       'devto',       'social', 'demo-launch', 318,  44,  28, NOW()),
  (gen_random_uuid(), 'demo-product-1', 'producthunt', 'producthunt', 'social', 'demo-launch', 567,  112, 78, NOW());

-- Competitors
INSERT INTO "Competitor" ("id", "productId", "name", "url", "presence", "gaps", "scannedAt") VALUES
  (gen_random_uuid(), 'demo-product-1', 'Posthog',   'https://posthog.com',   '["hackernews","twitter","github"]'::jsonb,        '["reddit","indiehackers"]'::jsonb, NOW()),
  (gen_random_uuid(), 'demo-product-1', 'Plausible', 'https://plausible.io',  '["hackernews","reddit","devto"]'::jsonb,           '["twitter","producthunt"]'::jsonb, NOW()),
  (gen_random_uuid(), 'demo-product-1', 'Segment',   'https://segment.com',   '["linkedin","twitter","producthunt"]'::jsonb,      '["hackernews","github"]'::jsonb,   NOW());
