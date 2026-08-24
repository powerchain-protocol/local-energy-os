//! On-chain exchange validation primitives for future Anchor instructions.
use anchor_lang::prelude::*;

pub const MAX_MARKET_SYMBOL_BYTES: usize = 16;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug, PartialEq, Eq)]
pub enum OrderSide { Buy, Sell }

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq, Eq)]
pub struct ExchangeOrderInput {
    pub market: String,
    pub side: OrderSide,
    pub quantity: u64,
    pub limit_price_micros: u64,
    pub expires_at: i64,
}

pub fn validate_order(input: &ExchangeOrderInput, now: i64) -> Result<()> {
    require!(!input.market.is_empty() && input.market.len() <= MAX_MARKET_SYMBOL_BYTES, ExchangeError::InvalidMarket);
    require!(input.quantity > 0, ExchangeError::InvalidQuantity);
    require!(input.limit_price_micros > 0, ExchangeError::InvalidPrice);
    require!(input.expires_at > now, ExchangeError::ExpiredOrder);
    Ok(())
}

#[error_code]
pub enum ExchangeError {
    #[msg("Market symbol is invalid.")] InvalidMarket,
    #[msg("Order quantity must be positive.")] InvalidQuantity,
    #[msg("Limit price must be positive.")] InvalidPrice,
    #[msg("Order expiration must be in the future.")] ExpiredOrder,
}
