import type { PersonId } from "./types";

export interface Msg {
  id: string;
  author: PersonId | "client" | "guest";
  body: string;
  at: string;
  guestName?: string; // for simulated demo visitors in the lounge
  reactions?: { glyph: string; by: (PersonId | "client")[] }[];
}

export interface Channel {
  id: string;
  name: string;
  kind: "channel" | "dm";
  members: PersonId[];
}

export const CHANNELS: Channel[] = [
  { id: "lounge", name: "# demo-lounge", kind: "channel", members: ["relay"] },
  { id: "studio", name: "# studio", kind: "channel", members: ["jay", "shaq", "relay"] },
  { id: "jay-shaq", name: "Alex & Sam", kind: "dm", members: ["jay", "shaq"] },
  { id: "relay", name: "Relay", kind: "dm", members: ["jay", "relay"] },
];

// simulated demo visitors that drip into the lounge (no backend)
export const AMBIENT: { guestName: string; body: string }[] = [
  { guestName: "Maya", body: "ok the folder-as-source-of-truth thing is actually wild" },
  { guestName: "Devon", body: "wait it really runs the tasks itself? not just tracks them?" },
  { guestName: "Priya", body: "the escalation discipline is the part that sells me tbh" },
  { guestName: "Marcus", body: "just flipped to the client view — clean. they can only ask. love it" },
  { guestName: "Sofia", body: "uploading the folder to Claude and it clears the queue… that's the magic" },
  { guestName: "Theo", body: "how do I point this at my own studio?" },
];

// A client (Dana) only sees her own support thread — never the internal channels.
export const CLIENT_CHANNELS: Channel[] = [
  { id: "support", name: "Relay (support)", kind: "dm", members: ["relay"] },
];

export const SEED_MESSAGES: Record<string, Msg[]> = {
  lounge: [
    { id: "lg1", author: "relay", body: "Welcome to the demo lounge — everyone exploring Relay right now is here. Say hi, or ask me anything.", at: "live" },
    { id: "lg2", author: "guest", guestName: "Jordan", body: "this is way more polished than I expected for a folder", at: "now" },
    { id: "lg3", author: "guest", guestName: "Amara", body: "the View-as toggle showing exec vs client access is slick", at: "now" },
  ],
  studio: [
    { id: "m1", author: "relay", body: "Morning. Swept the board — cleared 3, escalated the Northwind pricing to @jay.", at: "8:43am" },
    { id: "m2", author: "jay", body: "nice. @sam can you stage the pricing page so it's ready when Dana locks the Pro number?", at: "9:02am", reactions: [{ glyph: "👍", by: ["shaq"] }] },
    { id: "m3", author: "shaq", body: "on it. staging now, holding publish.", at: "9:05am" },
  ],
  "jay-shaq": [
    { id: "m4", author: "jay", body: "acme retainer call — you still lean renew?", at: "Mon" },
    { id: "m5", author: "shaq", body: "yeah. they send 2–3 small asks a week. project pricing is leaving money on the table.", at: "Mon" },
  ],
  relay: [
    { id: "m6", author: "jay", body: "what's left on Northwind today?", at: "9:10am" },
    { id: "m7", author: "relay", body: "One needs you: the pricing page (production + money). Everything else is cleared or held.", at: "9:10am" },
  ],
  support: [
    { id: "m8", author: "relay", body: "Hi Dana — drop any request here in plain language and I'll take care of it or pass it to the team.", at: "8:30am" },
    { id: "m9", author: "client", body: "the team photo is out of date, can you swap it?", at: "8:42am" },
    { id: "m10", author: "relay", body: "On it — which photo, and where is it? Once you send it I'll have it swapped.", at: "8:42am" },
  ],
};
