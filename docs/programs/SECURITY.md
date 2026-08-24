# Program security

Every instruction must validate account ownership, required signers, program-derived addresses, arithmetic bounds, lifecycle state, and authorization scope. Never trust client-provided timestamps, token decimals, or settlement totals without independent validation.

Changes require peer review, deterministic tests, dependency auditing, and an upgrade-authority plan. Private keys and seed phrases must never enter source control, application logs, or CI artifacts.
