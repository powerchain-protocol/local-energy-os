"use client";

import { useMemo, useState } from "react";
import { evaluatePassword, passwordStrength, PASSWORD_POLICY } from "@powerchain/auth/password-policy";
import { PowerChainIcon } from "@powerchain/ui";

export function PasswordField({ id, label = "Password", value, onChange, email, showRules = false, autoComplete = "current-password" }: {
  id: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  email?: string;
  showRules?: boolean;
  autoComplete?: "current-password" | "new-password";
}) {
  const [visible, setVisible] = useState(false);
  const rules = useMemo(() => evaluatePassword(value, email), [value, email]);
  const strength = useMemo(() => passwordStrength(value, email), [value, email]);
  return <div className="pc-auth-field-group">
    <label htmlFor={id}>{label}</label>
    <div className="pc-auth-password-wrap">
      <input id={id} name={id} type={visible ? "text" : "password"} value={value} onChange={(event) => onChange(event.target.value)} autoComplete={autoComplete} minLength={showRules ? PASSWORD_POLICY.minLength : undefined} maxLength={PASSWORD_POLICY.maxLength} aria-describedby={showRules ? `${id}-rules` : undefined}/>
      <button type="button" className="pc-auth-field-action" onClick={() => setVisible((current) => !current)} aria-label={visible ? "Hide password" : "Show password"}><PowerChainIcon name={visible ? "close" : "status"}/><span>{visible ? "Hide" : "Show"}</span></button>
    </div>
    {showRules ? <div id={`${id}-rules`} className="pc-password-policy">
      <div className="pc-password-strength"><span>Strength</span><div aria-hidden="true">{[1,2,3,4].map((step) => <i key={step} className={step <= strength.score ? "is-active" : ""}/>)}</div><strong>{strength.label}</strong></div>
      <ul>{rules.map((rule) => <li key={rule.id} className={rule.passed ? "is-valid" : ""}><span>{rule.passed ? "✓" : "○"}</span>{rule.label}</li>)}</ul>
    </div> : null}
  </div>;
}
