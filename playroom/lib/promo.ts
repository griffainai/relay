// The thesis + the community CTA. One place to edit the copy and the link.
export const SCHOOL = {
  name: "Cliefnotes",
  url: "https://www.skool.com/cliefnotes",
  course: "Interpretable Context Methodology",
};

// The beta firewall — capture interest + willingness-to-pay. No backend.
export const BETA = {
  // TODO(owner): paste a Formspree/Tally form URL to collect signups in your inbox.
  // Empty = stored locally in the visitor's browser only (same as the reviews wall).
  endpoint: "",
  headline: "Get your own Relay — your folder, your app.",
  sub: "For solo operators and small teams who actually run the work. We onboard a few at a time.",
  body: "Relay isn't a SaaS you log into — it's the folder plus this open app. The demo you just used IS the app, on mock data. Your version is the same app with your folder dropped in. The hard part is a good folder, so onboarding builds yours with you (from your business, your clients, your voice), you connect your own Claude key, and you run it — on your machine or deployed. Your folder, your key, your data.",
  donate: "Free during the beta. If it earns its keep, an optional monthly donation keeps it going — you only ever pay Anthropic for what Claude does.",
  tiers: [
    { id: "explore", label: "Just exploring" },
    { id: "d5", label: "I'd donate ~$5/mo" },
    { id: "d10", label: "I'd donate ~$10/mo" },
    { id: "more", label: "I'd pay more than that" },
  ],
};

// Illustrative founding members for on-site social proof (seeded, like the reviews
// wall). Real signups append locally; the actual list lives in your form dashboard.
export const FOUNDERS = ["Marcus", "Priya", "Devon", "Sara", "Theo"];

// "The structure is free. The substance is the folder you build."
export const CRAFT = {
  eyebrow: "The part that's actually on you",
  headline: "The platform is the structure. The quality is yours.",
  body: "Relay gives you the board, the lanes, the portals, the autonomy — the structure. But the structure isn't the work. The substance lives in the folder: the context you write, the voice you set, the standards you hold, the examples and taste you put in. Claude is only ever as good as the folder you hand it.",
  sharp: "A thin folder gets thin work. A deep, well-built folder — real standards, real design direction, real examples of “good” — gets you work you'd actually ship. Whether it's copy, a page, or a design, the output quality is set by the folder, not the model. That depth is the craft. That's the real skill.",
  cta: "Learning to build folders this good is the methodology — ICM.",
};
