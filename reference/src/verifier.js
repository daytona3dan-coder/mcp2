import { fingerprint } from './canonical.js';

const deny = (request, grant, now, reasons) => ({
  decision: 'DENY',
  reasons: [...new Set(reasons)].sort(),
  grant_id: request?.grant_id ?? '',
  request_id: request?.request_id ?? '',
  verified_at: now.toISOString(),
  request_fingerprint: fingerprint(request ?? null),
  grant_fingerprint: grant ? fingerprint(grant) : null
});

function parseTime(s) {
  const ms = Date.parse(s);
  return Number.isFinite(ms) ? ms : null;
}

function subset(child, parent) {
  return child.every(x => parent.includes(x));
}

export class MemoryAuthorityStore {
  constructor(grants = [], usedNonces = []) {
    this.grants = new Map(grants.map(g => [g.grant_id, structuredClone(g)]));
    this.usedNonces = new Set(usedNonces);
  }
  get(id) { return this.grants.get(id) ?? null; }
  consumeNonce(nonce) {
    if (this.usedNonces.has(nonce)) return false;
    this.usedNonces.add(nonce);
    return true;
  }
}

export function verify(request, store, now = new Date()) {
  const malformed = [];
  for (const k of ['request_id','grant_id','actor','action','target','policy_digest','nonce','requested_at']) {
    if (!request || typeof request[k] !== 'string' || request[k].length === 0) malformed.push('MALFORMED_REQUEST');
  }
  if (malformed.length) return deny(request, null, now, malformed);

  const grant = store.get(request.grant_id);
  if (!grant) return deny(request, null, now, ['UNKNOWN_GRANT']);

  const reasons = [];
  const nowMs = now.getTime();

  if (grant.status !== 'active') reasons.push('GRANT_NOT_ACTIVE');

  const from = parseTime(grant.valid_from);
  const until = parseTime(grant.valid_until);
  if (from === null || until === null || until <= from) reasons.push('GRANT_NOT_ACTIVE');
  else {
    if (nowMs < from) reasons.push('NOT_YET_VALID');
    if (nowMs >= until) reasons.push('EXPIRED');
  }

  if (request.actor !== grant.actor) reasons.push('ACTOR_MISMATCH');
  if (!Array.isArray(grant.actions) || !grant.actions.includes(request.action)) reasons.push('ACTION_NOT_ALLOWED');
  if (!Array.isArray(grant.targets) || !grant.targets.includes(request.target)) reasons.push('TARGET_NOT_ALLOWED');
  if (request.policy_digest !== grant.policy_digest) reasons.push('POLICY_DIGEST_MISMATCH');

  const seen = new Set([grant.grant_id]);
  let child = grant;
  let parentId = grant.parent_grant_id;

  while (parentId) {
    if (seen.has(parentId)) {
      reasons.push('ANCESTOR_INVALID');
      break;
    }
    seen.add(parentId);
    const parent = store.get(parentId);
    if (!parent) {
      reasons.push('ANCESTOR_INVALID');
      break;
    }
    const pFrom = parseTime(parent.valid_from);
    const pUntil = parseTime(parent.valid_until);
    if (parent.status !== 'active' || pFrom === null || pUntil === null || nowMs < pFrom || nowMs >= pUntil) {
      reasons.push('ANCESTOR_INVALID');
    }
    if (!Array.isArray(child.actions) || !Array.isArray(parent.actions) || !subset(child.actions, parent.actions)) {
      reasons.push('ANCESTOR_INVALID');
    }
    if (!Array.isArray(child.targets) || !Array.isArray(parent.targets) || !subset(child.targets, parent.targets)) {
      reasons.push('ANCESTOR_INVALID');
    }
    const cFrom = parseTime(child.valid_from);
    const cUntil = parseTime(child.valid_until);
    if (cFrom === null || cUntil === null || pFrom === null || pUntil === null || cFrom < pFrom || cUntil > pUntil) {
      reasons.push('ANCESTOR_INVALID');
    }
    child = parent;
    parentId = parent.parent_grant_id;
  }

  if (store.usedNonces.has(request.nonce)) reasons.push('REPLAY');

  if (reasons.length) return deny(request, grant, now, reasons);

  if (!store.consumeNonce(request.nonce)) return deny(request, grant, now, ['REPLAY']);

  return {
    decision: 'ALLOW',
    reasons: [],
    grant_id: request.grant_id,
    request_id: request.request_id,
    verified_at: now.toISOString(),
    request_fingerprint: fingerprint(request),
    grant_fingerprint: fingerprint(grant)
  };
}
