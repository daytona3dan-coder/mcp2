import { fingerprint } from './canonical.js';

const V08_FP_ALG = 'RFC8785-JCS+SHA-256';
const RFC3339 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;
const LOWER_SHA256 = /^[a-f0-9]{64}$/;

function requestEvidence(request) {
  try {
    return { request_fingerprint: fingerprint(request ?? null), request_fingerprint_alg: V08_FP_ALG };
  } catch {
    return { request_fingerprint: null, request_fingerprint_alg: 'NONCANONICALIZABLE' };
  }
}

const deny = (request, grant, now, reasons, v08 = false) => ({
  decision: 'DENY',
  reasons: [...new Set(reasons)].sort(),
  grant_id: request?.grant_id ?? '',
  request_id: request?.request_id ?? '',
  verified_at: now.toISOString(),
  ...(v08 ? requestEvidence(request) : { request_fingerprint: fingerprint(request ?? null) }),
  grant_fingerprint: grant ? fingerprint(grant) : null
});

function parseTime(s) {
  const ms = Date.parse(s);
  return Number.isFinite(ms) ? ms : null;
}

function validRfc3339(s) {
  return typeof s === 'string' && RFC3339.test(s) && parseTime(s) !== null;
}

function subset(child, parent) {
  return child.every(x => parent.includes(x));
}

function extensionIds(declaredExtensions) {
  return new Set((declaredExtensions ?? []).map((entry) => typeof entry === 'string' ? entry : entry?.id).filter(Boolean));
}

function validExtensions(request, declaredExtensions, extensionValidators) {
  if (!Object.prototype.hasOwnProperty.call(request, 'extensions')) return true;
  const value = request.extensions;
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) return false;
  const declared = extensionIds(declaredExtensions);
  for (const [key, body] of Object.entries(value)) {
    if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(key) || !declared.has(key)) return false;
    const validator = extensionValidators?.[key];
    if (typeof validator !== 'function') return false;
    try {
      if (validator(body) !== true) return false;
    } catch {
      return false;
    }
  }
  return true;
}

function validV08RequestTopLevel(request) {
  if (!request || typeof request !== 'object' || Array.isArray(request)) return false;
  const allowed = new Set([
    'request_id','grant_id','actor','action','target','policy_digest','nonce','requested_at','extensions'
  ]);
  return Object.keys(request).every((key) => allowed.has(key));
}

function canonicalizable(value) {
  try { fingerprint(value); return true; } catch { return false; }
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

export function verify(
  request,
  store,
  now = new Date(),
  { declaredExtensions = [], extensionValidators = {}, protocolVersion } = {},
) {
  if (!['0.7.0-candidate','0.8.0-candidate'].includes(protocolVersion)) {
    throw new Error('MCP2_PROTOCOL_VERSION_REQUIRED_OR_UNSUPPORTED');
  }
  const v08 = protocolVersion === '0.8.0-candidate';
  const malformed = [];
  for (const k of ['request_id','grant_id','actor','action','target','policy_digest','nonce','requested_at']) {
    if (!request || typeof request[k] !== 'string' || request[k].length === 0) malformed.push('MALFORMED_REQUEST');
  }
  if (v08 && request) {
    if (!validV08RequestTopLevel(request)) malformed.push('MALFORMED_REQUEST');
    if (!LOWER_SHA256.test(request.policy_digest ?? '')) malformed.push('MALFORMED_REQUEST');
    if (!validRfc3339(request.requested_at)) malformed.push('MALFORMED_REQUEST');
    if (!validExtensions(request, declaredExtensions, extensionValidators)) malformed.push('MALFORMED_REQUEST');
    if (!canonicalizable(request)) malformed.push('MALFORMED_REQUEST');
  }
  if (malformed.length) return deny(request, null, now, malformed, v08);

  const grant = store.get(request.grant_id);
  if (!grant) return deny(request, null, now, ['UNKNOWN_GRANT'], v08);

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
    if (v08 && parent.delegation?.allowed !== true) reasons.push('ANCESTOR_INVALID');
    if (v08 && child.principal !== parent.principal) reasons.push('ANCESTOR_INVALID');
    if (v08 && child.policy_digest !== parent.policy_digest) reasons.push('ANCESTOR_INVALID');
    if (!Array.isArray(child.actions) || !Array.isArray(parent.actions) || !subset(child.actions, parent.actions)) reasons.push('ANCESTOR_INVALID');
    if (!Array.isArray(child.targets) || !Array.isArray(parent.targets) || !subset(child.targets, parent.targets)) reasons.push('ANCESTOR_INVALID');
    const cFrom = parseTime(child.valid_from);
    const cUntil = parseTime(child.valid_until);
    if (cFrom === null || cUntil === null || pFrom === null || pUntil === null || cFrom < pFrom || cUntil > pUntil) reasons.push('ANCESTOR_INVALID');
    child = parent;
    parentId = parent.parent_grant_id;
  }

  if (store.usedNonces.has(request.nonce)) reasons.push('REPLAY');
  if (reasons.length) return deny(request, grant, now, reasons, v08);

  const reqEvidence = v08 ? requestEvidence(request) : { request_fingerprint: fingerprint(request) };
  if (v08 && reqEvidence.request_fingerprint === null) return deny(request, grant, now, ['MALFORMED_REQUEST'], true);

  if (!store.consumeNonce(request.nonce)) return deny(request, grant, now, ['REPLAY'], v08);

  return {
    decision: 'ALLOW',
    reasons: [],
    grant_id: request.grant_id,
    request_id: request.request_id,
    verified_at: now.toISOString(),
    ...reqEvidence,
    grant_fingerprint: fingerprint(grant)
  };
}
