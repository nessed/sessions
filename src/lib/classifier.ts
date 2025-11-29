import { Section } from "@/lib/types";

const ORDERED_SECTIONS: Section[] = [
  "idea",
  "writing",
  "recording",
  "production",
  "mixing",
  "mastering",
  "release",
];

const KEYWORDS: Record<Section, string[]> = {
  idea: ["idea", "concept", "vibe", "theme", "mood", "reference", "inspo"],
  writing: [
    "write",
    "lyric",
    "lyrics",
    "verse",
    "hook",
    "chorus",
    "bars",
    "rewrite",
    "flow",
    "cadence",
  ],
  recording: [
    "record",
    "retake",
    "take",
    "mic",
    "vocal",
    "vocals",
    "adlib",
    "adlibs",
    "doubles",
  ],
  production: [
    "beat",
    "drums",
    "bass",
    "chords",
    "synth",
    "pad",
    "drop",
    "fx",
    "arrangement",
    "structure",
    "transition",
  ],
  mixing: [
    "eq",
    "harsh",
    "muddy",
    "reverb",
    "delay",
    "compression",
    "sidechain",
    "levels",
    "balance",
    "sibilance",
  ],
  mastering: ["master", "limiting", "loudness", "final export", "bounce"],
  release: [
    "cover",
    "artwork",
    "upload",
    "release",
    "distribution",
    "promo",
    "final version",
    "track order",
  ],
};

const OVERRIDE_REGEX =
  /[@#](idea|writing|recording|production|mixing|mastering|release)\b/i;

export const detectOverride = (input: string): Section | null => {
  const match = input.match(OVERRIDE_REGEX);
  if (!match) return null;
  const category = match[1].toLowerCase() as Section;
  return category;
};

export const detectCategory = (input: string): Section => {
  const override = detectOverride(input);
  if (override) return override;

  const lower = input.toLowerCase();
  for (const section of ORDERED_SECTIONS) {
    const keywords = KEYWORDS[section];
    if (keywords.some((keyword) => lower.includes(keyword))) {
      return section;
    }
  }
  return "idea";
};

export const stripTags = (input: string): string => {
  return input.replace(OVERRIDE_REGEX, "").trim();
};
