import ky from 'ky';

/**
 * Base URL for the Yandex geocoding API. When using this API you must
 * specify the format and your API key on each request.
 */
const YA_GEOCODER = 'https://geocode-maps.yandex.ru/1.x';

/**
 * Geocode a city query into a list of candidate localities with
 * coordinates. The API returns both the name of the locality and the
 * description, which typically contains the country and region.
 *
 * @param query Name of the city to search for.
 * @param apiKey Your Yandex geocoder API key.
 * @returns A promise resolving to an array of results with name,
 *          country (description), latitude and longitude.
 */
export async function geocodeCity(query: string, apiKey: string) {
  const url = `${YA_GEOCODER}?format=json&apikey=${apiKey}&geocode=${encodeURIComponent(query)}&kind=locality&results=5`;
  const res: any = await ky.get(url).json();
  const members = res?.response?.GeoObjectCollection?.featureMember ?? [];
  return members.map((m: any) => {
    const obj = m.GeoObject;
    const [lng, lat] = obj.Point.pos.split(' ').map(Number);
    return {
      name: obj.name,
      country: obj.description,
      lat,
      lng
    };
  });
}

/**
 * Geocode a specific place within a city. This helper uses the
 * combined search of place and city to improve accuracy.
 *
 * @param place Name of the point of interest.
 * @param city Name of the city in which the place resides.
 * @param apiKey Yandex geocoder API key.
 * @returns Coordinates and address of the place, or null if not found.
 */
export async function geocodePlaceInCity(place: string, city: string, apiKey: string) {
  const query = `${place}, ${city}`;
  const url = `${YA_GEOCODER}?format=json&apikey=${apiKey}&geocode=${encodeURIComponent(query)}&results=1`;
  const res: any = await ky.get(url).json();
  const obj = res?.response?.GeoObjectCollection?.featureMember?.[0]?.GeoObject;
  if (!obj) return null;
  const [lng, lat] = obj.Point.pos.split(' ').map(Number);
  const address = `${obj.name}, ${obj.description}`;
  return { lat, lng, address };
}

/**
 * Calculate the Haversine distance between two geographic points in
 * kilometres. This is used to decide whether the user is located
 * within a certain radius of the selected city.
 *
 * @param a The first point with latitude and longitude.
+ * @param b The second point with latitude and longitude.
 * @returns The distance between the two points in kilometres.
 */
export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371; // Earth radius in kilometres
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const s1 = Math.sin(dLat / 2) ** 2;
  const s2 = Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s1 + s2));
}