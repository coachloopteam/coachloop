// A subscription only stops granting access once Paddle's status has
// actually flipped to 'canceled' or 'paused' — a pending scheduled_change
// (e.g. "cancel at period end") leaves status at 'active' until the
// effective date arrives, so it must NOT revoke access early. See
// subscriptions.scheduled_change_action / scheduled_change_at.
const ACCESS_GRANTING_STATUSES = new Set(["active", "trialing"]);

export function statusGrantsAccess(status: string): boolean {
  return ACCESS_GRANTING_STATUSES.has(status);
}
