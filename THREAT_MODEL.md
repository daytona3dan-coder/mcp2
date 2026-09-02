# MCP2 Threat Model — Candidate v0.6.0

## Protected property

No machine action reaches a protected execution boundary unless canonical authority permits that exact action at verification time.

## Threat actors

- compromised or misconfigured agent
- malicious caller
- stale client
- replaying client
- delegated subagent exceeding parent authority
- service presenting altered policy metadata
- verifier reading stale revocation state
- operator accidentally issuing overbroad authority

## Primary threats

### Self-asserted authority
Caller supplies expanded scope or altered grant fields.

**Control:** caller presents only request facts and a grant identifier; verifier resolves canonical grant.

### Target substitution
Actor changes the target after approval.

**Control:** exact target match or explicit canonical scope rule.

### Action substitution
Actor requests a stronger operation than ratified.

**Control:** exact action match or explicit canonical action set.

### Expiry invisibility
Expired authority remains usable.

**Control:** verification time must be checked against canonical validity.

### Revocation TOCTOU
Authority is verified once during planning and revoked before execution.

**Control:** verify at the execution fence immediately before protected action.

### Delegation escape
Child grant exceeds parent scope or survives parent revocation/expiry.

**Control:** validate complete ancestry; any invalid ancestor denies descendant.

### Policy drift
Grant references one policy while execution uses another.

**Control:** bind and compare policy digest.

### Replay
Previously authorized request is resubmitted.

**Control:** nonce/replay identifier is consumed atomically on ALLOW.

### Receipt ambiguity
Post-hoc evidence cannot identify what was authorized.

**Control:** deterministic request, grant, policy and result fingerprints.

## Residual risks

MCP2 cannot prove that an external target actually honored the fence unless the protected integration ensures all governed execution passes through that boundary.
