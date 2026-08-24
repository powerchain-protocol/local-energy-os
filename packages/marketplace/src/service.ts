export type MarketplaceCurrency = "EURC" | "PWRC" | "SOL" | "USDC";
export type ListingStatus = "draft" | "active" | "paused" | "sold_out" | "closed";

export interface MarketplaceListing {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  currency: MarketplaceCurrency;
  unitAmountMinor: string;
  inventory: number;
  remaining: number;
  status: ListingStatus;
  createdAt: string;
  updatedAt: string;
}

export interface MarketplaceOrder {
  id: string;
  listingId: string;
  buyerId: string;
  quantity: number;
  amountMinor: string;
  currency: MarketplaceCurrency;
  status: "reserved" | "checkout_pending" | "paid" | "cancelled" | "expired";
  checkoutSessionId?: string;
  createdAt: string;
  updatedAt: string;
}

export class MarketplaceError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "MarketplaceError";
    this.code = code;
  }
}

function amount(value: string) {
  if (!/^\d+$/.test(value) || BigInt(value) < 1n) throw new MarketplaceError("INVALID_AMOUNT", "unitAmountMinor must be a positive integer string");
  return BigInt(value);
}

export function createMarketplaceService() {
  const listings = new Map<string, MarketplaceListing>();
  const orders = new Map<string, MarketplaceOrder>();

  function getListing(id: string) {
    const listing = listings.get(id);
    if (!listing) throw new MarketplaceError("LISTING_NOT_FOUND", "Marketplace listing was not found");
    return listing;
  }

  function getOrder(id: string) {
    const order = orders.get(id);
    if (!order) throw new MarketplaceError("ORDER_NOT_FOUND", "Marketplace order was not found");
    return order;
  }

  return {
    list(query = "") {
      const normalized = query.trim().toLowerCase();
      return [...listings.values()].filter((listing) => listing.status === "active" && (!normalized || `${listing.title} ${listing.description}`.toLowerCase().includes(normalized)));
    },
    getListing,
    createListing(input: Omit<MarketplaceListing, "id" | "remaining" | "status" | "createdAt" | "updatedAt">) {
      amount(input.unitAmountMinor);
      if (!input.sellerId.trim() || !input.title.trim()) throw new MarketplaceError("INVALID_LISTING", "sellerId and title are required");
      if (!Number.isSafeInteger(input.inventory) || input.inventory < 1) throw new MarketplaceError("INVALID_INVENTORY", "inventory must be a positive safe integer");
      const now = new Date().toISOString();
      const listing: MarketplaceListing = { ...input, id: `lst_${crypto.randomUUID().replaceAll("-", "")}`, remaining: input.inventory, status: "draft", createdAt: now, updatedAt: now };
      listings.set(listing.id, listing);
      return listing;
    },
    activate(id: string) {
      const current = getListing(id);
      if (current.status !== "draft" && current.status !== "paused") throw new MarketplaceError("INVALID_STATE", `Cannot activate a ${current.status} listing`);
      const updated = { ...current, status: "active" as const, updatedAt: new Date().toISOString() };
      listings.set(id, updated);
      return updated;
    },
    reserve(listingId: string, buyerId: string, quantity: number) {
      const listing = getListing(listingId);
      if (listing.status !== "active") throw new MarketplaceError("LISTING_UNAVAILABLE", "Listing is not active");
      if (!buyerId.trim()) throw new MarketplaceError("INVALID_BUYER", "buyerId is required");
      if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > listing.remaining) throw new MarketplaceError("INVALID_QUANTITY", "Requested quantity is not available");
      const now = new Date().toISOString();
      const nextRemaining = listing.remaining - quantity;
      listings.set(listing.id, { ...listing, remaining: nextRemaining, status: nextRemaining === 0 ? "sold_out" : listing.status, updatedAt: now });
      const order: MarketplaceOrder = { id: `ord_${crypto.randomUUID().replaceAll("-", "")}`, listingId, buyerId, quantity, amountMinor: (amount(listing.unitAmountMinor) * BigInt(quantity)).toString(), currency: listing.currency, status: "reserved", createdAt: now, updatedAt: now };
      orders.set(order.id, order);
      return order;
    },
    attachCheckout(orderId: string, checkoutSessionId: string) {
      const order = getOrder(orderId);
      if (order.status !== "reserved") throw new MarketplaceError("INVALID_STATE", "Only reserved orders can enter checkout");
      if (!checkoutSessionId.trim()) throw new MarketplaceError("INVALID_CHECKOUT", "checkoutSessionId is required");
      const updated = { ...order, checkoutSessionId, status: "checkout_pending" as const, updatedAt: new Date().toISOString() };
      orders.set(orderId, updated);
      return updated;
    },
    markPaid(orderId: string, checkoutSessionId: string) {
      const order = getOrder(orderId);
      if (order.status !== "checkout_pending" || order.checkoutSessionId !== checkoutSessionId) throw new MarketplaceError("INVALID_CHECKOUT", "Confirmed checkout does not match this order");
      const updated = { ...order, status: "paid" as const, updatedAt: new Date().toISOString() };
      orders.set(orderId, updated);
      return updated;
    },
    getOrder,
  };
}
