use anchor_lang::prelude::*;

#[account]
pub struct MeterAccount {
    pub owner: Pubkey,
    pub meter_id: [u8; 32],
    pub reading_wh: u64,
    pub nonce: u64,
    pub last_signature: [u8; 64],
    pub updated_at: i64,
}

impl MeterAccount {
    pub const SPACE: usize = 8 + 32 + 32 + 8 + 8 + 64 + 8;
}

pub fn validate_monotonic_reading(previous: u64, next: u64) -> Result<()> {
    require!(next >= previous, MeteringError::ReadingReversal);
    Ok(())
}

#[error_code]
pub enum MeteringError {
    #[msg("Meter reading cannot move backwards")]
    ReadingReversal,
}
