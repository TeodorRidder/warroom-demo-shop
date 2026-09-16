import assert from "node:assert/strict";
import { test } from "node:test";
import { PRODUCTS } from "../src/data.ts";
import { HttpError } from "../src/http.ts";
import { listProducts, searchProducts } from "../src/routes/catalog.ts";

const url = (path: string) => new URL(`https://shop.test/api${path}`);

test("listProducts returns at most one page of products", () => {
  const result = listProducts(url("/products?page=1"));
  assert.equal(result.page, 1);
  assert.equal(result.pages, Math.ceil(PRODUCTS.length / 5));
  assert.ok(result.items.length > 0 && result.items.length <= 5);
});

test("listProducts rejects a page below 1", () => {
  assert.throws(() => listProducts(url("/products?page=0")), (e: unknown) => e instanceof HttpError && e.status === 400);
});

test("searchProducts matches on the product name", () => {
  const result = searchProducts(url("/search?q=beans"));
  assert.ok(result.items.length > 0);
  for (const p of result.items) assert.match(p.name.toLowerCase(), /beans/);
});

test("searchProducts applies a category filter", () => {
  const filter = encodeURIComponent(JSON.stringify({ category: "milk" }));
  const result = searchProducts(url(`/search?q=&filter=${filter}`));
  assert.ok(result.items.length > 0);
  for (const p of result.items) assert.equal(p.category, "milk");
});
