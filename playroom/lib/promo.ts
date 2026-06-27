// The thesis + the community CTA. One place to edit the copy and the link.
export const SCHOOL = {
  name: "Jake's Skool community",          // TODO(owner): confirm the exact community name
  url: "https://www.skool.com/",           // TODO(owner): paste the real invite/community link
  course: "Interpretable Context Methodology",
};

// The beta firewall — capture interest + willingness-to-pay. No backend.
export const BETA = {
  // TODO(owner): paste a Formspree/Tally form URL to collect signups in your inbox.
  // Empty = stored locally in the visitor's browser only (same as the reviews wall).
  endpoint: "",
  headline: "Run Relay on your own folder.",
  sub: "Free during the beta. We onboard a few teams at a time.",
  body: "Point it at your own work: we scaffold the folder from a starter you can edit, you connect your own Claude API key, and you get the whole system — the multiple-businesses, calendar→billing, costs, decisions, and admin you saw locked. It runs on your key, so the work and the data stay yours.",
  donate: "Free to join. If it earns its keep, an optional monthly donation keeps it running — you only ever pay Anthropic for what Claude does.",
  tiers: [
    { id: "explore", label: "Just exploring" },
    { id: "d5", label: "I'd donate ~$5/mo" },
    { id: "d10", label: "I'd donate ~$10/mo" },
    { id: "more", label: "I'd pay more than that" },
  ],
};

// "The structure is free. The substance is the folder you build."
export const CRAFT = {
  eyebrow: "The part that's actually on you",
  headline: "The platform is the structure. The quality is yours.",
  body: "Relay gives you the board, the lanes, the portals, the autonomy — the structure. But the structure isn't the work. The substance lives in the folder: the context you write, the voice you set, the standards you hold, the examples and taste you put in. Claude is only ever as good as the folder you hand it.",
  sharp: "A thin folder gets thin work. A deep, well-built folder — real standards, real design direction, real examples of “good” — gets you work you'd actually ship. Whether it's copy, a page, or a design, the output quality is set by the folder, not the model. That depth is the craft. That's the real skill.",
  cta: "Learning to build folders this good is the methodology — ICM.",
};
