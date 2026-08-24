//! Shared program errors used by PowerChain domain modules.
use anchor_lang::prelude::*;

#[error_code]
pub enum PowerChainError {
    #[msg("Amount must be greater than zero")]
    InvalidAmount,
    #[msg("Arithmetic overflow")]
    ArithmeticOverflow,
    #[msg("Oracle quorum was not reached")]
    OracleQuorumNotReached,
    #[msg("Measurement has already been tokenized")]
    DuplicateIssuance,
    #[msg("Measurement sequence is stale or out of order")]
    InvalidSequence,
    #[msg("Operation is not authorized")]
    Unauthorized,
    #[msg("Program is paused")]
    ProgramPaused,
    #[msg("Settlement state transition is invalid")]
    InvalidSettlementState,
}
