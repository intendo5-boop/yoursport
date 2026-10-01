"use client"

import { useEffect, useMemo, useState } from "react"
import { Search, SlidersHorizontal, MapPinOff, Loader2 } from "lucide-react"
import { PlayerShell } from "@/components/shells/player-shell"
import { VenueCard } from "@/components/venue/venue-card"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { PriceRange } from "@/components/ui/price-range"
import { useSportFilter } from "@/components/sport-context"
import { CITIES } from "@/lib/mock-data"
import { adaptVenue } from "@/lib/adapters"
import type { Venue } from "@/lib/types"

export default function VenuesPage() {
  const { sport } = useSportFilter()
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [city, setCity] = useState("all")
  const [district, setDistrict] = useState("all")
  const [metro, setMetro] = useState("all")
  const [price, setPrice] = useState<[number, number]>([5, 100])
  const [date, setDate] = useState("")

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const res = await fetch("/api/venues")
        const data = await res.json()
        if (!cancelled && data.venues) {
          setVenues(data.venues.map(adaptVenue))
        }
      } catch (err) {
        console.error("Load venues error:", err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const districts = useMemo(
    () => CITIES.find((c) => c.name === city)?.districts ?? [],
    [city],
  )
  const metros = useMemo(
    () => districts.find((d) => d.name === district)?.metros ?? [],
    [districts, district],
  )

  const results = useMemo(() => {
    return venues.filter((v) => {
      if (search && !v.name.toLowerCase().includes(search.toLowerCase())) return false
      if (sport !== "all" && !v.sports.includes(sport)) return false
      if (city !== "all" && v.city !== city) return false
      if (district !== "all" && v.district !== district) return false
      if (metro !== "all" && v.metro !== metro) return false
      if (v.pricePerHour < price[0] || v.pricePerHour > price[1]) return false
      return true
    })
  }, [venues, search, sport, city, district, metro, price])

  const resetFilters = () => {
    setSearch("")
    setCity("all")
    setDistrict("all")
    setMetro("all")
    setPrice([5, 100])
    setDate("")
  }

  return (
    <PlayerShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Find a venue</h1>
          <p className="text-muted-foreground">
            Browse volleyball and football venues and book by the hour.
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search venues by name..."
            className="h-11 pl-10"
          />
        </div>

        <Card className="p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <SlidersHorizontal className="size-4 text-primary" />
            Filters
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col gap-1.5">
              <Label>City</Label>
              <Select
                value={city}
                onChange={(e) => {
                  setCity(e.target.value)
                  setDistrict("all")
                  setMetro("all")
                }}
              >
                <option value="all">All cities</option>
                {CITIES.map((c) => (
                  <option key={c.name}>{c.name}</option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>District</Label>
              <Select
                value={district}
                disabled={city === "all"}
                onChange={(e) => {
                  setDistrict(e.target.value)
                  setMetro("all")
                }}
              >
                <option value="all">All districts</option>
                {districts.map((d) => (
                  <option key={d.name}>{d.name}</option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Metro</Label>
              <Select
                value={metro}
                disabled={district === "all"}
                onChange={(e) => setMetro(e.target.value)}
              >
                <option value="all">All stations</option>
                {metros.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col gap-2 lg:col-span-2">
              <Label>Price per hour</Label>
              <PriceRange min={5} max={100} value={price} onChange={setPrice} className="pt-1.5" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="flex items-end">
              <Button variant="outline" className="h-10 w-full" onClick={resetFilters}>
                Reset filters
              </Button>
            </div>
          </div>
        </Card>

        {loading ? (
          <Card className="flex flex-col items-center gap-3 py-16 text-center">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading venues...</p>
          </Card>
        ) : results.length > 0 ? (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{results.length}</span> venue
                {results.length === 1 ? "" : "s"} found
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((v) => (
                <VenueCard key={v.id} venue={v} />
              ))}
            </div>
          </>
        ) : (
          <Card className="flex flex-col items-center gap-4 py-16 text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <MapPinOff className="size-8" />
            </span>
            <div>
              <p className="text-lg font-semibold">No venues match your filters</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try widening your price range or clearing a location filter.
              </p>
            </div>
            <Button variant="outline" onClick={resetFilters}>
              Clear all filters
            </Button>
          </Card>
        )}
      </div>
    </PlayerShell>
  )
}