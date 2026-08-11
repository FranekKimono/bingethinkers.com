import venuesData from '~/data/venues.json'

const venueAddresses = venuesData.venues as Record<string, string>

export function getVenueAddress(venueName: string): string | undefined {
  return venueAddresses[venueName]
}

export function buildGoogleMapsUrl(address: string, placeId?: string): string {
  const params = new URLSearchParams({ api: '1', query: address })
  if (placeId) params.set('query_place_id', placeId)

  return `https://www.google.com/maps/search/?${params.toString()}`
}

export function getVenueMapsUrl(
  venueName: string,
  location?: { address?: string; placeId?: string; mapsUrl?: string },
): string | null {
  if (location?.mapsUrl) return location.mapsUrl

  const address = location?.address || getVenueAddress(venueName)
  if (!address) return null

  return buildGoogleMapsUrl(address, location?.placeId)
}
