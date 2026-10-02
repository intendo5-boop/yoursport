import type { Sport, SkillLevel } from "./types"

export const SPORT_LABELS: Record<Sport, string> = {
  volleyball: "Volleyball",
  football: "Football",
}

export const SKILL_LEVELS: Record<Sport, SkillLevel[]> = {
  volleyball: [
    {
      code: "B1",
      label: "Beginner",
      description: "New to the sport. Learning basic rules and how to control the ball.",
    },
    {
      code: "B2",
      label: "Advanced Beginner",
      description: "Can serve underarm and keep short rallies going.",
    },
    {
      code: "B3",
      label: "Improver",
      description: "Consistent bump pass and overhand serve, learning positions.",
    },
    {
      code: "C1",
      label: "Intermediate",
      description: "Comfortable in rotations, can set and attack with intent.",
    },
    {
      code: "C2",
      label: "Advanced",
      description: "Strong all-round game, reads the play, competitive league level.",
    },
    {
      code: "P",
      label: "Pro / Elite",
      description: "Regional or national competitive experience.",
    },
  ],
  football: [
    {
      code: "D1",
      label: "Beginner",
      description: "Just starting out. Building comfort with the ball and basic passing.",
    },
    {
      code: "D2",
      label: "Advanced Beginner",
      description: "Can pass, receive and play casual small-sided games.",
    },
    {
      code: "D3",
      label: "Improver",
      description: "Understands positioning, decent first touch and shooting.",
    },
    {
      code: "E1",
      label: "Intermediate",
      description: "Plays regular 7- or 11-a-side, good fitness and tactical sense.",
    },
    {
      code: "E2",
      label: "Advanced",
      description: "Amateur league standard, strong technique and game reading.",
    },
    {
      code: "P",
      label: "Pro / Elite",
      description: "Semi-pro or academy-level experience.",
    },
  ],
}

export const SPECIALIZATIONS: Record<Sport, string[]> = {
  volleyball: [
    "Serving",
    "Passing & Reception",
    "Setting",
    "Attacking & Spiking",
    "Blocking",
    "Defense & Digging",
    "Beach Volleyball",
  ],
  football: [
    "Finishing",
    "Dribbling",
    "Passing & Vision",
    "Defending",
    "Goalkeeping",
    "Fitness & Conditioning",
    "Tactics & Positioning",
    "Futsal",
  ],
}

export interface City {
  name: string
  districts: { name: string; metros: string[] }[]
}

export const CITIES: City[] = [
  {
    name: "Central City",
    districts: [
      { name: "Downtown", metros: ["Union Square", "City Hall", "Riverside"] },
      { name: "Northgate", metros: ["North Park", "Highfield", "Elm Street"] },
      { name: "Harbor", metros: ["Marina", "Dockyard", "Bayview"] },
    ],
  },
  {
    name: "Lakeside",
    districts: [
      { name: "Old Town", metros: ["Cathedral", "Market", "Fountain"] },
      { name: "Greenwood", metros: ["Forest Gate", "Willow", "Oak Hill"] },
    ],
  },
]

export function formatDate(iso: string) {
  const d = new Date(iso + "T00:00:00")
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
}

export function skillLabel(sport: Sport, code: string) {
  const level = SKILL_LEVELS[sport].find((l) => l.code === code)
  return level ? `${level.code} · ${level.label}` : code
}