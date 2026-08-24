use anchor_lang::prelude::*;

#[account]
pub struct GridAsset {
    pub authority: Pubkey,
    pub asset_id: [u8; 32],
    pub capacity_watts: u64,
    pub generated_wh: u64,
    pub consumed_wh: u64,
    pub last_reported_at: i64,
    pub bump: u8,
}

impl GridAsset {
    pub const SPACE: usize = 8 + 32 + 32 + 8 + 8 + 8 + 8 + 1;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct TelemetryReport {
    pub generated_wh: u64,
    pub consumed_wh: u64,
    pub timestamp: i64,
}

pub fn validate_report(report: &TelemetryReport) -> Result<()> {
    require!(report.timestamp > 0, SmartGridError::InvalidTimestamp);
    Ok(())
}

#[error_code]
pub enum SmartGridError {
    #[msg("Telemetry timestamp is invalid")]
    InvalidTimestamp,
}
