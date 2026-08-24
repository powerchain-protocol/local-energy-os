use anchor_lang::prelude::*;
#[derive(AnchorSerialize,AnchorDeserialize,Clone,Default)]
pub struct EnergyProof{pub meter:Pubkey,pub asset:Pubkey,pub measurement_hash:[u8;32],pub verified_wh:u64,pub sequence:u64,pub validator_quorum:u16,pub minted:bool,pub settled:bool}
impl EnergyProof{pub fn assert_mintable(&self)->Result<()>{require!(self.verified_wh>0,PowerChainProofError::ZeroEnergy);require!(!self.minted,PowerChainProofError::AlreadyMinted);require!(self.validator_quorum>=2,PowerChainProofError::InsufficientQuorum);Ok(())}}
#[error_code]pub enum PowerChainProofError{#[msg("Verified energy must be greater than zero")]ZeroEnergy,#[msg("Energy proof has already been minted")]AlreadyMinted,#[msg("Validator quorum is insufficient")]InsufficientQuorum}
