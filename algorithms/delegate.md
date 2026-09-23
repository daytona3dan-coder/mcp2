# DELEGATE

A candidate child grant may be created only when:

- parent exists
- parent is active and currently valid
- parent explicitly permits delegation
- child principal equals parent principal
- child actions are a subset of parent actions
- child targets are a subset of parent targets
- child validity is fully contained by parent validity
- child policy digest equals parent policy digest unless an explicit future constrained-policy-inheritance profile defines otherwise

`policy_ref` is not used as a Core authorization comparison; `policy_digest` is the normative policy binding.

Any failure rejects grant creation.
