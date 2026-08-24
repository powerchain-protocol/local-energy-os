//! Canonical Anchor events emitted by PowerChain programs.
use anchor_lang::prelude::*;

#[event]
pub struct EnergyVerified {
    pub measurement: [u8; 32],
    pub asset: Pubkey,
    pub meter: Pubkey,
    pub verified_wh: u64,
    pub observed_at: i64,
}

#[event]
pub struct EnergyTokenMinted {
    pub proof: [u8; 32],
    pub mint: Pubkey,
    pub recipient: Pubkey,
    pub amount_base_units: u64,
}

#[event]
pub struct SettlementCompleted {
    pub settlement: Pubkey,
    pub buyer: Pubkey,
    pub seller: Pubkey,
    pub amount_base_units: u64,
    pub payment_base_units: u64,
}

#[event]
pub struct BridgeSupplyUpdated {
    pub network: u8,
    pub locked_native: u64,
    pub circulating_remote: u64,
}
