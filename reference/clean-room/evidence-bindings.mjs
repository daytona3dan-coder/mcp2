import assert from 'node:assert/strict';
import fs from 'node:fs';

const checks = {
  '../../evidence/RUN_FIVE_PASS_2026-09-02.md': [
    'Exact authorized read succeeds', 'ALLOW receipt', 'Policy-digest mismatch', 'Replay is denied', 'Parent grant revocation'
  ],
  '../../evidence/RUN_NINETEEN_PASS_2026-09-02.md': [
    'TRUSTED_FRESH_THRESHOLD', 'SIGNATURE_INVALID', 'WITNESS_FRESHNESS_UNAVAILABLE', 'CANONICAL_FRESHNESS_MISMATCH'
  ],
  '../../evidence/RUN_TWENTY_PASS_2026-09-02.md': [
    'ROOT_EPOCH_RETIRED', 'ROOT_EPOCH_COMPROMISED', 'MCPAIOS_ROOT_EPOCH_ROLLBACK_FORBIDDEN', 'MCPAIOS_ROOT_RESURRECTION_FORBIDDEN'
  ],
  '../../evidence/RUN_TWENTY_THREE_PASS_2026-09-03.md': [
    'PRE_COMPROMISE_EXTERNALLY_THRESHOLD_ANCHORED', 'POST_COMPROMISE_PROVENANCE_UNTRUSTED', 'TIMESTAMP_THRESHOLD_UNAVAILABLE', 'TIMESTAMP_THRESHOLD_MISMATCH'
  ],
  '../../evidence/RUN_TWENTY_FOUR_PASS_2026-09-03.md': [
    'CURRENT_PROVIDER_THRESHOLD_MET', 'PROVIDER_THRESHOLD_UNAVAILABLE', 'PROVIDER_NOT_CURRENT', 'PROVIDER_EPOCH_STALE',
    'HISTORICAL_PROVIDER_THRESHOLD_MET', 'MCPAIOS_PROVIDER_EPOCH_ROLLBACK_FORBIDDEN',
    'MCPAIOS_PROVIDER_EPOCH_RESURRECTION_FORBIDDEN', 'MCPAIOS_COMPROMISED_PROVIDER_REJOIN_FORBIDDEN',
    '18bbc939c5157935fa9b97999181e5ceff1a7727846e0c2b04ea665a08982c54',
    '9fbe1f580ece40ea2f662ac16cbbb0bf21a8a7e4dd2488e601ab89a5dbf1a349',
    '0e1a3337736d96eb5d39792fb38512d1b2eecbeb2ee376b09374b8ed3e1ed204'
  ]
};

for (const [relative, needles] of Object.entries(checks)) {
  const text = fs.readFileSync(new URL(relative, import.meta.url), 'utf8');
  for (const needle of needles) assert.ok(text.includes(needle), `${relative} missing ${needle}`);
}
console.log('Run Twenty-Five public evidence bindings: PASS');
