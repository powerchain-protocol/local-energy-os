import { PowerChainIcon } from "@powerchain/ui";

export function AuthFormFeedback({ state, title, message }: { state: "error" | "success" | "info"; title: string; message: string }) {
  return <div className={`pc-auth-feedback is-${state}`} role={state === "error" ? "alert" : "status"} aria-live="polite"><span><PowerChainIcon name={state === "error" ? "warning" : state === "success" ? "shield" : "status"}/></span><div><strong>{title}</strong><p>{message}</p></div></div>;
}

export function AuthSubmitButton({ pending, children }: { pending: boolean; children: string }) {
  return <button className="pc-auth-submit" type="submit" disabled={pending} aria-busy={pending}>{pending ? <><span className="pc-auth-spinner" aria-hidden="true"/>Authenticating…</> : <>{children}<PowerChainIcon name="arrow"/></>}</button>;
}
