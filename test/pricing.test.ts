import assert from "node:assert/strict";
import { test } from "node:test";
import { HttpError } from "../src/http.ts";
import { priceOrder } from "../src/routes/checkout.ts";

const isHttp = (status: number) => (e: unknown) => e instanceof HttpError && e.status === status;

test("prices a cart in USD with product discounts", () => {
  // p01: 24.90 - 10% = 22.41, p03: 2 x 6.50
  const result = priceOrder({ items: [{ productId: "p01", qty: 1 }, { productId: "p03", qty: 2 }] });
  assert.deepEqual(result, { currency: "USD", total: 35.41 });
});

test("converts the total to EUR", () => {
  const result = priceOrder({ items: [{ productId: "p07", qty: 2 }], currency: "EUR" });
  assert.deepEqual(result, { currency: "EUR", total: 30.36 });
});

test("rejects an empty cart", () => {
  assert.throws(() => priceOrder({ items: [] }), isHttp(400));
});

test("rejects an unsupported currency", () => {
  assert.throws(() => priceOrder({ items: [{ productId: "p01", qty: 1 }], currency: "JPY" }), isHttp(400));
});

test("rejects an unknown product", () => {
  assert.throws(() => priceOrder({ items: [{ productId: "nope", qty: 1 }] }), isHttp(404));
});
