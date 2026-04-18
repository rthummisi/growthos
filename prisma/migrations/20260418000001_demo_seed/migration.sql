-- Demo seed data — runs once via prisma migrate deploy, never again
-- Safe to re-run: all inserts use ON CONFLICT DO NOTHING

-- Product
INSERT INTO "Product" ("id", "name", "url", "githubUrl", "description", "icp", "why", "createdAt", "updatedAt")
VALUES (
  'demo-product-1',
  'GrowthOS',
  'https://github.com/rthummisi/growthos',
  'https://github.com/rthummisi/growthos',
  'AI-powered PLG distribution engine for developer tools. Automates content creation, scheduling, and tracking across 19 channels.',
  'Developer tool founders, indie hackers, OSS maintainers',
  'Manual distribution across 19 channels is a full-time job. GrowthOS automates it.',
  NOW(), NOW()
) ON CONFLICT ("id") DO NOTHING;

-- Channels
INSERT INTO "Channel" ("id", "slug", "name", "productId", "createdAt", "updatedAt") VALUES
  ('demo-ch-hn',  'hackernews',  'Hacker News',   'demo-product-1', NOW(), NOW()),
  ('demo-ch-gh',  'github',      'GitHub',         'demo-product-1', NOW(), NOW()),
  ('demo-ch-rd',  'reddit',      'Reddit',         'demo-product-1', NOW(), NOW()),
  ('demo-ch-tw',  'twitter',     'Twitter/X',      'demo-product-1', NOW(), NOW()),
  ('demo-ch-ph',  'producthunt', 'Product Hunt',   'demo-product-1', NOW(), NOW()),
  ('demo-ch-dt',  'devto',       'Dev.to',         'demo-product-1', NOW(), NOW()),
  ('demo-ch-li',  'linkedin',    'LinkedIn',       'demo-product-1', NOW(), NOW()),
  ('demo-ch-ih',  'indiehackers','Indie Hackers',  'demo-product-1', NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

-- Placement suggestions
INSERT INTO "PlacementSuggestion" ("id", "productId", "channelId", "title", "type", "body", "viralityScore", "effortScore", "audienceFit", "reasoning", "status", "createdAt", "updatedAt") VALUES
(
  'demo-sug-1', 'demo-product-1', 'demo-ch-hn',
  'Show HN: GrowthOS – AI agent swarm that distributes your dev tool across 19 channels',
  'post',
  E'Hey HN! I built GrowthOS after spending 3 months manually posting my last tool across Hacker News, Reddit, Dev.to, and Product Hunt.\n\nGrowthOS is an AI agent swarm that:\n- Analyses your product URL and GitHub repo\n- Scores 19 distribution channels for your specific product\n- Writes fully-formed, channel-native placements (no templates)\n- Puts them in an approval queue — nothing posts without your OK\n- Tracks clicks → signups → activations via UTM links\n\nThe key insight: each channel has a completely different voice. A Show HN post sounds nothing like a Reddit post or a Dev.to article. Most tools just blast the same copy everywhere. GrowthOS adapts.\n\nWould love feedback on the channel scoring — how do you decide which channels to prioritise for a new dev tool launch?',
  87, 12, 94,
  'HN is the highest-fit channel for developer tools. Show HN posts with technical depth and honest tradeoffs perform best.',
  'pending', NOW(), NOW()
),
(
  'demo-sug-2', 'demo-product-1', 'demo-ch-rd',
  'Built an AI that writes and tracks all my dev tool''s distribution content',
  'post',
  E'Long-time lurker, occasional poster. I launched a few dev tools last year and the distribution was honestly brutal.\n\nI''d spend 2–3 hours writing a HN post, a Reddit post, a Dev.to article, a Twitter thread — all for the same product. And I never knew which channel actually drove signups.\n\nSo I built GrowthOS. It:\n1. Reads your product URL + GitHub README\n2. Scores 19 channels for fit (0–100) based on your actual product\n3. Writes fully-formed content per channel — not templates, real copy\n4. Approval gate — you review everything before it posts\n5. UTM tracking so you see which channels convert\n\nHappy to share the approach if anyone''s interested.',
  72, 8, 81,
  'r/SideProject and r/programming are strong fits for tools that help other builders.',
  'approved', NOW(), NOW()
),
(
  'demo-sug-3', 'demo-product-1', 'demo-ch-dt',
  'How I automated developer tool distribution with an AI agent swarm',
  'article',
  E'## The Problem\n\nEvery time I launched a developer tool, I faced the same exhausting process: write a HN post, adapt it for Reddit, turn it into a Dev.to article, create a Twitter thread...\n\n## The Solution: GrowthOS\n\nGrowthOS is an AI agent swarm that handles the full distribution workflow.\n\n**Phase 1:** Product Understanding — fetches your URL and README, Claude builds a product profile.\n**Phase 2:** Channel Discovery — 19 channels scored for fit.\n**Phase 3:** Content Generation — fully-written placements per channel.\n**Phase 4:** Approval Gate — everything waits for your review.\n**Phase 5:** Tracking — UTM links feed a real funnel: Clicks → Signups → Activations.\n\n## Results\n\nFirst launch with GrowthOS: 3x more channel coverage, 60% less time on distribution.',
  68, 15, 78,
  'Long-form technical articles perform well on Dev.to, especially how-it-works pieces.',
  'pending', NOW(), NOW()
),
(
  'demo-sug-4', 'demo-product-1', 'demo-ch-tw',
  'Twitter thread: How GrowthOS works',
  'thread',
  E'1/ I spent 3 months manually distributing my dev tools across HN, Reddit, Dev.to, Product Hunt.\n\nThen I built GrowthOS to automate all of it. Here''s how it works 🧵\n\n2/ The problem: every channel has completely different norms.\n\nA Show HN post ≠ a Reddit post ≠ a Dev.to article.\n\n3/ GrowthOS solves this with an AI agent swarm:\n\n① Fetch your URL + GitHub README\n② Score 19 channels for fit (0–100)\n③ Write channel-native content — real copy, not templates\n④ Approval gate — nothing posts without your OK\n⑤ UTM tracking → real funnel data\n\n4/ Result: 3x more channels covered, 60% less time on distribution.\n\nFull code on GitHub → github.com/rthummisi/growthos',
  79, 5, 85,
  'Technical founders share tools on Twitter. Threads with a clear story outperform single posts.',
  'pending', NOW(), NOW()
)
ON CONFLICT ("id") DO NOTHING;

-- Performance metrics
INSERT INTO "PerformanceMetric" ("id", "productId", "channelId", "metricKey", "metricValue", "rawData", "fetchedAt", "createdAt", "updatedAt") VALUES
  (gen_random_uuid(), 'demo-product-1', 'demo-ch-hn', 'points',      247,  '{"source":"demo"}'::jsonb, NOW(), NOW(), NOW()),
  (gen_random_uuid(), 'demo-product-1', 'demo-ch-gh', 'stars',       183,  '{"source":"demo"}'::jsonb, NOW(), NOW(), NOW()),
  (gen_random_uuid(), 'demo-product-1', 'demo-ch-rd', 'upvotes',     142,  '{"source":"demo"}'::jsonb, NOW(), NOW(), NOW()),
  (gen_random_uuid(), 'demo-product-1', 'demo-ch-tw', 'impressions', 8900, '{"source":"demo"}'::jsonb, NOW(), NOW(), NOW()),
  (gen_random_uuid(), 'demo-product-1', 'demo-ch-dt', 'views',       2100, '{"source":"demo"}'::jsonb, NOW(), NOW(), NOW()),
  (gen_random_uuid(), 'demo-product-1', 'demo-ch-ph', 'votes',       89,   '{"source":"demo"}'::jsonb, NOW(), NOW(), NOW()),
  (gen_random_uuid(), 'demo-product-1', 'demo-ch-li', 'reach',       3400, '{"source":"demo"}'::jsonb, NOW(), NOW(), NOW());

-- UTM tracking
INSERT INTO "UtmTracking" ("id", "productId", "channelSlug", "utmSource", "utmMedium", "utmCampaign", "clicks", "signups", "activations", "createdAt", "updatedAt") VALUES
  (gen_random_uuid(), 'demo-product-1', 'hackernews',  'hackernews',  'social', 'demo-launch', 847,  134, 89, NOW(), NOW()),
  (gen_random_uuid(), 'demo-product-1', 'github',      'github',      'social', 'demo-launch', 612,  98,  71, NOW(), NOW()),
  (gen_random_uuid(), 'demo-product-1', 'reddit',      'reddit',      'social', 'demo-launch', 423,  67,  41, NOW(), NOW()),
  (gen_random_uuid(), 'demo-product-1', 'twitter',     'twitter',     'social', 'demo-launch', 1240, 89,  52, NOW(), NOW()),
  (gen_random_uuid(), 'demo-product-1', 'devto',       'devto',       'social', 'demo-launch', 318,  44,  28, NOW(), NOW()),
  (gen_random_uuid(), 'demo-product-1', 'producthunt', 'producthunt', 'social', 'demo-launch', 567,  112, 78, NOW(), NOW());

-- Competitors
INSERT INTO "Competitor" ("id", "productId", "name", "url", "channelsPresent", "gapScore", "createdAt", "updatedAt") VALUES
  (gen_random_uuid(), 'demo-product-1', 'Posthog',  'https://posthog.com',   ARRAY['hackernews','twitter','github'],       72, NOW(), NOW()),
  (gen_random_uuid(), 'demo-product-1', 'Plausible', 'https://plausible.io', ARRAY['hackernews','reddit','devto'],          64, NOW(), NOW()),
  (gen_random_uuid(), 'demo-product-1', 'Segment',  'https://segment.com',   ARRAY['linkedin','twitter','producthunt'],    51, NOW(), NOW())
ON CONFLICT DO NOTHING;
