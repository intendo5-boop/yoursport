import type {
  Venue as PrismaVenue,
  Event as PrismaEvent,
  Trainer as PrismaTrainer,
} from "@prisma/client"
import type {
  Venue as UIVenue,
  SportEvent,
  Sport,
  EventRegistration,
  MyRegistration,
} from "./types"

export function normalizeDate(raw: unknown): string {
  if (!raw) return ""
  const d = typeof raw === "string" ? new Date(raw) : (raw as Date)
  if (!d || isNaN(d.getTime())) return ""
  return d.toISOString().slice(0, 10)
}

export function adaptVenue(
  db: PrismaVenue & { provider?: { name: string; phone: string | null } | null }
): UIVenue {
  return {
    id: db.id,
    name: db.name,
    sports: db.sportTypes as Sport[],
    city: db.city,
    district: db.district ?? "",
    metro: db.metro ?? "",
    address: db.address,
    surface: db.surface ?? "",
    pricePerHour: Number(db.pricePerHour),
    images: db.photos.length > 0 ? db.photos : ["/placeholder.svg"],
    description: db.description ?? "",
    providerName: db.provider?.name ?? "Unknown provider",
    providerPhone: db.provider?.phone ?? "",
    nextSlot: db.nextSlot ?? "—",
    amenities: db.amenities,
    moderationStatus: db.moderationStatus,
    rejectionReason: db.rejectionReason ?? null,
    publicBooking: db.isPublicForRent,
    cancellationDeadlineHours: db.cancellationDeadlineHours,
  }
}

export function adaptTrainer(db: PrismaTrainer) {
  return {
    id: db.id,
    name: db.name,
    photo: db.photo ?? "",
    experience: db.experience ?? "",
  }
}

export function adaptEvent(
  db: PrismaEvent & {
    venue?: { name: string } | null
    trainer?: PrismaTrainer | null
    _count?: { registrations: number }
    registrations?: Array<{ status: string }>
  }
): SportEvent {
  const eventDate = normalizeDate(db.eventDate)

  const trainerName = db.trainer?.name ?? db.trainerName ?? ""
  const trainerPhoto = db.trainer?.photo ?? db.trainerPhoto ?? ""
  const trainerExperience = db.trainer?.experience ?? db.trainerExperience ?? ""

  let registered = db.registered
  if (Array.isArray(db.registrations)) {
    registered = db.registrations.filter((r) => r.status === "confirmed").length
  } else if (db._count?.registrations !== undefined) {
    registered = db._count.registrations
  }

  return {
    id: db.id,
    title: db.title,
    type: db.type,
    sport: db.sportType as Sport,
    level: db.level ?? "any",
    specializations: db.specializations,
    date: eventDate,
    startTime: db.startTime,
    endTime: db.endTime,
    venueId: db.venueId,
    venueName: db.venue?.name ?? "Venue TBD",
    trainer: {
      id: db.trainerId ?? undefined,
      name: trainerName,
      photo: trainerPhoto,
      experience: trainerExperience,
    },
    price: Number(db.price),
    capacity: db.capacity,
    registered,
    levelBreakdown: [],
    registrationDeadlineHours: db.registrationDeadlineHours,
    cancellationDeadlineHours: db.cancellationDeadlineHours,
    seriesId: db.seriesId ?? undefined,
    recurring: db.recurring,
    description: db.description ?? "",
  }
}

export function adaptRegistration(
  db: {
    id: string
    eventId: string
    playerId: string
    status: string
    createdAt: Date | string
    cancelledAt: Date | string | null
    player: {
      name: string
      email: string
      phone: string | null
      sportLevels?: Array<{ sportType: string; level: string }>
    }
  },
  sportType: Sport
): EventRegistration {
  const createdAt =
    typeof db.createdAt === "string"
      ? db.createdAt
      : (db.createdAt as Date).toISOString()

  const cancelledAt = db.cancelledAt
    ? typeof db.cancelledAt === "string"
      ? db.cancelledAt
      : (db.cancelledAt as Date).toISOString()
    : null

  const playerLevel =
    db.player.sportLevels?.find((l) => l.sportType === sportType)?.level ?? null

  return {
    id: db.id,
    eventId: db.eventId,
    playerId: db.playerId,
    playerName: db.player.name,
    playerEmail: db.player.email,
    playerPhone: db.player.phone,
    playerLevel,
    status: db.status as "confirmed" | "cancelled",
    createdAt,
    cancelledAt,
  }
}

export function adaptMyRegistration(db: {
  id: string
  eventId: string
  status: string
  createdAt: Date | string
  event: {
    title: string
    sportType: string
    type: string
    eventDate: Date | string
    startTime: string
    endTime: string
    price: unknown
    registrationDeadlineHours: number
    cancellationDeadlineHours: number
    venue: { name: string }
  }
}): MyRegistration {
  const eventDate = normalizeDate(db.event.eventDate)

  const createdAt =
    typeof db.createdAt === "string"
      ? db.createdAt
      : (db.createdAt as Date).toISOString()

  const [hours, minutes] = db.event.startTime.split(":").map(Number)
  const eventDateTime = new Date(`${eventDate}T00:00:00`)
  eventDateTime.setHours(hours, minutes ?? 0, 0, 0)

  const now = new Date()
  const hoursUntilEvent =
    (eventDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)

  const isPast = eventDateTime.getTime() < now.getTime()

  const canCancel =
    !isPast &&
    db.status === "confirmed" &&
    hoursUntilEvent > db.event.cancellationDeadlineHours

  return {
    id: db.id,
    eventId: db.eventId,
    eventTitle: db.event.title,
    eventSport: db.event.sportType as Sport,
    eventType: db.event.type as "training" | "game",
    eventDate,
    startTime: db.event.startTime,
    endTime: db.event.endTime,
    venueName: db.event.venue.name,
    price: Number(db.event.price),
    status: db.status as "confirmed" | "cancelled",
    createdAt,
    past: isPast,
    canCancel,
  }
}