use anchor_lang::prelude::*;

#[account]
pub struct DePinNode {
    pub authority: Pubkey,
    pub node_id: [u8; 32],
    pub network: u8,
    pub status: u8,
    pub verified_uplinks: u64,
    pub rewards_accrued: u64,
    pub last_seen_at: i64,
}

impl DePinNode {
    pub const SPACE: usize = 8 + 32 + 32 + 1 + 1 + 8 + 8 + 8;
}

pub fn calculate_reward(verified_uplinks: u64, reward_per_uplink: u64) -> Result<u64> {
    verified_uplinks.checked_mul(reward_per_uplink).ok_or(error!(DePinError::Overflow))
}

#[error_code]
pub enum DePinError {
    #[msg("Reward calculation overflow")]
    Overflow,
}
