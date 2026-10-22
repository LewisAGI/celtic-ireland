/** Near-duplicate monuments, in kilometres, are drawn apart in screen pixels. */
export const COLOCATION_KM = 0.4;
/** Far enough apart that 44px touch targets do not cover each other. */
export const SPREAD_SEPARATION_PX = 48;

export interface SpreadPoint {
  id: string;
  lat: number;
  lon: number;
  offsetX: number;
  offsetY: number;
}

/** Keep stored coordinates. Offset only the pairs that sit on the same spot. */
export function displayPositions(points: { id: string; lat: number; lon: number }[]): Map<string, SpreadPoint> {
  const parent = points.map((_, index) => index);
  const find = (index: number): number => {
    if (parent[index] !== index) parent[index] = find(parent[index]);
    return parent[index];
  };
  const unite = (a: number, b: number) => {
    parent[find(a)] = find(b);
  };
  for (let i = 0; i < points.length; i += 1) {
    for (let j = i + 1; j < points.length; j += 1) {
      if (distanceKm(points[i], points[j]) <= COLOCATION_KM) unite(i, j);
    }
  }
  const groups = new Map<number, number[]>();
  points.forEach((_, index) => {
    const root = find(index);
    const list = groups.get(root) ?? [];
    list.push(index);
    groups.set(root, list);
  });
  const positions = new Map<string, SpreadPoint>();
  groups.forEach((indexes) => {
    const members = indexes.map((index) => points[index]).sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
    if (members.length === 1) {
      positions.set(members[0].id, { ...members[0], offsetX: 0, offsetY: 0 });
      return;
    }
    const radius = SPREAD_SEPARATION_PX / (2 * Math.sin(Math.PI / members.length));
    members.forEach((point, order) => {
      const angle = (2 * Math.PI * order) / members.length;
      positions.set(point.id, {
        ...point,
        offsetX: radius * Math.cos(angle),
        offsetY: radius * Math.sin(angle),
      });
    });
  });
  return positions;
}

function distanceKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const earth = 6371;
  const φ1 = (a.lat * Math.PI) / 180;
  const φ2 = (b.lat * Math.PI) / 180;
  const dφ = ((b.lat - a.lat) * Math.PI) / 180;
  const dλ = ((b.lon - a.lon) * Math.PI) / 180;
  const h = Math.sin(dφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(dλ / 2) ** 2;
  return 2 * earth * Math.asin(Math.min(1, Math.sqrt(h)));
}
