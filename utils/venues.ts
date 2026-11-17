import locationsData from "~/data/locations.json";

export function getVenueAddress(venueName: string): string | undefined {
  return locationsData.locations.find((location) => location.name === venueName)
    ?.address;
}

export function buildGoogleMapsUrl(address: string, placeId?: string): string {
  const params = new URLSearchParams({ api: "1", query: address });
  if (placeId) params.set("query_place_id", placeId);

  return `https://www.google.com/maps/search/?${params.toString()}`;
}

export function getVenueMapsUrl(
  venueName: string,
  location?: { address?: string; placeId?: string; mapsUrl?: string },
): string | null {
  if (location?.mapsUrl && /^https?:\/\/[^\s\\]+$/i.test(location.mapsUrl))
    return location.mapsUrl;

  const address = location?.address || getVenueAddress(venueName);
  if (!address) return null;

  return buildGoogleMapsUrl(address, location?.placeId);
}
