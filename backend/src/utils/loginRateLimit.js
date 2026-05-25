function clampInt(n, min, max) {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, Math.trunc(n)));
}

function nowMs() {
  return Date.now();
}

function createEntry() {
  return { count: 0, firstAtMs: 0, lockedUntilMs: 0 };
}

function normalizeUsername(username) {
  return String(username || "").trim().toLowerCase();
}

function normalizeIp(ip) {
  const s = String(ip || "").trim();
  return s || "unknown";
}

function secondsUntil(ms, now) {
  return clampInt(Math.ceil((ms - now) / 1000), 0, 365 * 24 * 60 * 60);
}

export function createLoginRateLimiter({ maxAttempts, windowSec, lockSec }) {
  const windowMs = clampInt(windowSec, 5, 60 * 60) * 1000;
  const lockMs = clampInt(lockSec, 5, 24 * 60 * 60) * 1000;
  const max = clampInt(maxAttempts, 3, 100);

  const byIp = new Map();
  const byIpUser = new Map();

  function getOrInit(map, key) {
    const existing = map.get(key);
    if (existing) return existing;
    const e = createEntry();
    map.set(key, e);
    return e;
  }

  function resetIfWindowExpired(entry, now) {
    if (!entry.firstAtMs) return;
    if (now - entry.firstAtMs > windowMs) {
      entry.count = 0;
      entry.firstAtMs = 0;
      entry.lockedUntilMs = 0;
    }
  }

  function isLocked(entry, now) {
    return entry.lockedUntilMs && entry.lockedUntilMs > now;
  }

  function noteFailure(map, key, now) {
    const entry = getOrInit(map, key);
    resetIfWindowExpired(entry, now);
    if (isLocked(entry, now)) return entry;
    if (!entry.firstAtMs) entry.firstAtMs = now;
    entry.count += 1;
    if (entry.count >= max) entry.lockedUntilMs = now + lockMs;
    return entry;
  }

  function noteSuccess(map, key) {
    map.delete(key);
  }

  function check(ip, username) {
    const now = nowMs();
    const ipKey = normalizeIp(ip);
    const userKey = normalizeUsername(username);
    const ipUserKey = `${ipKey}|${userKey || "-"}`;

    const ipEntry = byIp.get(ipKey);
    if (ipEntry) resetIfWindowExpired(ipEntry, now);
    const ipUserEntry = byIpUser.get(ipUserKey);
    if (ipUserEntry) resetIfWindowExpired(ipUserEntry, now);

    const ipLocked = ipEntry && isLocked(ipEntry, now);
    const ipUserLocked = ipUserEntry && isLocked(ipUserEntry, now);

    const retryAfterSec = Math.max(
      ipLocked ? secondsUntil(ipEntry.lockedUntilMs, now) : 0,
      ipUserLocked ? secondsUntil(ipUserEntry.lockedUntilMs, now) : 0
    );

    return { locked: ipLocked || ipUserLocked, retryAfterSec };
  }

  function fail(ip, username) {
    const now = nowMs();
    const ipKey = normalizeIp(ip);
    const userKey = normalizeUsername(username);
    const ipUserKey = `${ipKey}|${userKey || "-"}`;

    const ipEntry = noteFailure(byIp, ipKey, now);
    const ipUserEntry = noteFailure(byIpUser, ipUserKey, now);

    const retryAfterSec = Math.max(secondsUntil(ipEntry.lockedUntilMs || 0, now), secondsUntil(ipUserEntry.lockedUntilMs || 0, now));
    return { locked: retryAfterSec > 0, retryAfterSec };
  }

  function success(ip, username) {
    const ipKey = normalizeIp(ip);
    const userKey = normalizeUsername(username);
    const ipUserKey = `${ipKey}|${userKey || "-"}`;
    noteSuccess(byIp, ipKey);
    noteSuccess(byIpUser, ipUserKey);
  }

  return { check, fail, success };
}

