// Payment provider client. The provider is simulated in this environment: no real money moves.
const TIMEOUT_MS = 400;

export class PaymentTimeoutError extends Error {
  name = "PaymentTimeoutError";
}

export async function charge(amount: number, currency: string) {
  const latencyMs = providerLatency();
  if (latencyMs > TIMEOUT_MS) throw new PaymentTimeoutError(`payment provider did not answer within ${TIMEOUT_MS} ms`);
  return { id: `pay_${crypto.randomUUID().slice(0, 8)}`, amount, currency, latencyMs: Math.round(latencyMs) };
}

// Simulated provider latency, modelled on their status page.
function providerLatency() {
  return Math.random() < 0.88 ? 80 + Math.random() * 220 : 350 + Math.random() * 900;
}
