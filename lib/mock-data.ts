import type {
  Sport,
  SkillLevel,
  Venue,
  SportEvent,
  BookingItem,
  BookingRequest,
  PendingProvider,
} from "./types"

export const SPORT_LABELS: Record<Sport, string> = {
  volleyball: "Volleyball",
  football: "Football",
}

export const SKILL_LEVELS: Record<Sport, SkillLevel[]> = {
  volleyball: [
    { code: "B1", label: "Beginner", description: "New to the sport. Learning basic rules and how to control the ball." },
    { code: "B2", label: "Advanced Beginner", description: "Can serve underarm and keep short rallies going." },
    { code: "B3", label: "Improver", description: "Consistent bump pass and overhand serve, learning positions." },
    { code: "C1", label: "Intermediate", description: "Comfortable in rotations, can set and attack with intent." },
    { code: "C2", label: "Advanced", description: "Strong all-round game, reads the play, competitive league level." },
    { code: "P", label: "Pro / Elite", description: "Regional or national competitive experience." },
  ],
  football: [
    { code: "D1", label: "Beginner", description: "Just starting out. Building comfort with the ball and basic passing." },
    { code: "D2", label: "Advanced Beginner", description: "Can pass, receive and play casual small-sided games." },
    { code: "D3", label: "Improver", description: "Understands positioning, decent first touch and shooting." },
    { code: "E1", label: "Intermediate", description: "Plays regular 7- or 11-a-side, good fitness and tactical sense." },
    { code: "E2", label: "Advanced", description: "Amateur league standard, strong technique and game reading." },
    { code: "P", label: "Pro / Elite", description: "Semi-pro or academy-level experience." },
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

export const VENUES: Venue[] = [
  {
    id: "v1",
    name: "Skyline Volleyball Center",
    sports: ["volleyball"],
    city: "Central City",
    district: "Downtown",
    metro: "Union Square",
    address: "18 Union Square, Downtown, Central City",
    surface: "Hardwood",
    pricePerHour: 32,
    rating: 4.8,
    reviewCount: 126,
    images: ["/venues/volleyball-indoor.png", "/venues/sports-arena.png"],
    description:
      "A premium indoor volleyball facility with three regulation courts, spectator seating, and pro-grade lighting. Ideal for training sessions, league matches, and tournaments.",
    providerName: "Skyline Sports Group",
    providerPhone: "+1 (555) 018-2231",
    nextSlot: "Today 18:00",
    amenities: ["Changing rooms", "Showers", "Parking", "Equipment rental", "Cafe"],
    moderationStatus: "approved",
    publicBooking: true,
  },
  {
    id: "v2",
    name: "Riverside Football Park",
    sports: ["football"],
    city: "Central City",
    district: "Downtown",
    metro: "Riverside",
    address: "5 Riverside Walk, Downtown, Central City",
    surface: "Natural grass",
    pricePerHour: 48,
    rating: 4.6,
    reviewCount: 89,
    images: ["/venues/football-pitch.png", "/venues/stadium-turf.png"],
    description:
      "Full-size natural grass pitch with floodlights and covered dugouts. Booked by amateur clubs and weekend leagues across the city.",
    providerName: "Riverside Athletics",
    providerPhone: "+1 (555) 044-7781",
    nextSlot: "Tomorrow 09:00",
    amenities: ["Floodlights", "Changing rooms", "Parking", "Physio room"],
    moderationStatus: "approved",
    publicBooking: true,
  },
  {
    id: "v3",
    name: "Northgate Arena",
    sports: ["volleyball", "football"],
    city: "Central City",
    district: "Northgate",
    metro: "North Park",
    address: "72 North Park Ave, Northgate, Central City",
    surface: "Multi-surface",
    pricePerHour: 40,
    rating: 4.7,
    reviewCount: 154,
    images: ["/venues/sports-arena.png", "/venues/futsal-hall.png"],
    description:
      "A versatile multi-sport arena that converts between indoor volleyball courts and a futsal pitch. Popular for mixed training academies.",
    providerName: "Northgate Community Sports",
    providerPhone: "+1 (555) 093-1120",
    nextSlot: "Today 20:00",
    amenities: ["Changing rooms", "Showers", "Spectator seating", "Vending"],
    moderationStatus: "approved",
    publicBooking: true,
  },
  {
    id: "v4",
    name: "Marina Beach Courts",
    sports: ["volleyball"],
    city: "Central City",
    district: "Harbor",
    metro: "Marina",
    address: "1 Marina Boardwalk, Harbor, Central City",
    surface: "Sand",
    pricePerHour: 28,
    rating: 4.9,
    reviewCount: 203,
    images: ["/venues/beach-volleyball.png"],
    description:
      "Four professional-grade beach volleyball courts right on the waterfront. Sunset sessions and summer tournaments are a local favorite.",
    providerName: "Harbor Beach Club",
    providerPhone: "+1 (555) 077-5540",
    nextSlot: "Today 17:00",
    amenities: ["Beach showers", "Lockers", "Cafe", "Equipment rental"],
    moderationStatus: "approved",
    publicBooking: true,
  },
  {
    id: "v5",
    name: "Greenwood Futsal Hall",
    sports: ["football"],
    city: "Lakeside",
    district: "Greenwood",
    metro: "Forest Gate",
    address: "44 Willow Road, Greenwood, Lakeside",
    surface: "Synthetic turf",
    pricePerHour: 36,
    rating: 4.5,
    reviewCount: 61,
    images: ["/venues/futsal-hall.png", "/venues/stadium-turf.png"],
    description:
      "Indoor futsal hall with two courts and a shock-absorbing synthetic surface. Great for year-round five-a-side training regardless of weather.",
    providerName: "Greenwood Sports Trust",
    providerPhone: "+1 (555) 061-3390",
    nextSlot: "Tomorrow 19:00",
    amenities: ["Indoor", "Changing rooms", "Parking", "Cafe"],
    moderationStatus: "approved",
    publicBooking: true,
  },
  {
    id: "v6",
    name: "Old Town Stadium",
    sports: ["football"],
    city: "Lakeside",
    district: "Old Town",
    metro: "Market",
    address: "9 Cathedral Lane, Old Town, Lakeside",
    surface: "Hybrid grass",
    pricePerHour: 55,
    rating: 4.4,
    reviewCount: 47,
    images: ["/venues/stadium-turf.png", "/venues/football-pitch.png"],
    description:
      "A compact community stadium with hybrid-grass pitch and 500-seat stands. Perfect for competitive games and academy showcases.",
    providerName: "Old Town FC",
    providerPhone: "+1 (555) 022-8845",
    nextSlot: "Sat 11:00",
    amenities: ["Floodlights", "Stands", "Changing rooms", "Parking"],
    moderationStatus: "approved",
    publicBooking: true,
  },
]

export function getVenue(id: string) {
  return VENUES.find((v) => v.id === id)
}

export function venueName(id: string) {
  return getVenue(id)?.name ?? "Unknown venue"
}

export const EVENTS: SportEvent[] = [
  {
    id: "e1",
    title: "Evening Volleyball Fundamentals",
    type: "training",
    sport: "volleyball",
    level: "B2",
    specializations: ["Passing & Reception", "Serving"],
    date: "2026-09-15",
    startTime: "18:00",
    endTime: "19:30",
    venueId: "v1",
    trainer: {
      name: "Marco Reyes",
      photo: "/trainers/coach-1.png",
      experience: "10 years coaching youth and adult volleyball. Former national league setter.",
    },
    price: 14,
    capacity: 12,
    registered: 9,
    levelBreakdown: [
      { code: "B1", count: 2 },
      { code: "B2", count: 4 },
      { code: "B3", count: 3 },
    ],
    registrationDeadlineHours: 3,
    cancellationDeadlineHours: 12,
    seriesId: "s1",
    recurring: true,
    description:
      "A friendly, structured session focused on clean passing and consistent serving. We warm up together, drill fundamentals, then finish with small-sided game play so you can apply what you practiced.",
  },
  {
    id: "e2",
    title: "Sunday Football Match — 7-a-side",
    type: "game",
    sport: "football",
    level: "E1",
    specializations: ["Tactics & Positioning"],
    date: "2026-09-14",
    startTime: "11:00",
    endTime: "12:30",
    venueId: "v2",
    trainer: {
      name: "Diane Cole",
      photo: "/trainers/coach-2.png",
      experience: "UEFA B licensed coach with 8 years organizing competitive amateur leagues.",
    },
    price: 12,
    capacity: 14,
    registered: 14,
    levelBreakdown: [
      { code: "D3", count: 5 },
      { code: "E1", count: 7 },
      { code: "E2", count: 2 },
    ],
    registrationDeadlineHours: 6,
    cancellationDeadlineHours: 24,
    recurring: false,
    description:
      "Organized 7-a-side match with balanced teams, referees, and bibs provided. Turn up ready to play — we sort teams on arrival to keep games competitive and fun.",
  },
  {
    id: "e3",
    title: "Beach Volleyball Attack Clinic",
    type: "training",
    sport: "volleyball",
    level: "C1",
    specializations: ["Attacking & Spiking", "Beach Volleyball"],
    date: "2026-09-16",
    startTime: "17:00",
    endTime: "19:00",
    venueId: "v4",
    trainer: {
      name: "Marco Reyes",
      photo: "/trainers/coach-1.png",
      experience: "10 years coaching, specializing in beach doubles footwork and attacking.",
    },
    price: 22,
    capacity: 8,
    registered: 5,
    levelBreakdown: [
      { code: "C1", count: 3 },
      { code: "C2", count: 2 },
    ],
    registrationDeadlineHours: 4,
    cancellationDeadlineHours: 12,
    recurring: false,
    description:
      "Sharpen your approach, timing, and shot selection on sand. Small group of eight so everyone gets high-rep feedback from the coach.",
  },
  {
    id: "e4",
    title: "Futsal Skills & Finishing",
    type: "training",
    sport: "football",
    level: "D3",
    specializations: ["Finishing", "Dribbling", "Futsal"],
    date: "2026-09-17",
    startTime: "19:00",
    endTime: "20:30",
    venueId: "v5",
    trainer: {
      name: "Diane Cole",
      photo: "/trainers/coach-2.png",
      experience: "8 years coaching futsal and small-sided game technique.",
    },
    price: 16,
    capacity: 10,
    registered: 6,
    levelBreakdown: [
      { code: "D2", count: 2 },
      { code: "D3", count: 3 },
      { code: "E1", count: 1 },
    ],
    registrationDeadlineHours: 3,
    cancellationDeadlineHours: 12,
    seriesId: "s2",
    recurring: true,
    description:
      "Fast-paced technical session built around close control and finishing in tight spaces. Great for players who want to level up their five-a-side game.",
  },
  {
    id: "e5",
    title: "Competitive Volleyball League Night",
    type: "game",
    sport: "volleyball",
    level: "C2",
    specializations: ["Blocking", "Defense & Digging"],
    date: "2026-09-18",
    startTime: "20:00",
    endTime: "22:00",
    venueId: "v3",
    trainer: {
      name: "Marco Reyes",
      photo: "/trainers/coach-1.png",
      experience: "10 years coaching; runs the city's amateur evening league.",
    },
    price: 18,
    capacity: 12,
    registered: 8,
    levelBreakdown: [
      { code: "C1", count: 3 },
      { code: "C2", count: 4 },
      { code: "P", count: 1 },
    ],
    registrationDeadlineHours: 6,
    cancellationDeadlineHours: 24,
    recurring: true,
    seriesId: "s3",
    description:
      "Full-length competitive 6v6 matches with rotation and refereeing. Best suited to advanced players comfortable in structured game situations.",
  },
  {
    id: "e6",
    title: "Weekend Football Conditioning",
    type: "training",
    sport: "football",
    level: "E2",
    specializations: ["Fitness & Conditioning", "Defending"],
    date: "2026-09-19",
    startTime: "09:00",
    endTime: "10:30",
    venueId: "v6",
    trainer: {
      name: "Diane Cole",
      photo: "/trainers/coach-2.png",
      experience: "UEFA B licensed, strength & conditioning background.",
    },
    price: 15,
    capacity: 16,
    registered: 11,
    levelBreakdown: [
      { code: "E1", count: 4 },
      { code: "E2", count: 6 },
      { code: "P", count: 1 },
    ],
    registrationDeadlineHours: 4,
    cancellationDeadlineHours: 12,
    recurring: false,
    description:
      "High-intensity conditioning tailored to match demands: interval work, defensive shape, and recovery drills to keep you sharp all season.",
  },
]

export function getEvent(id: string) {
  return EVENTS.find((e) => e.id === id)
}

export const PLAYER_BOOKINGS: BookingItem[] = [
  {
    id: "b1",
    kind: "venue",
    name: "Skyline Volleyball Center — Court 2",
    sport: "volleyball",
    date: "2026-09-15",
    time: "18:00 – 19:00",
    location: "Downtown, Central City",
    status: "confirmed",
    past: false,
  },
  {
    id: "b2",
    kind: "event",
    name: "Sunday Football Match — 7-a-side",
    sport: "football",
    date: "2026-09-14",
    time: "11:00 – 12:30",
    location: "Riverside Football Park",
    status: "pending",
    past: false,
  },
  {
    id: "b3",
    kind: "event",
    name: "Beach Volleyball Attack Clinic",
    sport: "volleyball",
    date: "2026-09-16",
    time: "17:00 – 19:00",
    location: "Marina Beach Courts",
    status: "confirmed",
    past: false,
  },
  {
    id: "b4",
    kind: "venue",
    name: "Greenwood Futsal Hall — Court A",
    sport: "football",
    date: "2026-08-30",
    time: "19:00 – 20:00",
    location: "Greenwood, Lakeside",
    status: "completed",
    past: true,
  },
  {
    id: "b5",
    kind: "event",
    name: "Evening Volleyball Fundamentals",
    sport: "volleyball",
    date: "2026-08-25",
    time: "18:00 – 19:30",
    location: "Skyline Volleyball Center",
    status: "completed",
    past: true,
  },
  {
    id: "b6",
    kind: "venue",
    name: "Old Town Stadium — Full pitch",
    sport: "football",
    date: "2026-08-12",
    time: "20:00 – 21:00",
    location: "Old Town, Lakeside",
    status: "cancelled",
    past: true,
  },
]

export const BOOKING_REQUESTS: BookingRequest[] = [
  {
    id: "req1",
    playerName: "Alex Turner",
    venueName: "Skyline Volleyball Center",
    date: "2026-09-15",
    time: "18:00 – 19:00",
    comment: "Booking for our club training. We'll need the net set to competition height.",
    price: 32,
  },
  {
    id: "req2",
    playerName: "Priya Nair",
    venueName: "Skyline Volleyball Center",
    date: "2026-09-16",
    time: "20:00 – 21:00",
    comment: "Casual game with friends, around 10 people.",
    price: 32,
  },
  {
    id: "req3",
    playerName: "Sam Okafor",
    venueName: "Northgate Arena",
    date: "2026-09-17",
    time: "19:00 – 20:00",
    comment: "Would like the futsal configuration if possible.",
    price: 40,
  },
]

export const PENDING_PROVIDERS: PendingProvider[] = [
  {
    id: "p1",
    name: "Eastside Sports Complex",
    email: "ops@eastsidesports.com",
    phone: "+1 (555) 133-8890",
    submitted: "2026-09-11",
    venuesCount: 3,
  },
  {
    id: "p2",
    name: "Hilltop Football Academy",
    email: "admin@hilltopfa.com",
    phone: "+1 (555) 208-4471",
    submitted: "2026-09-12",
    venuesCount: 1,
  },
]

export const PENDING_VENUES: Venue[] = [
  {
    id: "pv1",
    name: "Eastside Indoor Court 1",
    sports: ["volleyball"],
    city: "Central City",
    district: "Northgate",
    metro: "Highfield",
    address: "210 Highfield Road, Northgate, Central City",
    surface: "Hardwood",
    pricePerHour: 30,
    rating: 0,
    reviewCount: 0,
    images: ["/venues/volleyball-indoor.png"],
    description: "Newly renovated indoor court awaiting approval.",
    providerName: "Eastside Sports Complex",
    providerPhone: "+1 (555) 133-8890",
    nextSlot: "—",
    amenities: ["Changing rooms", "Parking"],
    moderationStatus: "pending",
    publicBooking: true,
  },
  {
    id: "pv2",
    name: "Hilltop Training Pitch",
    sports: ["football"],
    city: "Lakeside",
    district: "Greenwood",
    metro: "Oak Hill",
    address: "3 Oak Hill Drive, Greenwood, Lakeside",
    surface: "Synthetic turf",
    pricePerHour: 42,
    rating: 0,
    reviewCount: 0,
    images: ["/venues/football-pitch.png"],
    description: "Floodlit training pitch submitted for review.",
    providerName: "Hilltop Football Academy",
    providerPhone: "+1 (555) 208-4471",
    nextSlot: "—",
    amenities: ["Floodlights", "Parking"],
    moderationStatus: "pending",
    publicBooking: false,
  },
]

/** Provider-owned venues (subset used for provider views) */
export const PROVIDER_VENUES: Venue[] = [
  VENUES[0],
  VENUES[2],
  {
    ...VENUES[3],
    id: "v4b",
    name: "Marina Beach Courts — Court 3",
    moderationStatus: "pending",
  },
]

/** Registered players for a provider's event (expand view) */
export interface RegisteredPlayer {
  name: string
  contact: string
  level: string
}

export const REGISTERED_PLAYERS: RegisteredPlayer[] = [
  { name: "Alex Turner", contact: "alex.t@email.com", level: "B2" },
  { name: "Priya Nair", contact: "priya.n@email.com", level: "B3" },
  { name: "Sam Okafor", contact: "sam.o@email.com", level: "B1" },
  { name: "Lena Vogt", contact: "lena.v@email.com", level: "B2" },
  { name: "Diego Ramos", contact: "diego.r@email.com", level: "B2" },
]

/** Time-slot availability for venue detail (8:00 - 23:00) */
export type SlotStatus = "available" | "booked" | "pending"

export function generateSlots(seed = 1): { time: string; status: SlotStatus }[] {
  const statuses: SlotStatus[] = ["available", "booked", "pending"]
  const slots: { time: string; status: SlotStatus }[] = []
  for (let h = 8; h <= 22; h++) {
    const pseudo = (h * 7 + seed * 13) % 10
    let status: SlotStatus = "available"
    if (pseudo === 2 || pseudo === 5 || pseudo === 8) status = "booked"
    else if (pseudo === 3 || pseudo === 7) status = "pending"
    slots.push({ time: `${String(h).padStart(2, "0")}:00`, status })
  }
  return slots
}

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

/** Platform analytics for the admin dashboard */
export const ANALYTICS = {
  kpis: {
    bookings: { value: 1284, delta: 12.4 },
    activeUsers: { value: 3120, delta: 8.1 },
    revenue: { value: 48250, delta: 15.7 },
    providers: { value: 42, delta: 4.2 },
  },
  bookingsTrend: [
    { month: "Mar", volleyball: 120, football: 90 },
    { month: "Apr", volleyball: 145, football: 110 },
    { month: "May", volleyball: 160, football: 130 },
    { month: "Jun", volleyball: 190, football: 155 },
    { month: "Jul", volleyball: 210, football: 180 },
    { month: "Aug", volleyball: 245, football: 205 },
  ],
  usersByCity: [
    { city: "Central City", users: 1420 },
    { city: "Harbor Town", users: 860 },
    { city: "Riverside", users: 540 },
    { city: "Northgate", users: 300 },
  ],
  sportSplit: [
    { name: "Volleyball", value: 58 },
    { name: "Football", value: 42 },
  ],
}
