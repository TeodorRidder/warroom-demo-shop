import { COUPONS } from "../data.ts";

// Returns the coupon's discount in percent.
export function redeemCoupon(code: string) {
  const percent = COUPONS[code];
  if (percent === undefined) throw new Error(`Unknown coupon "${code}"`);
  return percent;
}
