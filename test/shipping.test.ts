import assert from "node:assert/strict";
import { test } from "node:test";
import { HttpError } from "../src/http.ts";
import { estimateDelivery } from "../src/routes/shipping.ts";

const url = (country: string) => new URL(`https://shop.test/api/shipping/estimate?country=${country}`);

test("estimates delivery on a business day", () => {
  const result = estimateDelivery(url("se"));
  assert.equal(result.country, "SE");
  const weekday = new Date(`${result.arrives}T12:00:00Z`).getUTCDay();
  assert.ok(weekday >= 1 && weekday <= 5);
  assert.ok(result.arrives > result.shipsOn);
});

test("rejects a country we don't ship to", () => {
  assert.throws(() => estimateDelivery(url("JP")), (e: unknown) => e instanceof HttpError && e.status === 400);
});
