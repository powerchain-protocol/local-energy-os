use anchor_lang::prelude::*;
#[account]
pub struct CertificateRegistry { pub authority: Pubkey, pub issued: u64, pub retired: u64, pub paused: bool, pub bump: u8 }
#[account]
pub struct CertificateRecord { pub registry: Pubkey, pub owner: Pubkey, pub asset: Pubkey, pub quantity_base_units: u64, pub vintage: u16, pub kind: u8, pub status: u8, pub proof_hash: [u8;32], pub mint: Pubkey, pub bump: u8 }
pub fn validate_issue(quantity:u64, already_issued:bool, paused:bool)->Result<()> { require!(!paused, CertificateError::Paused); require!(quantity>0, CertificateError::InvalidQuantity); require!(!already_issued, CertificateError::DuplicateIssuance); Ok(()) }
#[error_code]
pub enum CertificateError { #[msg("Certification program is paused")] Paused, #[msg("Certificate quantity must be positive")] InvalidQuantity, #[msg("Certificate has already been issued")] DuplicateIssuance }
