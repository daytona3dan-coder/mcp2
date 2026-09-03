import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

export function canonical(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  switch (typeof value) {
    case 'string': return JSON.stringify(value);
    case 'boolean': return value ? 'true' : 'false';
    case 'number':
      if (!Number.isFinite(value)) throw new TypeError('non-finite number');
      return Object.is(value, -0) ? '0' : JSON.stringify(value);
    case 'object': {
      const keys = Object.keys(value).sort();
      return `{${keys.map(k => `${JSON.stringify(k)}:${canonical(value[k])}`).join(',')}}`;
    }
    default: throw new TypeError(`unsupported canonical type: ${typeof value}`);
  }
}

export function sha256Hex(value) {
  return createHash('sha256').update(canonical(value)).digest('hex');
}

export function hmacSha256Hex(key, value) {
  return createHmac('sha256', key).update(canonical(value)).digest('hex');
}

function safeEqualHex(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || !/^[0-9a-f]{64}$/.test(a) || !/^[0-9a-f]{64}$/.test(b)) return false;
  return timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'));
}

function parseTime(value) {
  if (typeof value !== 'string') return null;
  const ms = Date.parse(value);
  return Number.isFinite(ms) ? ms : null;
}

function subset(child, parent) {
  return Array.isArray(child) && Array.isArray(parent) && child.every(v => parent.includes(v));
}

function authorityDeny(request, grant, reasons) {
  return {
    decision: 'DENY',
    reasons: [...new Set(reasons)].sort(),
    request_fingerprint: sha256Hex(request ?? null),
    grant_fingerprint: grant ? sha256Hex(grant) : null
  };
}

export function evaluateAuthority(input = {}) {
  const { now, request, grants = [], used_nonces = [] } = input;
  const nowMs = parseTime(now);
  if (nowMs === null) return authorityDeny(request, null, ['MALFORMED_VERIFICATION_TIME']);
  const required = ['request_id','grant_id','actor','action','target','policy_digest','nonce','requested_at'];
  if (!request || required.some(k => typeof request[k] !== 'string' || request[k].length === 0)) {
    return authorityDeny(request, null, ['MALFORMED_REQUEST']);
  }
  const byId = new Map(grants.map(g => [g.grant_id, g]));
  const grant = byId.get(request.grant_id);
  if (!grant) return authorityDeny(request, null, ['UNKNOWN_GRANT']);

  const reasons = [];
  const from = parseTime(grant.valid_from);
  const until = parseTime(grant.valid_until);
  if (grant.status !== 'active') reasons.push('GRANT_NOT_ACTIVE');
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
    if (seen.has(parentId)) { reasons.push('ANCESTOR_INVALID'); break; }
    seen.add(parentId);
    const parent = byId.get(parentId);
    if (!parent) { reasons.push('ANCESTOR_INVALID'); break; }
    const pFrom = parseTime(parent.valid_from);
    const pUntil = parseTime(parent.valid_until);
    const cFrom = parseTime(child.valid_from);
    const cUntil = parseTime(child.valid_until);
    if (parent.status !== 'active' || pFrom === null || pUntil === null || nowMs < pFrom || nowMs >= pUntil) reasons.push('ANCESTOR_INVALID');
    if (!subset(child.actions, parent.actions) || !subset(child.targets, parent.targets)) reasons.push('ANCESTOR_INVALID');
    if (cFrom === null || cUntil === null || pFrom === null || pUntil === null || cFrom < pFrom || cUntil > pUntil) reasons.push('ANCESTOR_INVALID');
    child = parent;
    parentId = parent.parent_grant_id;
  }

  if (used_nonces.includes(request.nonce)) reasons.push('REPLAY');
  if (reasons.length) return authorityDeny(request, grant, reasons);
  return {
    decision: 'ALLOW',
    reasons: [],
    request_fingerprint: sha256Hex(request),
    grant_fingerprint: sha256Hex(grant)
  };
}

export function evaluateReceipt(input, authority) {
  if (!input) return { verdict: 'NOT_PRESENT' };
  if (!input.body || typeof input.receipt_hash !== 'string') return { verdict: 'MALFORMED_RECEIPT' };
  const computed = sha256Hex(input.body);
  if (!safeEqualHex(computed, input.receipt_hash)) return { verdict: 'RECEIPT_HASH_MISMATCH', computed_hash: computed };
  if (input.body.decision !== authority.decision ||
      input.body.request_fingerprint !== authority.request_fingerprint ||
      input.body.grant_fingerprint !== authority.grant_fingerprint) {
    return { verdict: 'RECEIPT_AUTHORITY_MISMATCH' };
  }
  return { verdict: 'VALID', receipt_hash: computed };
}

function envelopeBody(envelope) {
  const { signature, ...body } = envelope;
  return body;
}

