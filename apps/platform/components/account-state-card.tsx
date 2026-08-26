import { ACCOUNT_STATE_COPY, type AccountState } from "@powerchain/auth/account-state";
import { StatusBadge } from "@powerchain/ui";

export function AccountStateCard({ state }: { state: AccountState }) {
  const item = ACCOUNT_STATE_COPY[state];
  return <div className="pc-account-state" data-state={state}><div><span>Account state</span><strong>{item.label}</strong><p>{item.description}</p></div><StatusBadge tone={item.tone}>{item.label}</StatusBadge></div>;
}
