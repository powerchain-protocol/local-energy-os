use anchor_lang::prelude::*;
#[derive(AnchorSerialize,AnchorDeserialize,Clone,Default)]pub struct AiRecommendation{pub recommendation_hash:[u8;32],pub model_hash:[u8;32],pub confidence_bps:u16,pub requires_approval:bool,pub approved:bool,pub executed:bool,pub created_at:i64}
impl AiRecommendation{pub fn approve(&mut self)->Result<()>{require!(self.confidence_bps<=10_000,GridLlmError::InvalidConfidence);self.approved=true;Ok(())}pub fn mark_executed(&mut self)->Result<()>{require!(!self.requires_approval||self.approved,GridLlmError::ApprovalRequired);self.executed=true;Ok(())}}
#[error_code]pub enum GridLlmError{#[msg("Confidence must be 0-10000 basis points")]InvalidConfidence,#[msg("Recommendation requires approval")]ApprovalRequired}
