export type Sport = "volleyball" | "football"

export type EventType = "training" | "game"

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "rejected"
  | "cancelled"
  | "completed"

export type RegistrationStatus = "confirmed" | "cancelled"

export type ModerationStatus = "approved" | "pending" | "rejected"

export interface SkillLevel {
  code: string
  label: string
  description: string
}

export interface Venue {
  id: string
  name: string
  sports: Sport[]
  city: string
  district: string
  metro: string
  address: string
  surface: string
  pricePerHour: number
  images: string[]
  description: string
  providerName: string
  providerPhone: string
  nextSlot: string
  amenities: string[]
  moderationStatus: ModerationStatus
  rejectionReason: string | null
  publicBooking: boolean
  cancellationDeadlineHours: number
}

export interface Trainer {
  id?: string
  name: string
  photo: string
  experience: string
}

export interface LevelBreakdown {
  code: string
  count: number
}

export interface SportEvent {
  id: string
  title: string
  type: EventType
  sport: Sport
  level: string
  specializations: string[]
  date: string
  startTime: string
  endTime: string
  venueId: string
  venueName: string
  trainer: Trainer
  price: number
  capacity: number
  registered: number
  levelBreakdown: LevelBreakdown[]
  registrationDeadlineHours: number
  cancellationDeadlineHours: number
  seriesId?: string
  recurring: boolean
  description: string
}

export interface PlayerSportLevel {
  sportType: Sport
  level: string
}

export interface EventRegistration {
  id: string
  eventId: string
  playerId: string
  playerName: string
  playerEmail: string
  playerPhone: string | null
  playerLevel: string | null
  status: RegistrationStatus
  createdAt: string
  cancelledAt: string | null
}

export interface MyRegistration {
  id: string
  eventId: string
  eventTitle: string
  eventSport: Sport
  eventType: EventType
  eventDate: string
  startTime: string
  endTime: string
  venueName: string
  price: number
  status: RegistrationStatus
  createdAt: string
  past: boolean
  canCancel: boolean
}

export interface BookingItem {
  id: string
  kind: "venue" | "event"
  name: string
  sport: Sport
  date: string
  time: string
  location: string
  status: BookingStatus
  past: boolean
}

export interface BookingRequest {
  id: string
  playerName: string
  playerAvatar?: string
  venueName: string
  date: string
  time: string
  comment: string
  price: number
}

export interface PendingProvider {
  id: string
  name: string
  email: string
  phone: string
  submitted: string
  venuesCount: number
}