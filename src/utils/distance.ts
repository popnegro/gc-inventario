import { Coordinates } from '../types';

/**
 * Calculates the great-circle distance between two geographic points
 * using the Haversine formula.
 *
 * @param coord1 First coordinate pair (latitude/longitude)
 * @param coord2 Second coordinate pair (latitude/longitude)
 * @returns Distance in kilometers
 */
export function calculateDistance(
  coord1: Coordinates,
  coord2: Coordinates
): number {
  const EARTH_RADIUS_KM = 6371;
  const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const dLng = ((coord2.lng - coord1.lng) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.lat * Math.PI) / 180) *
      Math.cos((coord2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

/**
 * Formats a distance in kilometers or meters for Argentine / Latin American users.
 *
 * @param distanceKm Distance in kilometers
 * @returns Human-readable string (e.g. '850 m' or '3,2 km')
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    return `${meters} m`;
  }
  return `${distanceKm.toFixed(1).replace('.', ',')} km`;
}
