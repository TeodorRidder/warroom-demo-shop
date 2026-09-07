// Expected errors with an HTTP status (bad input, not found). Answered with 4xx and not reported as crashes.
export class HttpError extends Error {
  name = "HttpError";
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export const json = (body: unknown, status = 200) => Response.json(body, { status });
