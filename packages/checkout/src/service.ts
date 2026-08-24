export type CheckoutCurrency = "EURC" | "PWRC" | "SOL" | "USDC";
export type CheckoutStatus = "created" | "review" | "pending_signature" | "submitted" | "confirmed" | "cancelled" | "expired";

export interface CheckoutLineInput {
  id: string;
  name: string;
  quantity: number;
  unitAmountMinor: string;
}

export interface CreateCheckoutInput {
  currency: CheckoutCurrency;
  lines: readonly CheckoutLineInput[];
  payerWallet?: string;
  returnUrl?: string;
}

export interface CheckoutTotals {
  subtotalMinor: string;
  serviceFeeMinor: string;
  networkFeeMinor: string | null;
  totalMinor: string;
}

export interface CheckoutSession extends CreateCheckoutInput {
  id: string;
  status: CheckoutStatus;
  lines: readonly CheckoutLineInput[];
  totals: CheckoutTotals;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  settlementSignature?: string;
}

export class CheckoutError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "CheckoutError";
    this.code = code;
  }
}

function positiveInteger(value: string, field: string) {
  if (!/^\d+$/.test(value)) throw new CheckoutError("INVALID_AMOUNT", `${field} must be a non-negative integer string`);
  return BigInt(value);
}

export function calculateCheckoutTotals(lines: readonly CheckoutLineInput[], serviceFeeBps = 250): CheckoutTotals {
  if (!Number.isInteger(serviceFeeBps) || serviceFeeBps < 0 || serviceFeeBps > 10_000) throw new CheckoutError("INVALID_FEE", "Service fee must be from 0 through 10000 basis points");
  if (!lines.length) throw new CheckoutError("EMPTY_CART", "Checkout requires at least one line item");
  const subtotal = lines.reduce((total, line) => {
    if (!line.id.trim() || !line.name.trim()) throw new CheckoutError("INVALID_LINE", "Every line requires an id and name");
    if (!Number.isSafeInteger(line.quantity) || line.quantity < 1) throw new CheckoutError("INVALID_QUANTITY", "Line quantities must be positive safe integers");
    return total + positiveInteger(line.unitAmountMinor, "unitAmountMinor") * BigInt(line.quantity);
  }, 0n);
  const serviceFee = (subtotal * BigInt(serviceFeeBps) + 9_999n) / 10_000n;
  return { subtotalMinor: subtotal.toString(), serviceFeeMinor: serviceFee.toString(), networkFeeMinor: null, totalMinor: (subtotal + serviceFee).toString() };
}

export function createCheckoutService(options: { serviceFeeBps?: number; sessionTtlMinutes?: number } = {}) {
  const sessions = new Map<string, CheckoutSession>();
  const serviceFeeBps = options.serviceFeeBps ?? 250;
  const sessionTtlMinutes = options.sessionTtlMinutes ?? 30;

  function get(id: string) {
    const session = sessions.get(id);
    if (!session) throw new CheckoutError("SESSION_NOT_FOUND", "Checkout session was not found");
    if (session.status !== "confirmed" && session.status !== "cancelled" && Date.parse(session.expiresAt) <= Date.now()) {
      const expired = { ...session, status: "expired" as const, updatedAt: new Date().toISOString() };
      sessions.set(id, expired);
      return expired;
    }
    return session;
  }

  return {
    create(input: CreateCheckoutInput) {
      const now = new Date();
      if (input.returnUrl && !/^https?:\/\//.test(input.returnUrl)) throw new CheckoutError("INVALID_RETURN_URL", "returnUrl must use HTTP or HTTPS");
      const session: CheckoutSession = {
        ...input,
        id: `chk_${crypto.randomUUID().replaceAll("-", "")}`,
        lines: input.lines.map((line) => ({ ...line })),
        totals: calculateCheckoutTotals(input.lines, serviceFeeBps),
        status: "created",
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        expiresAt: new Date(now.getTime() + sessionTtlMinutes * 60_000).toISOString(),
      };
      sessions.set(session.id, session);
      return session;
    },
    get,
    review(id: string) {
      const current = get(id);
      if (current.status !== "created" && current.status !== "review") throw new CheckoutError("INVALID_STATE", `Cannot review a ${current.status} session`);
      const updated = { ...current, status: "review" as const, updatedAt: new Date().toISOString() };
      sessions.set(id, updated);
      return updated;
    },
    requestSignature(id: string, payerWallet: string) {
      const current = get(id);
      if (current.status !== "review") throw new CheckoutError("INVALID_STATE", "Session must be reviewed before wallet approval");
      if (!payerWallet.trim()) throw new CheckoutError("INVALID_WALLET", "A payer wallet is required");
      const updated = { ...current, payerWallet, status: "pending_signature" as const, updatedAt: new Date().toISOString() };
      sessions.set(id, updated);
      return updated;
    },
    submit(id: string, signature: string) {
      const current = get(id);
      if (current.status !== "pending_signature") throw new CheckoutError("INVALID_STATE", "Wallet approval is not pending");
      if (signature.trim().length < 32) throw new CheckoutError("INVALID_SIGNATURE", "A valid settlement signature is required");
      const updated = { ...current, settlementSignature: signature, status: "submitted" as const, updatedAt: new Date().toISOString() };
      sessions.set(id, updated);
      return updated;
    },
    confirm(id: string, signature: string) {
      const current = get(id);
      if (current.status !== "submitted" || current.settlementSignature !== signature) throw new CheckoutError("INVALID_SETTLEMENT", "Settlement signature does not match the submitted transaction");
      const updated = { ...current, status: "confirmed" as const, updatedAt: new Date().toISOString() };
      sessions.set(id, updated);
      return updated;
    },
    cancel(id: string) {
      const current = get(id);
      if (["confirmed", "submitted", "expired"].includes(current.status)) throw new CheckoutError("INVALID_STATE", `Cannot cancel a ${current.status} session`);
      const updated = { ...current, status: "cancelled" as const, updatedAt: new Date().toISOString() };
      sessions.set(id, updated);
      return updated;
    },
  };
}
