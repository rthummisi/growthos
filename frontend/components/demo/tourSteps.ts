import type { Route } from "next";

export interface TourStep {
  id: string;
  navLabel: string | null;
  page: Route;
  title: string;
  description: string;
  narration: string;
  dwellMs: number; // minimum time to stay on this card after narration ends
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    navLabel: null,
    page: "/",
    title: "Welcome to GrowthOS",
    description: "GrowthOS is your AI-powered PLG distribution engine. It finds the best channels for your developer tool, writes the content, gets your approval, and tracks what actually converts — all in one place. This tour covers every section in about three minutes.",
    narration: "Welcome to GrowthOS — your AI-powered distribution engine for developer tools. Most founders spend weeks manually posting across Hacker News, Reddit, Product Hunt, and a dozen other channels. GrowthOS automates that entire workflow. In the next few minutes, I'll walk you through every section so you can start distributing your own product by the time we're done.",
    dwellMs: 6000
  },
  {
    id: "intake",
    navLabel: "Intake",
    page: "/intake",
    title: "Intake — Tell GrowthOS About Your Product",
    description: "Paste your product URL and GitHub repo. GrowthOS fetches your landing page, strips the HTML, reads your README and package.json, and builds a complete product profile — what it does, who it's for, why developers share it. This profile drives every downstream agent.",
    narration: "Start here with Intake. You paste your product URL and GitHub repository, and GrowthOS does the rest. It fetches your landing page, reads your README, and analyses your package dot json. From that, it builds a detailed product profile — what the tool does, who the ideal customer is, and what makes developers want to share it. That profile is used by every agent downstream, so the better your landing page explains the product, the better everything else performs.",
    dwellMs: 6000
  },
  {
    id: "opportunities",
    navLabel: "Opportunities",
    page: "/opportunities",
    title: "Opportunities — Which Channels Fit Your Product?",
    description: "GrowthOS scores all 21 channels from 0 to 100 based on your specific product profile. Hacker News, Reddit, GitHub, Product Hunt, LinkedIn, Twitter, Dev.to, Indie Hackers, Instagram Reels, YouTube Shorts, and more — each ranked by how well your product matches the audience and format of that platform.",
    narration: "The Opportunities page shows you which of 21 channels fit your product. GrowthOS scores each channel from zero to a hundred — not generically, but based on your specific product profile. A developer productivity tool might score ninety-one on Hacker News, eighty on GitHub, and even higher on YouTube Shorts if a quick visual demo is the clearest way to explain the value. These scores tell you exactly where to focus your effort, so you're not wasting time on channels that won't convert for your particular product.",
    dwellMs: 6000
  },
  {
    id: "placements",
    navLabel: "Placements",
    page: "/placements",
    title: "Placements — Fully Written Content Per Channel",
    description: "For each top-scoring channel, GrowthOS writes a complete, channel-native placement. A Show HN post for Hacker News. A numbered thread for Twitter. A long-form article for Dev.to. Each one is 150 to 400 words, written in the voice and format that performs on that platform — no placeholders, no templates.",
    narration: "Placements are the fully written content GrowthOS creates for each channel. And when I say fully written, I mean it — not templates with brackets to fill in. A Show HN post that opens with the right hook and ends with a question to drive discussion. A Twitter thread with numbered tweets under 280 characters each. A Dev.to article with proper headings and a technical narrative. Each piece is written specifically for how that platform works and what that audience responds to. You can see the full text, the predicted virality score, the effort score, and the audience fit rating before you decide whether to approve it.",
    dwellMs: 7000
  },
  {
    id: "approvals",
    navLabel: "Approvals",
    page: "/approvals",
    title: "Approvals — Nothing Posts Without Your Sign-Off",
    description: "Every generated placement enters your approval queue. You see the full content, three distinct variations, and a diff view if you want to edit. Approve it, reject it, or modify it inline. GrowthOS is the writer — you are the editor. Nothing goes live without your explicit approval.",
    narration: "The Approvals queue is where you stay in control. Every piece of content GrowthOS generates waits here for your review. You see the full written placement, you can switch between three distinct variations — each genuinely different, not just paraphrased — and you can edit the text inline with a diff view that shows exactly what changed. Approve with one click, reject with one click, or rewrite it yourself and re-submit. GrowthOS is the first draft machine. You are the editor. Nothing goes live without your explicit sign-off.",
    dwellMs: 7000
  },
  {
    id: "workspace",
    navLabel: "Workspace",
    page: "/workspace",
    title: "Workspace — Live Execution Status",
    description: "Once you approve a placement, it enters the execution queue. The Workspace shows every job's real-time status — queued, running, completed, or failed — with full audit logs for every action taken. You can see exactly what was posted, when, and what the response was.",
    narration: "The Workspace is your execution cockpit. After you approve a placement, it gets queued for execution — the appropriate integration fires, whether that's committing a README to GitHub, publishing an article to Dev.to, or submitting a Product Hunt launch. The Workspace shows every job in real time: queued, running, completed, or failed. If something fails, the error is logged here with enough detail to understand why. Every action is fully auditable.",
    dwellMs: 6000
  },
  {
    id: "assets",
    navLabel: "Assets",
    page: "/assets",
    title: "Assets — Your Content Library",
    description: "Every generated asset lives here — README updates, tweet threads, pitch emails, replies, articles. You can edit any asset and resubmit it for approval. Your entire content history is searchable, so you can repurpose and reuse what already worked.",
    narration: "Assets is your content library. Every piece GrowthOS has ever generated for your product lives here — Show HN posts, tweet threads, Dev.to articles, pitch emails, reply drafts. You can open any asset, edit it, and send it back through the approval queue. This is particularly useful for repurposing: if a Hacker News post performed well, you can adapt it into a Reddit post from here without starting from scratch. Nothing gets lost.",
    dwellMs: 6000
  },
  {
    id: "playbook",
    navLabel: "Playbook",
    page: "/playbook" as Route,
    title: "Playbook — Turn Learning Into Strategy",
    description: "The Playbook Engine converts ROI, channel performance, and live intent data into concrete operating moves. GrowthOS tells you which channel to scale, which one to reduce, and which live opportunity should be turned into an approval-ready reply right now.",
    narration: "The Playbook is where GrowthOS stops being a dashboard and starts acting like an operating system. It looks at real ROI, live opportunity data, and channel cadence, then generates specific moves you can apply immediately. Scale the channels that are converting. Reduce the channels that are absorbing effort without payoff. Turn the best live opportunity into an approval-ready reply with one click. This is the layer that transforms scattered metrics into a real growth strategy.",
    dwellMs: 7000
  },
  {
    id: "tracking",
    navLabel: "Tracking",
    page: "/tracking",
    title: "Tracking — Which Channels Actually Convert?",
    description: "Every placement gets UTM links embedded automatically. The Tracking dashboard now turns that into a closed loop: ROI score, best channel, pipeline totals, and per-channel conversion rates from Clicks → Signups → Activations → Retained.",
    narration: "Tracking is where GrowthOS becomes a learning system instead of a posting tool. Every placement gets UTM parameters automatically, so every click is tied back to its source channel. The dashboard then rolls that into a real ROI view: your best-performing channel, the current pipeline from clicks to activations, and the conversion efficiency of each channel. This is the feedback loop that tells GrowthOS where to double down next week and which channels are generating attention without real business impact.",
    dwellMs: 7000
  },
  {
    id: "scheduler",
    navLabel: "Scheduler",
    page: "/scheduler",
    title: "Scheduler — Set Your Distribution Cadence",
    description: "Configure how often GrowthOS runs per channel — daily, twice daily, or weekly. The agent swarm respects each platform's anti-spam rules automatically. Set it once and GrowthOS keeps distributing on your behalf, refreshing content so it never goes stale.",
    narration: "The Scheduler lets you configure how often GrowthOS runs for each channel. High-traffic channels like Twitter and Reddit can run daily. Slower channels like Indie Hackers or newsletters can run weekly. GrowthOS automatically respects each platform's posting norms — it knows that posting to Hacker News more than once a week looks spammy and adjusts accordingly. Set your cadence once, and GrowthOS keeps the distribution engine running without you having to think about it.",
    dwellMs: 6000
  },
  {
    id: "competitors",
    navLabel: "Competitors",
    page: "/competitors",
    title: "Competitors — Find the Gaps They're Leaving",
    description: "GrowthOS identifies your actual competitors and maps their channel presence across all 21 platforms. The heatmap shows where rivals are dominant and where they're absent — revealing the channels you can own before they get there.",
    narration: "The Competitors section gives you intelligence on where your rivals are active. GrowthOS identifies the actual competing products and maps their presence across all 21 channels. The heatmap makes the gaps obvious: if your three main competitors are all strong on Hacker News and Twitter but absent on Indie Hackers, YouTube Shorts, and Stack Overflow, those are the channels you should prioritise. You can build an audience there before they arrive. Channel gaps are one of the highest-value things to act on early.",
    dwellMs: 6000
  },
  {
    id: "in-the-wild",
    navLabel: "In the Wild",
    page: "/in-the-wild",
    title: "In the Wild — Catch Live Buyer Conversations",
    description: "Real-time feed of product-specific GitHub Issues, Reddit threads, Hacker News discussions, Stack Overflow questions, and more where people are already asking for a tool like yours. Each match comes with a fully drafted reply and market-signal context.",
    narration: "In the Wild is one of the strongest features in GrowthOS because it captures intent that already exists. You select the product you want to monitor, and GrowthOS searches GitHub Issues, Reddit, Stack Overflow, Hacker News, and other live sources for conversations where that product is genuinely the answer. When it finds one, it gives you the thread, the reason it matches, a drafted reply, and a market-signal layer that helps you spot repeated patterns. These are high-intent conversations happening right now, not speculative content ideas.",
    dwellMs: 7000
  },
  {
    id: "alerts",
    navLabel: "Alerts",
    page: "/alerts",
    title: "Alerts — Act Fast When Something Spikes",
    description: "When a placement unexpectedly gains traction, the Viral Alert fires within minutes. You get three rapid-response options — a follow-up thread, a cross-post to a related channel, or an amplification reply — designed to be executed while the momentum is still live.",
    narration: "Alerts fire when one of your posts unexpectedly spikes. Viral momentum is extremely time-sensitive — a Hacker News post that hits the front page has a window of about two to four hours where amplification efforts have real impact. When GrowthOS detects a spike, it immediately generates three rapid-response options: a follow-up thread, a cross-post to the highest-affinity channel, or a reply that adds more value to the thread driving the spike. The goal is to act within the hour, while the momentum is still live.",
    dwellMs: 7000
  },
  {
    id: "launch",
    navLabel: "Launch",
    page: "/launch",
    title: "Launch — Coordinate a Multi-Channel Drop",
    description: "The Launch Sequence planner is approval-gated by default. It only sequences approved placements, assigns concrete time windows, and coordinates high-competition channels into a focused launch window with supporting content around it.",
    narration: "The Launch Sequence planner is designed for coordinated releases without breaking the approval-first model. It only operates on placements you have already approved. From there, GrowthOS groups the core launch channels into a tight window, places supporting content before and after that moment, and saves a real launch calendar with concrete times. That gives you the leverage of orchestration without letting the system schedule unreviewed content.",
    dwellMs: 7000
  },
  {
    id: "ready",
    navLabel: null,
    page: "/intake",
    title: "You're Ready — Start With Intake",
    description: "That's the complete GrowthOS workflow. Add your product URL in Intake and GrowthOS will understand it, score 21 channels, write fully-formed placements, and fill your approval queue — typically in under two minutes. Everything you just saw will be populated with your real product data.",
    narration: "That's the complete GrowthOS workflow. You've seen every section — from understanding your product, to scoring channels, writing placements, getting your approval, executing across platforms, tracking what converts, and responding to live opportunities and viral moments. Now it's your turn. Head to Intake, paste your product URL and GitHub repository, and GrowthOS will do the analysis. Within two minutes you'll have real channel scores and fully written placements waiting in your approval queue, including short-form video plans for channels like YouTube Shorts and Instagram Reels when they fit. Everything you just saw in this tour will be populated with your actual product data. Let's go.",
    dwellMs: 8000
  }
];
