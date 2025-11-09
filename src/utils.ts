export function calculateAngle(a: any, b: any, c: any) {
  const ab = [a.x - b.x, a.y - b.y];
  const cb = [c.x - b.x, c.y - b.y];
  const dot = ab[0] * cb[0] + ab[1] * cb[1];
  const magAB = Math.sqrt(ab[0] ** 2 + ab[1] ** 2);
  const magCB = Math.sqrt(cb[0] ** 2 + cb[1] ** 2);
  const cosineAngle = dot / (magAB * magCB + 1e-6);
  const angle = Math.acos(Math.min(Math.max(cosineAngle, -1), 1));
  return (angle * 180.0) / Math.PI;
}
