export const PASSWORD_POLICY = {
  minLength: 12,
  maxLength: 128,
  requireLowercase: true,
  requireUppercase: true,
  requireNumber: true,
  requireSymbol: true,
} as const;

export type PasswordRuleId =
  | "length"
  | "lowercase"
  | "uppercase"
  | "number"
  | "symbol"
  | "trimmed"
  | "email"
  | "common";

export interface PasswordRuleResult {
  id: PasswordRuleId;
  label: string;
  passed: boolean;
}

const COMMON_PASSWORDS = new Set([
  "password",
  "password123",
  "password123!",
  "123456789012",
  "qwerty123456",
  "letmein123456",
  "powerchain123",
  "powerchain123!",
]);

export function evaluatePassword(password: string, email?: string): PasswordRuleResult[] {
  const normalizedEmail = email?.trim().toLowerCase();
  const localPart = normalizedEmail?.split("@")[0];
  const normalizedPassword = password.toLowerCase();
  return [
    { id: "length", label: `${PASSWORD_POLICY.minLength}–${PASSWORD_POLICY.maxLength} characters`, passed: password.length >= PASSWORD_POLICY.minLength && password.length <= PASSWORD_POLICY.maxLength },
    { id: "lowercase", label: "At least one lowercase letter", passed: /[a-z]/.test(password) },
    { id: "uppercase", label: "At least one uppercase letter", passed: /[A-Z]/.test(password) },
    { id: "number", label: "At least one number", passed: /\d/.test(password) },
    { id: "symbol", label: "At least one symbol", passed: /[^A-Za-z0-9\s]/.test(password) },
    { id: "trimmed", label: "No leading or trailing spaces", passed: password.length === password.trim().length },
    { id: "email", label: "Does not contain your email name", passed: !localPart || localPart.length < 3 || !normalizedPassword.includes(localPart) },
    { id: "common", label: "Not a common or PowerChain-branded password", passed: !COMMON_PASSWORDS.has(normalizedPassword) },
  ];
}

export function passwordIsValid(password: string, email?: string): boolean {
  return evaluatePassword(password, email).every((rule) => rule.passed);
}

export function passwordStrength(password: string, email?: string): { score: 0 | 1 | 2 | 3 | 4; label: "Empty" | "Weak" | "Fair" | "Good" | "Strong" } {
  if (!password) return { score: 0, label: "Empty" };
  const rules = evaluatePassword(password, email);
  const passed = rules.filter((rule) => rule.passed).length;
  const entropyBonus = password.length >= 16 ? 1 : 0;
  const raw = passed + entropyBonus;
  if (raw <= 4) return { score: 1, label: "Weak" };
  if (raw <= 6) return { score: 2, label: "Fair" };
  if (raw <= 8) return { score: 3, label: "Good" };
  return { score: 4, label: "Strong" };
}
