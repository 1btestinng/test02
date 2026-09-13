# Multi-provider market-data reconciliation

The market-data engine now has a reusable reconciliation boundary for markets where a primary and secondary feed are available.

## Policy

- Compare observations by normalized ticker.
- Reject invalid prices, timestamps, or source metadata.
- Reject missing secondary observations rather than silently treating the primary feed as confirmed.
- Reject observations whose timestamps are outside the configured skew window.
- Reject material price differences above the configured tolerance.
- Never average conflicting market prices and never invent a replacement value.

The default quote tolerance is **0.5%** and the default timestamp skew is **15 minutes**. These are engineering defaults, not claims about any particular vendor's SLA; callers can override them when the contracted feeds require a different policy.

## Result semantics

`agreed` means the primary and secondary observations are valid, temporally aligned, and within the price tolerance.

`disagreed` means the feeds conflict materially or are too far apart in time.

`missing-secondary` means the secondary feed did not provide the instrument.

`invalid` means at least one observation fails basic validation.

A reconciliation summary is `ok` only when every primary observation has a valid matching secondary observation and all comparisons agree.

## Production integration

The engine is intentionally separate from individual providers. Provider adapters should normalize their upstream payloads into the shared observation shape, after which the reconciliation engine can compare them consistently.

Until a second licensed/authorized feed is actually configured, the canonical API should continue to expose the single configured provider or explicitly labeled snapshot mode. The application must not claim that reconciliation is active merely because the engine exists.
