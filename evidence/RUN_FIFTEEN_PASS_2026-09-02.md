# MCP2 Run Fifteen — Distributed Authority Convergence & Split-Brain Resistance — PASS

**Date:** 2026-09-02  
**Verdict:** PASS  
**Operational implementation:** MCPaios  
**Protected boundary:** independently deployed authority nodes over one canonical authority plane

## Result

Run Fifteen proved:

> **Stale distributed authority is not executable authority.**

Two independently deployed MCPaios node surfaces participated in leadership transfer, fenced mutation, cached authority verification, canonical revocation, replica convergence, and fresh-compute recovery.

Private MCPaios Run Fifteen PR #7 merged at:

`3d32da4904ddbedf68c89342fe014827d9b52c8e`

## CI evidence

Final tested code head:

`3e0a44d5cf64f8eca3250cadca8329ace613bcad`

All required workflows passed on that exact head:

- Run Eight — SUCCESS
- Run Ten — SUCCESS
- Run Eleven — SUCCESS
- Run Thirteen — SUCCESS
- Run Fourteen — SUCCESS
- Run Fifteen — SUCCESS

The only subsequent branch change before merge was the Run Fifteen deployed evidence document.

## Distributed authority model

Run Fifteen added:

- durable cluster control state;
- monotonic fencing epochs;
- exact leader-node + exact epoch mutation fencing;
- independently authenticated node identities;
- independently deployable Node A and Node B authority surfaces;
- cached authority replicas bound to a snapshot digest, authority revision, and ledger head;
- stale-replica freshness checks before cached grant evaluation;
- convergence reporting across node replicas.

## Live proof

Accepted proof ID: `r15-20260902a`.

Live deployed nodes:

- `mcpaios-run15-node-a` with compiled identity `node-a`
- `mcpaios-run15-node-b` with compiled identity `node-b`

Dedicated proof tenant and cluster:

- tenant: `split-r15-20260902a`
- cluster: `cluster-r15-20260902a`

### Phase 1 — 15/15 PASS

1. The split-brain proof cluster and two durable node records were created.
2. The two independently deployed Edge Functions proved distinct compiled node identities.
3. Node A acquired leadership at fencing epoch `1`.
4. Node A used epoch `1` to ratify bounded machine authority.
5. Node A and Node B synchronized to the same initial authority snapshot digest.
6. Both current replicas returned **ALLOW** for the active grant.
7. Node B acquired leadership at fencing epoch `2`.
8. Node A attempted a mutation using stale epoch `1` and was rejected with `MCPAIOS_STALE_WRITER_FENCED` before canonical mutation.
9. Node B used epoch `2` to revoke the grant.
10. Node A still held a cached snapshot containing active authority, but its next cached verification returned **DENY / STALE_REPLICA** because its observed authority revision and ledger head no longer matched canonical state.
11. Node B's own pre-revocation cache also returned **DENY / STALE_REPLICA** until Node B explicitly resynchronized after mutation.
12. After Node B resynchronized, cached verification returned **DENY / GRANT_NOT_ACTIVE**.
13. Node A resynchronized; both nodes converged on the same revoked-authority snapshot digest and both denied the grant.
14. Cluster reporting confirmed the replicas shared the same snapshot digest, observed authority revision, and observed ledger head.
15. Leadership transferred back to Node A at fencing epoch `3`; Node B's epoch-2 write attempt was rejected with `MCPAIOS_STALE_WRITER_FENCED`.

Initial active-authority replica digest:

`20f2a75b674dc79003cde9d73d6f23d63444a395088e6f0ca09ade8fd70a7dd8`

Converged revoked-authority replica digest:

`c319d38b3fee5caa29c385dc7fcd4583af640d419c7b38c2e01deb066052b926`

Converged canonical authority state:

- authority revision: `3`
- ledger head: `1887fe66d78309b7117ef9bf48796c3347de7963ea96781ad0cb77d0f84c57df`

### Phase 2 — fresh node compute — 1/1 PASS

Both node Edge Functions were redeployed from version `1` to version `2` without resetting canonical state.

Fresh compute recovered:

- fencing epoch `3`;
- leader `node-a`;
- Node A decision **DENY / GRANT_NOT_ACTIVE**;
- Node B decision **DENY / GRANT_NOT_ACTIVE**;
- identical replica snapshot digest;
- authority revision `3`;
- the same canonical ledger head from Phase 1.

Total live acceptance: **16/16 PASS**.

## Split-brain safety significance

Run Fifteen proves both write fencing and read freshness fencing.

### Write fencing

A canonical authority mutation requires the exact current leader node identity and exact current fencing epoch. A former leader cannot continue writing because it still believes itself to be leader.

### Read freshness fencing

A cached grant document is never sufficient for ALLOW. Before evaluating cached authority, the node compares its observed authority revision and ledger head with canonical state. Any mismatch causes **DENY / STALE_REPLICA** before grant evaluation.

That property prevented Node A from serving stale ALLOW after Node B revoked the grant during simulated failover/partition.

## Final forensic state

After proof cleanup:

- proof cluster status: `retired`
- proof tenant status: `retired`
- final fencing epoch preserved: `3`
- final leader record: `node-a`
- active node credentials: `0`
- active node records: `0`
- active proof grants: `0`
- revoked proof grants: `1`
- recorded `STALE_REPLICA` denials: `2`
- distinct replica snapshot digests after convergence: `1`
- distinct replica authority revisions after convergence: `1`
- distinct replica ledger heads after convergence: `1`
- anon direct access to control state: denied
- authenticated direct access to replica state: denied
- temporary proof launcher removed
- temporary `pg_net` transport removed
- proof-only Edge Function locked closed with JWT verification
- final Supabase security-advisor scan: no WARN or ERROR findings

The real Node A and Node B implementations remain deployed, but the proof cluster is retired and has no node credentials.

## Deployment defect found and repaired

The first live schema migration was rejected atomically because the cached-verifier function used `grant` as a PL/pgSQL variable name. PostgreSQL treats `GRANT` as reserved syntax.

No partial Run Fifteen schema or authority state was installed. The canonical migration was repaired to use `grant_doc`, and the Run Fifteen preflight was strengthened to reject the reserved variable pattern before future deployment.

The corrected migration then installed successfully and the complete 16-case proof passed.

## Constitutional rule

Run Fifteen adds:

> **Stale Distributed Authority ≠ Executable Authority.**

The proven stack now includes:

- Specification ≠ Authority
- Identity ≠ Authority
- Capability ≠ Authority
- Authority ≠ Process State
- Tenant A Authority ≠ Tenant B Authority
- Backup ≠ Recoverable Authority unless anchored and authenticated
- Stale Distributed Authority ≠ Executable Authority

## Non-claims

Run Fifteen does not claim Raft/Paxos consensus, cross-region PostgreSQL multi-primary writes, Byzantine fault tolerance, or internet-scale quorum management. It proves the narrower machine-authority property that stale distributed nodes are fenced from mutation and cannot serve stale ALLOW decisions after canonical authority advances.
