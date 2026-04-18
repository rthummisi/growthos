#!/usr/bin/env npx ts-node
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.product.findUnique({ where: { id: "demo-product-1" } });
  if (existing) {
    console.log("Demo data already exists — skipping.");
    return;
  }
  console.log("Seeding demo data...");

  // Product
  const product = await prisma.product.upsert({
    where: { id: "demo-product-1" },
    update: {},
    create: {
      id: "demo-product-1",
      name: "GrowthOS",
      url: "https://github.com/rthummisi/growthos",
      githubUrl: "https://github.com/rthummisi/growthos",
      description: "AI-powered PLG distribution engine for developer tools. Automates content creation, scheduling, and tracking across 19 channels.",
      icp: "Developer tool founders, indie hackers, OSS maintainers",
      why: "Manual distribution across 19 channels is a full-time job. GrowthOS automates it."
    }
  });

  // Channels
  const channelData = [
    { slug: "hackernews", name: "Hacker News" },
    { slug: "github", name: "GitHub" },
    { slug: "reddit", name: "Reddit" },
    { slug: "twitter", name: "Twitter/X" },
    { slug: "producthunt", name: "Product Hunt" },
    { slug: "devto", name: "Dev.to" },
    { slug: "linkedin", name: "LinkedIn" },
    { slug: "indiehackers", name: "Indie Hackers" }
  ];

  const channels: Record<string, { id: string }> = {};
  for (const ch of channelData) {
    const channel = await prisma.channel.upsert({
      where: { slug: ch.slug },
      update: {},
      create: { slug: ch.slug, name: ch.name, productId: product.id }
    });
    channels[ch.slug] = channel;
  }

  // Placement suggestions
  const suggestions = [
    {
      id: "demo-sug-1",
      channelSlug: "hackernews",
      title: "Show HN: GrowthOS – AI agent swarm that distributes your dev tool across 19 channels",
      type: "post",
      body: `Hey HN! I built GrowthOS after spending 3 months manually posting my last tool across Hacker News, Reddit, Dev.to, and Product Hunt. It was exhausting and inconsistent.\n\nGrowthOS is an AI agent swarm that:\n- Analyses your product URL and GitHub repo\n- Scores 19 distribution channels for your specific product\n- Writes fully-formed, channel-native placements (no templates)\n- Puts them in an approval queue — nothing posts without your OK\n- Tracks clicks → signups → activations via UTM links\n\nThe key insight: each channel has a completely different voice. A Show HN post sounds nothing like a Reddit r/SideProject post or a Dev.to article. Most tools just blast the same copy everywhere. GrowthOS adapts.\n\nBacked by Claude claude-sonnet-4-6 with prompt caching to keep costs low.\n\nWould love feedback on the channel scoring — how do you decide which channels to prioritise for a new dev tool launch?`,
      viralityScore: 87,
      effortScore: 12,
      audienceFit: 94,
      reasoning: "HN is the highest-fit channel for developer tools. Show HN posts with technical depth and honest tradeoffs perform best.",
      status: "pending"
    },
    {
      id: "demo-sug-2",
      channelSlug: "reddit",
      title: "Built an AI that writes and tracks all my dev tool's distribution content",
      type: "post",
      body: `Long-time lurker, occasional poster. I launched a few dev tools last year and the distribution was honestly brutal.\n\nI'd spend 2–3 hours writing a HN post, a Reddit post, a Dev.to article, a Twitter thread — all for the same product. And I never knew which channel actually drove signups.\n\nSo I built GrowthOS. It:\n1. Reads your product URL + GitHub README\n2. Scores 19 channels for fit (0–100) based on your actual product\n3. Writes fully-formed content per channel — not templates, real copy\n4. Approval gate — you review everything before it posts\n5. UTM tracking so you see which channels convert\n\nThe channel scoring was the hardest part. Hacker News wants technical depth and honest tradeoffs. Reddit needs community-specific framing. Product Hunt needs a punchy tagline and gallery. Getting Claude to understand these nuances took a lot of iteration.\n\nHappy to share the approach if anyone's interested. Also open to feedback — what channels do you prioritise when launching a new tool?`,
      viralityScore: 72,
      effortScore: 8,
      audienceFit: 81,
      reasoning: "r/SideProject and r/programming are strong fits for tools that help other builders.",
      status: "approved"
    },
    {
      id: "demo-sug-3",
      channelSlug: "devto",
      title: "How I automated developer tool distribution with an AI agent swarm",
      type: "article",
      body: `## The Problem\n\nEvery time I launched a developer tool, I faced the same exhausting process: write a Hacker News post, adapt it for Reddit, turn it into a Dev.to article, create a Twitter thread, set up a Product Hunt launch...\n\nEach platform has completely different norms. A Show HN post that performs well reads nothing like a successful Reddit post. Getting this right manually takes days.\n\n## The Solution: GrowthOS\n\nI built GrowthOS — an AI agent swarm that handles the full distribution workflow.\n\n### How It Works\n\n**Phase 1: Product Understanding**\nGrowthOS fetches your product URL and GitHub README. Claude builds a product profile — what it does, who it's for, why developers share it.\n\n**Phase 2: Channel Discovery**\n19 channels scored for fit: Hacker News, Reddit, GitHub, Product Hunt, Dev.to, Twitter, LinkedIn, Indie Hackers, and more.\n\n**Phase 3: Content Generation**\nFully-written placements per channel. Not templates — real copy adapted to each platform's format and culture.\n\n**Phase 4: Approval Gate**\nEverything waits for your review. Approve, reject, or edit inline.\n\n**Phase 5: Tracking**\nUTM links in every placement feed a real funnel: Clicks → Signups → Activations.\n\n## Results\n\nFirst launch with GrowthOS: 3x more channel coverage, 60% less time spent on distribution.\n\nThe full code is on GitHub. Happy to answer questions in the comments.`,
      viralityScore: 68,
      effortScore: 15,
      audienceFit: 78,
      reasoning: "Long-form technical articles perform well on Dev.to, especially how-it-works pieces.",
      status: "pending"
    },
    {
      id: "demo-sug-4",
      channelSlug: "twitter",
      title: "Twitter thread: How GrowthOS works",
      type: "thread",
      body: `1/ I spent 3 months manually distributing my dev tools across HN, Reddit, Dev.to, Product Hunt, LinkedIn.\n\nThen I built GrowthOS to automate all of it. Here's how it works 🧵\n\n2/ The problem: every channel has completely different norms.\n\nA Show HN post ≠ a Reddit post ≠ a Dev.to article ≠ a Twitter thread.\n\nMost people copy-paste the same text everywhere. It shows, and it doesn't work.\n\n3/ GrowthOS solves this with an AI agent swarm:\n\n① Fetch your URL + GitHub README\n② Score 19 channels for fit (0–100)\n③ Write channel-native content — real copy, not templates\n④ Approval gate — nothing posts without your OK\n⑤ UTM tracking → real funnel data\n\n4/ The channel scoring was the hardest part.\n\nHN wants: technical depth, honest tradeoffs, a specific question for discussion\nReddit wants: community framing, genuine story\nProduct Hunt wants: punchy tagline, gallery, early supporters\n\nGetting Claude to know this took a lot of work.\n\n5/ The result: 3x more channels covered, 60% less time on distribution.\n\nAnd for the first time, I know which channels actually drive signups (not just clicks).\n\nFull code on GitHub → github.com/rthummisi/growthos`,
      viralityScore: 79,
      effortScore: 5,
      audienceFit: 85,
      reasoning: "Technical founders share tools on Twitter. Threads with a clear story outperform single posts.",
      status: "pending"
    }
  ];

  for (const s of suggestions) {
    const channel = channels[s.channelSlug];
    if (!channel) continue;
    await prisma.placementSuggestion.upsert({
      where: { id: s.id },
      update: {},
      create: {
        id: s.id,
        productId: product.id,
        channelId: channel.id,
        title: s.title,
        type: s.type,
        body: s.body,
        viralityScore: s.viralityScore,
        effortScore: s.effortScore,
        audienceFit: s.audienceFit,
        reasoning: s.reasoning,
        status: s.status as "pending" | "approved" | "rejected"
      }
    });
  }

  // Performance metrics
  const metricData = [
    { channelSlug: "hackernews", metricKey: "points", metricValue: 247 },
    { channelSlug: "github", metricKey: "stars", metricValue: 183 },
    { channelSlug: "reddit", metricKey: "upvotes", metricValue: 142 },
    { channelSlug: "twitter", metricKey: "impressions", metricValue: 8900 },
    { channelSlug: "devto", metricKey: "views", metricValue: 2100 },
    { channelSlug: "producthunt", metricKey: "votes", metricValue: 89 },
    { channelSlug: "linkedin", metricKey: "reach", metricValue: 3400 }
  ];

  for (const m of metricData) {
    const channel = channels[m.channelSlug];
    if (!channel) continue;
    await prisma.performanceMetric.create({
      data: {
        productId: product.id,
        channelId: channel.id,
        metricKey: m.metricKey,
        metricValue: m.metricValue,
        rawData: { source: "demo" }
      }
    });
  }

  // UTM tracking
  const utmData = [
    { channelSlug: "hackernews", clicks: 847, signups: 134, activations: 89 },
    { channelSlug: "github", clicks: 612, signups: 98, activations: 71 },
    { channelSlug: "reddit", clicks: 423, signups: 67, activations: 41 },
    { channelSlug: "twitter", clicks: 1240, signups: 89, activations: 52 },
    { channelSlug: "devto", clicks: 318, signups: 44, activations: 28 },
    { channelSlug: "producthunt", clicks: 567, signups: 112, activations: 78 }
  ];

  for (const u of utmData) {
    await prisma.utmTracking.create({
      data: {
        productId: product.id,
        channelSlug: u.channelSlug,
        utmSource: u.channelSlug,
        utmMedium: "social",
        utmCampaign: "demo-launch",
        clicks: u.clicks,
        signups: u.signups,
        activations: u.activations
      }
    });
  }

  // Competitors
  await prisma.competitor.createMany({
    skipDuplicates: true,
    data: [
      { productId: product.id, name: "Posthog", url: "https://posthog.com", channelsPresent: ["hackernews", "twitter", "github"], gapScore: 72 },
      { productId: product.id, name: "Plausible", url: "https://plausible.io", channelsPresent: ["hackernews", "reddit", "devto"], gapScore: 64 },
      { productId: product.id, name: "Segment", url: "https://segment.com", channelsPresent: ["linkedin", "twitter", "producthunt"], gapScore: 51 }
    ]
  });

  console.log(`✓ Demo product created: ${product.id}`);
  console.log(`✓ ${channelData.length} channels`);
  console.log(`✓ ${suggestions.length} placement suggestions`);
  console.log(`✓ ${metricData.length} performance metrics`);
  console.log(`✓ ${utmData.length} UTM tracking rows`);
  console.log(`✓ 3 competitors`);
  console.log(`\nOpen the dashboard at: http://localhost:4010?productId=demo-product-1`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
