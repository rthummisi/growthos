export interface TourStep {
  id: string;
  navLabel: string | null;
  page: string;
  title: string;
  description: string;
  narration: string;
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    navLabel: null,
    page: "/",
    title: "Welcome to GrowthOS",
    description: "GrowthOS is your AI-powered PLG distribution engine. It finds the best channels for your developer tool, writes the content, and tracks what converts — all in one place.",
    narration: "Welcome to GrowthOS — your AI-powered distribution engine for developer tools. In the next two minutes, I'll walk you through every feature so you can hit the ground running."
  },
  {
    id: "intake",
    navLabel: "Intake",
    page: "/intake",
    title: "Intake — Tell GrowthOS About Your Product",
    description: "Paste your product URL and GitHub repo. GrowthOS fetches your landing page, README, and package.json — then Claude builds a full product profile used by every downstream agent.",
    narration: "Start here. Paste your product URL and GitHub repo. GrowthOS reads your landing page and README, and Claude builds a product profile that powers everything else."
  },
  {
    id: "opportunities",
    navLabel: "Opportunities",
    page: "/opportunities",
    title: "Opportunities — Where Should You Show Up?",
    description: "Claude scores all 19 channels — Hacker News, Reddit, GitHub, Product Hunt, LinkedIn, and more — ranking them by fit for your specific product. You see exactly which channels to prioritize.",
    narration: "Opportunities shows you which of 19 channels fit your product. Claude scores each one based on your product profile — so you focus effort where you'll actually get traction."
  },
  {
    id: "placements",
    navLabel: "Placements",
    page: "/placements",
    title: "Placements — Fully Written Content, Ready to Go",
    description: "For each top channel, GrowthOS writes a complete placement — a Show HN post, a Twitter thread, a Dev.to article — 150 to 400 words, channel-native format, no placeholders.",
    narration: "Placements are fully written content for each channel. Not templates — real copy. A Show HN post for Hacker News, a numbered thread for Twitter, a long-form article for Dev dot to. All ready to review."
  },
  {
    id: "approvals",
    navLabel: "Approvals",
    page: "/approvals",
    title: "Approvals — You're Always in Control",
    description: "Every piece of content waits here for your review. Approve it, reject it, or edit it inline with a diff view. Nothing gets posted without your explicit sign-off.",
    narration: "Nothing posts without your approval. Review each placement, see three variations, edit inline, and approve with one click. You're always in control of what goes out."
  },
  {
    id: "workspace",
    navLabel: "Workspace",
    page: "/workspace",
    title: "Workspace — Live Execution Status",
    description: "Once approved, placements enter the execution queue. The Workspace shows each job's status in real time — queued, running, completed, or failed — with full audit logs.",
    narration: "The Workspace shows your execution queue in real time. See exactly which placements are running, completed, or failed — with full logs for every action taken."
  },
  {
    id: "assets",
    navLabel: "Assets",
    page: "/assets",
    title: "Assets — Your Content Library",
    description: "Every generated asset lives here — README updates, tweet threads, pitch emails, replies. Edit any asset and re-submit it for approval. Your content history is always searchable.",
    narration: "Assets is your content library. Every generated piece — README updates, threads, articles, emails — lives here. Edit and resubmit anything at any time."
  },
  {
    id: "tracking",
    navLabel: "Tracking",
    page: "/tracking",
    title: "Tracking — Which Channels Actually Convert?",
    description: "UTM links in every placement feed a real funnel: Clicks → Signups → Activations → Retained. The ROI Ranker shows 7-day sparklines per channel so you know what's growing.",
    narration: "Tracking shows your real conversion funnel per channel. Clicks, signups, activations — all from UTM links embedded in every placement. See exactly which channels bring paying users, not just traffic."
  },
  {
    id: "scheduler",
    navLabel: "Scheduler",
    page: "/scheduler",
    title: "Scheduler — Set Your Cadence",
    description: "Configure how often GrowthOS runs for each channel — daily, twice daily, or weekly. The agent swarm runs on your schedule, keeps content fresh, and avoids platform spam filters.",
    narration: "The Scheduler sets how often GrowthOS runs per channel. Daily for high-traffic channels, weekly for slower ones. The system respects platform anti-spam rules automatically."
  },
  {
    id: "competitors",
    navLabel: "Competitors",
    page: "/competitors",
    title: "Competitors — Find the Gaps",
    description: "GrowthOS identifies your actual competitors and maps where they're active. The heatmap shows channels where rivals dominate and where you have an opening — prioritised by impact.",
    narration: "Competitors maps where your rivals are active across all 19 channels. The heatmap shows gaps — channels where competitors are strong but you're absent — ranked by opportunity."
  },
  {
    id: "in-the-wild",
    navLabel: "In the Wild",
    page: "/in-the-wild",
    title: "In the Wild — Catch Live Opportunities",
    description: "Real-time feed of GitHub Issues, Reddit threads, and Stack Overflow questions where people are asking for tools exactly like yours. Each one comes with a drafted reply, ready to post.",
    narration: "In the Wild catches live conversations where people ask for tools like yours — GitHub Issues, Reddit threads, Stack Overflow questions. Every match includes a drafted reply you can post immediately."
  },
  {
    id: "alerts",
    navLabel: "Alerts",
    page: "/alerts",
    title: "Alerts — When Something Spikes, Act Fast",
    description: "When one of your placements unexpectedly gains traction, the Viral Alert agent fires within minutes. It gives you three rapid-response options to amplify the momentum before it fades.",
    narration: "Alerts fire when a post unexpectedly spikes. The Viral Alert agent gives you three rapid-response options within minutes — so you can amplify momentum before it fades."
  },
  {
    id: "launch",
    navLabel: "Launch",
    page: "/launch",
    title: "Launch — Coordinate the Drop",
    description: "For competitive channels like Hacker News, Product Hunt, Twitter and Reddit, the Launch Sequence planner concentrates all activity into a 2-hour window to maximise upvotes and attention.",
    narration: "The Launch Sequence planner coordinates your multi-channel drop. Competitive channels — Hacker News, Product Hunt, Twitter, Reddit — all go live in a 2-hour window to concentrate votes and attention."
  },
  {
    id: "ready",
    navLabel: null,
    page: "/intake",
    title: "You're Ready — Start With Intake",
    description: "That's the full GrowthOS workflow. Start by adding your product in Intake. GrowthOS will understand it, score 19 channels, write placements, and get them in your approval queue — usually in under 2 minutes.",
    narration: "That's everything. Start by adding your product URL in Intake. GrowthOS will analyse it, score all 19 channels, write fully-formed placements, and put them in your approval queue — usually in under two minutes. Let's go."
  }
];
