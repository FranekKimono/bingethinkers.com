import venuesData from '~/data/venues.json'

const venueAddresses = venuesData.venues as Record<string, string>

export function getVenueAddress(venueName: string): string | undefined {
  return venueAddresses[venueName]
}

export function getVenueMapsUrl(venueName: string): string | null {
  const address = getVenueAddress(venueName)
  if (!address) return null

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
}
