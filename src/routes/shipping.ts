import { SHIPPING_ZONES } from "../data.ts";
import { HttpError } from "../http.ts";

const DAY_MS = 24 * 60 * 60 * 1000;

export function estimateDelivery(url: URL) {
  const country = (url.searchParams.get("country") ?? "").toUpperCase();
  const zone = SHIPPING_ZONES[country];
  if (!zone) throw new HttpError(400, `we don't ship to ${country || "that country"}`);

  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const cutoff = new Date(`${today}T${zone.cutoff}:00Z`);
  const shipsOn = now > cutoff ? new Date(now.getTime() + DAY_MS) : now;
  const arrives = addBusinessDays(shipsOn, zone.days);
  return { country, cutoff: cutoff.toISOString(), shipsOn: shipsOn.toISOString().slice(0, 10), arrives: arrives.toISOString().slice(0, 10) };
}

function addBusinessDays(from: Date, days: number) {
  const date = new Date(from);
  let added = 0;
  while (added < days) {
    date.setUTCDate(date.getUTCDate() + 1);
    const weekday = date.getUTCDay();
    if (weekday !== 0 && weekday !== 6) added++;
  }
  return date;
}
