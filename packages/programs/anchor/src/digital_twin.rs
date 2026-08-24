use anchor_lang::prelude::*;
#[account]pub struct RenewableAssetTwin{pub authority:Pubkey,pub asset_id:[u8;32],pub meter:Pubkey,pub capacity_kw:u64,pub current_output_kw:u64,pub carbon_avoided_kg:u64,pub tokenized_energy_wh:u64,pub updated_at:i64,pub bump:u8}
impl RenewableAssetTwin{pub const SPACE:usize=8+32+32+32+8+8+8+8+8+1;pub fn update_output(&mut self,output_kw:u64,carbon_kg:u64,clock:&Clock){self.current_output_kw=output_kw;self.carbon_avoided_kg=carbon_kg;self.updated_at=clock.unix_timestamp;}}