export function evaluateWitness(input = {}) {
  if (!input || !Array.isArray(input.envelopes)) return { verdict: 'NOT_PRESENT', inspections: [] };
  const nowMs = parseTime(input.now);
  const threshold = input.threshold;
  const maxStaleness = input.max_staleness_seconds ?? 300;
  if (nowMs === null || !Number.isInteger(threshold) || threshold < 1 || !Number.isInteger(maxStaleness) || maxStaleness < 1) {
    return { verdict: 'MALFORMED', inspections: [] };
  }
  const rootMap = new Map((input.root_state?.epochs ?? []).map(r => [r.epoch, r.status]));
  const currentRoot = input.root_state?.current_epoch;
  const inspections = input.envelopes.map(envelope => {
    const sig = hmacSha256Hex(input.verification_key ?? '', envelopeBody(envelope));
    if (!safeEqualHex(sig, envelope.signature)) return { provider: envelope.provider, verdict: 'SIGNATURE_INVALID' };
    const issued = parseTime(envelope.issued_at);
    const freshUntil = parseTime(envelope.fresh_until);
    if (issued === null || freshUntil === null || freshUntil <= issued || !Number.isInteger(envelope.max_staleness_seconds)) {
      return { provider: envelope.provider, verdict: 'MALFORMED' };
    }
    const lifetime = (freshUntil - issued) / 1000;
    if (envelope.max_staleness_seconds > maxStaleness || lifetime > maxStaleness) return { provider: envelope.provider, verdict: 'TTL_EXCEEDS_MAX' };
    if (nowMs < issued || nowMs >= freshUntil) return { provider: envelope.provider, verdict: 'EXPIRED' };
    const rootStatus = rootMap.get(envelope.root_epoch);
    if (envelope.root_epoch !== currentRoot || rootStatus !== 'active') {
      if (rootStatus === 'compromised') return { provider: envelope.provider, verdict: 'ROOT_EPOCH_COMPROMISED' };
      if (rootStatus === 'retired') return { provider: envelope.provider, verdict: 'ROOT_EPOCH_RETIRED' };
      return { provider: envelope.provider, verdict: 'ROOT_EPOCH_INELIGIBLE' };
    }
    if (envelope.material_digest !== input.canonical_material_digest) return { provider: envelope.provider, verdict: 'CANONICAL_MISMATCH' };
    return { provider: envelope.provider, verdict: 'ELIGIBLE' };
  });

  const eligible = inspections.filter(x => x.verdict === 'ELIGIBLE').length;
  const canonicalMismatch = inspections.filter(x => x.verdict === 'CANONICAL_MISMATCH').length;
  const signed = inspections.filter(x => !['SIGNATURE_INVALID','MALFORMED'].includes(x.verdict)).length;
  const freshCurrent = inspections.filter(x => ['ELIGIBLE','CANONICAL_MISMATCH'].includes(x.verdict)).length;
  let verdict;
  if (eligible >= threshold) verdict = 'TRUSTED_ROOT_FRESH_THRESHOLD';
  else if (freshCurrent >= threshold && canonicalMismatch > 0) verdict = 'CANONICAL_FRESHNESS_MISMATCH';
  else if (signed < threshold && inspections.some(x => x.verdict === 'SIGNATURE_INVALID')) verdict = 'SIGNATURE_INVALID';
  else if (inspections.some(x => ['ROOT_EPOCH_COMPROMISED','ROOT_EPOCH_RETIRED','ROOT_EPOCH_INELIGIBLE'].includes(x.verdict))) verdict = 'ROOT_FRESHNESS_UNAVAILABLE';
  else verdict = 'WITNESS_FRESHNESS_UNAVAILABLE';

  return { verdict, eligible_count: eligible, threshold_required: threshold, inspections };
}

function getEpoch(input, epoch) {
  return (input.epochs ?? []).find(e => e.epoch === epoch) ?? null;
}

export function evaluateProviderMembership(input = {}) {
  if (!input || !Number.isInteger(input.supplied_epoch)) return { verdict: 'NOT_PRESENT' };
  const epoch = getEpoch(input, input.supplied_epoch);
  if (!epoch) return { verdict: 'PROVIDER_EPOCH_UNKNOWN' };
  const mode = input.mode ?? 'current';
  if (mode === 'current' && input.supplied_epoch !== input.current_epoch) {
    return { verdict: 'PROVIDER_EPOCH_STALE', current_epoch: input.current_epoch, supplied_epoch: input.supplied_epoch };
  }
  const trueProviders = Object.entries(input.provider_results ?? {}).filter(([,v]) => v === true).map(([k]) => k);
  const outsider = trueProviders.find(p => !epoch.providers.includes(p));
  if (mode === 'current' && outsider) return { verdict: 'PROVIDER_NOT_CURRENT', provider: outsider };
  const validCount = trueProviders.filter(p => epoch.providers.includes(p)).length;
  if (mode === 'historical') {
    return { verdict: validCount >= epoch.threshold ? 'HISTORICAL_PROVIDER_THRESHOLD_MET' : 'HISTORICAL_PROVIDER_THRESHOLD_UNAVAILABLE', valid_provider_count: validCount, threshold_required: epoch.threshold };
  }
  return { verdict: validCount >= epoch.threshold ? 'CURRENT_PROVIDER_THRESHOLD_MET' : 'PROVIDER_THRESHOLD_UNAVAILABLE', valid_provider_count: validCount, threshold_required: epoch.threshold };
}

