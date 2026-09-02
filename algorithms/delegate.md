# DELEGATE

A candidate child grant may be created only when:

- parent exists
- parent is active and currently valid
- parent permits delegation
- child actions are a subset of parent actions
- child targets are a subset of parent targets
- child validity is fully contained by parent validity
- child policy digest equals the governing policy digest unless an explicit future profile defines constrained policy inheritance

Any failure rejects grant creation.
