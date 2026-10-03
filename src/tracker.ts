// Error tracking: groups crashes into issues and reports each issue to War Room as one incident.
//
// - First crash of an issue → POST /api/incidents (War Room opens a room and the agent writes a triage report).
// - Later crashes are counted and sent once a minute → POST /api/incidents/<id>/occurrences { add, perMinute }.
// - An issue whose incident was resolved in War Room is closed; if it crashes again, a new incident opens.
// Without WARROOM_URL + WARROOM_INGEST_TOKEN the issues are only logged and listed at /api/errors.
import { DurableObject } from "cloudflare:workers";

export type Severity = "SEV1" | "SEV2" | "SEV3";

export type CapturedError = {
  fingerprint: string;
  title: string;
  errorName: string;
  message: string;
  stack?: string;
  route: string; // "POST /api/checkout"
  handler: string;
  file: string;
  severity: Severity;
  region: string;
  at: number;
};

type Issue = {
  key: string;
  title: string;
  route: string;
  errorName: string;
  message: string;
  severity: Severity;
  firstSeen: number;
  lastSeen: number;
  total: number; // every crash since the issue opened
  pending: number; // crashes not yet sent to War Room
  reportedPerMinute: number; // last rate sent, so a quiet minute can send 0
  state: "new" | "reported" | "closed";
  incidentId?: string;
  incidentUrl?: string;
  lastError?: string; // last failed War Room call
  sample: Omit<CapturedError, "fingerprint" | "at">;
};

export type TrackerEnv = { SERVICE_NAME?: string; GITHUB_REPO?: string; WARROOM_URL?: string; WARROOM_INGEST_TOKEN?: string };

const FLUSH_MS = 60_000;

export class ErrorTracker extends DurableObject<TrackerEnv> {
  // One incident creation per issue at a time (requests interleave while we wait for War Room).
  private opening = new Map<string, Promise<void>>();

  async capture(error: CapturedError) {
    const key = `issue:${await sha(error.fingerprint)}`;
    const existing = await this.ctx.storage.get<Issue>(key);
    if (existing && existing.state !== "closed") {
      existing.total++;
      existing.pending++;
      existing.lastSeen = error.at;
      await this.ctx.storage.put(key, existing);
    } else {
      const { fingerprint: _f, at: _a, ...sample } = error;
      const issue: Issue = {
        key, title: error.title, route: error.route, errorName: error.errorName, message: error.message, severity: error.severity,
        firstSeen: error.at, lastSeen: error.at, total: 1, pending: 1, reportedPerMinute: 0, state: "new", sample,
      };
      await this.ctx.storage.put(key, issue);
      await this.open(key);
    }
    if ((await this.ctx.storage.getAlarm()) === null) await this.ctx.storage.setAlarm(Date.now() + FLUSH_MS);
  }

  async list() {
    const issues = [...(await this.ctx.storage.list<Issue>({ prefix: "issue:" })).values()];
    return issues
      .sort((a, b) => b.lastSeen - a.lastSeen)
      .map(({ sample: _s, key: _k, ...issue }) => issue);
  }

  async alarm() {
    let active = false;
    for (const issue of (await this.ctx.storage.list<Issue>({ prefix: "issue:" })).values()) {
      if (issue.state === "new") await this.open(issue.key);
      else if (issue.state === "reported") await this.flush(issue.key);
      const now = await this.ctx.storage.get<Issue>(issue.key);
      if (now && now.state !== "closed" && (now.pending > 0 || now.reportedPerMinute > 0 || (now.state === "new" && this.configured()))) active = true;
    }
    if (active) await this.ctx.storage.setAlarm(Date.now() + FLUSH_MS);
  }

  // Opens a War Room incident for a new issue. Failures are kept on the issue and retried on the next alarm.
  private open(key: string) {
    const running = this.opening.get(key);
    if (running) return running;
    const task = (async () => {
      const issue = await this.ctx.storage.get<Issue>(key);
      if (!issue || issue.state !== "new" || !this.configured()) return;
      const sent = issue.total;
      const response = await this.warroom("/api/incidents", {
        title: issue.title.slice(0, 120),
        severity: issue.severity,
        location: {
          service: (this.env.SERVICE_NAME ?? "demo-shop").slice(0, 60),
          suspect: `${issue.sample.handler} · ${issue.sample.file}`.slice(0, 60),
          region: issue.sample.region.slice(0, 60),
        },
        // The incident links to this repo: War Room's agent investigates its code and opens fix PRs there.
        ...(this.env.GITHUB_REPO ? { repo: this.env.GITHUB_REPO } : {}),
        tags: [this.env.SERVICE_NAME ?? "demo-shop", issue.sample.handler, issue.errorName, "5xx"].map(t => t.toLowerCase().slice(0, 30)),
        occurrences: { total: sent, perMinute: sent },
      });
      const latest = (await this.ctx.storage.get<Issue>(key))!;
      if (response.ok) {
        const body = (await response.json()) as { id: string; url: string };
        Object.assign(latest, { state: "reported", incidentId: body.id, incidentUrl: body.url, pending: latest.pending - Math.min(sent, latest.pending), reportedPerMinute: sent, lastError: undefined });
        console.log(JSON.stringify({ level: "info", msg: "incident opened in War Room", incident: body.id, url: body.url, title: latest.title }));
      } else {
        latest.lastError = `War Room answered ${response.status}: ${await response.text().catch(() => "")}`.slice(0, 300);
        console.error(JSON.stringify({ level: "error", msg: "could not open War Room incident", error: latest.lastError }));
      }
      await this.ctx.storage.put(key, latest);
    })()
      .catch(error => console.error(JSON.stringify({ level: "error", msg: "could not reach War Room", error: String(error) })))
      .finally(() => this.opening.delete(key));
    this.opening.set(key, task);
    return task;
  }

  // Sends the crashes counted since the last flush. A resolved incident closes the issue.
  private async flush(key: string) {
    const issue = await this.ctx.storage.get<Issue>(key);
    if (!issue || issue.state !== "reported" || !issue.incidentId) return;
    if (issue.pending === 0 && issue.reportedPerMinute === 0) return;
    const add = issue.pending;
    const response = await this.warroom(`/api/incidents/${encodeURIComponent(issue.incidentId)}/occurrences`, { add, perMinute: add }).catch(error => error as Error);
    const latest = (await this.ctx.storage.get<Issue>(key))!;
    if (response instanceof Error) latest.lastError = String(response);
    else if (response.status === 409 || response.status === 404) {
      latest.state = "closed";
      console.log(JSON.stringify({ level: "info", msg: "War Room incident is closed; the next crash opens a new one", incident: latest.incidentId }));
    } else if (response.ok) {
      latest.pending -= add;
      latest.reportedPerMinute = add;
      latest.lastError = undefined;
    } else latest.lastError = `War Room answered ${response.status}`;
    await this.ctx.storage.put(key, latest);
  }

  private configured() {
    return !!(this.env.WARROOM_URL && this.env.WARROOM_INGEST_TOKEN);
  }

  private warroom(path: string, body: unknown) {
    return fetch(`${this.env.WARROOM_URL!.replace(/\/+$/, "")}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.env.WARROOM_INGEST_TOKEN}` },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10_000),
    });
  }
}

async function sha(text: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].slice(0, 8).map(b => b.toString(16).padStart(2, "0")).join("");
}