export function evaluateProvenance(input = {}, membership = {}) {
  if (!input || !input.relations) return { verdict: 'NOT_PRESENT' };
  const epoch = getEpoch(membership, input.provider_epoch);
  if (!epoch) return { verdict: 'PROVIDER_EPOCH_UNKNOWN' };
  const vals = epoch.providers.map(p => input.relations[p] ?? 'UNAVAILABLE');
  const valid = vals.filter(v => v === 'PRE' || v === 'POST');
  const pre = valid.filter(v => v === 'PRE').length;
  const post = valid.filter(v => v === 'POST').length;
  if (valid.length < epoch.threshold) return { verdict: 'TIMESTAMP_THRESHOLD_UNAVAILABLE', valid_provider_count: valid.length, threshold_required: epoch.threshold };
  if (pre >= epoch.threshold) return { verdict: 'PRE_COMPROMISE_EXTERNALLY_THRESHOLD_ANCHORED', agreeing_count: pre };
  if (post >= epoch.threshold) return { verdict: 'POST_COMPROMISE_PROVENANCE_UNTRUSTED', agreeing_count: post };
  return { verdict: 'TIMESTAMP_THRESHOLD_MISMATCH', valid_provider_count: valid.length, threshold_required: epoch.threshold };
}

export function evaluateProviderTransition(input = {}, membership = {}) {
  if (!input || !input.kind) return { verdict: 'NOT_PRESENT' };
  if (input.kind === 'set_current_epoch') {
    return { verdict: input.proposed_epoch < membership.current_epoch ? 'MCPAIOS_PROVIDER_EPOCH_ROLLBACK_FORBIDDEN' : 'PROVIDER_TRANSITION_ALLOWED' };
  }
  if (input.kind === 'reactivate_epoch') {
    const epoch = getEpoch(membership, input.epoch);
    return { verdict: epoch && epoch.status === 'retired' ? 'MCPAIOS_PROVIDER_EPOCH_RESURRECTION_FORBIDDEN' : 'PROVIDER_TRANSITION_ALLOWED' };
  }
  if (input.kind === 'admit_provider') {
    const status = membership.registry?.[input.provider];
    if (status === 'compromised') return { verdict: 'MCPAIOS_COMPROMISED_PROVIDER_REJOIN_FORBIDDEN' };
    const current = getEpoch(membership, membership.current_epoch);
    const q = input.qualification;
    if (!q || q.prior_provider_epoch !== membership.current_epoch || q.prior_config_digest !== current?.config_digest || q.provider !== input.provider) {
      return { verdict: 'MCPAIOS_PROVIDER_QUALIFICATION_REQUIRED' };
    }
    return { verdict: 'PROVIDER_TRANSITION_ALLOWED' };
  }
  return { verdict: 'MALFORMED_TRANSITION' };
}

export function evaluateRootTransition(input = {}, witness = {}) {
  if (!input || !input.kind) return { verdict: 'NOT_PRESENT' };
  const state = witness.root_state ?? {};
  if (input.kind === 'set_current_epoch') {
    return { verdict: input.proposed_epoch < state.current_epoch ? 'MCPAIOS_ROOT_EPOCH_ROLLBACK_FORBIDDEN' : 'ROOT_TRANSITION_ALLOWED' };
  }
  if (input.kind === 'reactivate_epoch') {
    const epoch = (state.epochs ?? []).find(e => e.epoch === input.epoch);
    return { verdict: epoch && ['retired','compromised'].includes(epoch.status) ? 'MCPAIOS_ROOT_RESURRECTION_FORBIDDEN' : 'ROOT_TRANSITION_ALLOWED' };
  }
  return { verdict: 'MALFORMED_TRANSITION' };
}

export function reconstruct(bundle) {
  const authority = evaluateAuthority(bundle.authority ?? {});
  const receipt = evaluateReceipt(bundle.receipt, authority);
  const witness = evaluateWitness(bundle.witness);
  const provider_membership = evaluateProviderMembership(bundle.timestamp_membership);
  const provenance = evaluateProvenance(bundle.provenance, bundle.timestamp_membership);
  const provider_transition = evaluateProviderTransition(bundle.provider_transition, bundle.timestamp_membership);
  const root_transition = evaluateRootTransition(bundle.root_transition, bundle.witness);
  return {
    authority,
    receipt,
    witness,
    provider_membership,
    provenance,
    provider_transition,
    root_transition,
    reconstructible: !['MALFORMED_RECEIPT','RECEIPT_HASH_MISMATCH','RECEIPT_AUTHORITY_MISMATCH'].includes(receipt.verdict)
  };
}
