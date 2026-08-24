use anchor_lang::prelude::*;
#[account]
pub struct NetworkConfig { pub authority: Pubkey, pub treasury: Pubkey, pub paused: bool, pub bump: u8 }
impl NetworkConfig { pub const SPACE: usize = 8 + 32 + 32 + 1 + 1; }
