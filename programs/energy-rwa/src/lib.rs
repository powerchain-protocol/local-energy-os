use anchor_lang::prelude::*;

declare_id!("11111111111111111111111111111111");

const UNIT_KWH: u8 = 0;
const UNIT_MWH: u8 = 1;
const WH_PER_KWH: u64 = 1_000;
const WH_PER_MWH: u64 = 1_000_000;

#[program]
pub mod powerchain_energy_rwa {
    use super::*;

    pub fn initialize_config(
        ctx: Context<InitializeConfig>,
        verification_authority: Pubkey,
    ) -> Result<()> {
        let config = &mut ctx.accounts.config;
        config.admin = ctx.accounts.admin.key();
        config.verification_authority = verification_authority;
        config.paused = false;
        config.bump = ctx.bumps.config;
        emit!(ConfigInitialized { admin: config.admin, verification_authority });
        Ok(())
    }

    pub fn create_batch(
        ctx: Context<CreateBatch>,
        batch_id: [u8; 32],
        verified_wh: u64,
        source: u8,
        evidence_root: [u8; 32],
    ) -> Result<()> {
        require!(!ctx.accounts.config.paused, EnergyError::ProgramPaused);
        require!(verified_wh > 0, EnergyError::InvalidAmount);
        let batch = &mut ctx.accounts.batch;
        batch.batch_id = batch_id;
        batch.verification_authority = ctx.accounts.verification_authority.key();
        batch.verified_wh = verified_wh;
        batch.invalidated_wh = 0;
        batch.positioned_wh = 0;
        batch.retired_wh = 0;
        batch.source = source;
        batch.evidence_root = evidence_root;
        batch.finalized = false;
        batch.bump = ctx.bumps.batch;
        emit!(BatchCreated { batch: batch.key(), batch_id, verified_wh, source, evidence_root });
        Ok(())
    }

    pub fn finalize_batch(ctx: Context<FinalizeBatch>) -> Result<()> {
        require!(!ctx.accounts.config.paused, EnergyError::ProgramPaused);
        require!(!ctx.accounts.batch.finalized, EnergyError::BatchAlreadyFinalized);
        ctx.accounts.batch.finalized = true;
        emit!(BatchFinalized { batch: ctx.accounts.batch.key() });
        Ok(())
    }

    pub fn invalidate_batch_energy(ctx: Context<FinalizeBatch>, amount_wh: u64) -> Result<()> {
        require!(!ctx.accounts.config.paused, EnergyError::ProgramPaused);
        require!(amount_wh > 0, EnergyError::InvalidAmount);
        let batch = &mut ctx.accounts.batch;
        let next_invalidated = batch.invalidated_wh.checked_add(amount_wh).ok_or(EnergyError::MathOverflow)?;
        require!(next_invalidated <= batch.verified_wh, EnergyError::InvalidAmount);
        let backed = batch.verified_wh.checked_sub(next_invalidated).ok_or(EnergyError::MathOverflow)?;
        require!(batch.positioned_wh <= backed, EnergyError::InvalidationUndercollateralizesPositions);
        batch.invalidated_wh = next_invalidated;
        emit!(BatchEnergyInvalidated { batch: batch.key(), amount_wh, total_invalidated_wh: next_invalidated });
        Ok(())
    }

    pub fn create_position(
        ctx: Context<CreatePosition>,
        position_nonce: u64,
        amount_wh: u64,
        unit: u8,
    ) -> Result<()> {
        require!(!ctx.accounts.config.paused, EnergyError::ProgramPaused);
        require!(ctx.accounts.batch.finalized, EnergyError::BatchNotFinalized);
        validate_unit_amount(amount_wh, unit)?;

        let batch = &mut ctx.accounts.batch;
        let available = batch
            .verified_wh
            .checked_sub(batch.invalidated_wh)
            .ok_or(EnergyError::MathOverflow)?;
        let next = batch
            .positioned_wh
            .checked_add(amount_wh)
            .ok_or(EnergyError::MathOverflow)?;
        require!(next <= available, EnergyError::OverIssuance);
        batch.positioned_wh = next;

        let position = &mut ctx.accounts.position;
        position.batch = batch.key();
        position.owner = ctx.accounts.owner.key();
        position.position_nonce = position_nonce;
        position.amount_wh = amount_wh;
        position.reserved_wh = 0;
        position.retired_wh = 0;
        position.unit = unit;
        position.bump = ctx.bumps.position;
        emit!(PositionCreated { position: position.key(), batch: batch.key(), owner: position.owner, position_nonce, amount_wh, unit });
        Ok(())
    }

    pub fn reserve(ctx: Context<MutatePosition>, amount_wh: u64) -> Result<()> {
        require!(!ctx.accounts.config.paused, EnergyError::ProgramPaused);
        require!(amount_wh > 0, EnergyError::InvalidAmount);
        let position = &mut ctx.accounts.position;
        let committed = position
            .retired_wh
            .checked_add(position.reserved_wh)
            .and_then(|value| value.checked_add(amount_wh))
            .ok_or(EnergyError::MathOverflow)?;
        require!(committed <= position.amount_wh, EnergyError::InsufficientAvailable);
        position.reserved_wh = position
            .reserved_wh
            .checked_add(amount_wh)
            .ok_or(EnergyError::MathOverflow)?;
        emit!(PositionReserved { position: position.key(), amount_wh, reserved_wh: position.reserved_wh });
        Ok(())
    }

    pub fn release(ctx: Context<MutatePosition>, amount_wh: u64) -> Result<()> {
        require!(!ctx.accounts.config.paused, EnergyError::ProgramPaused);
        require!(amount_wh > 0 && amount_wh <= ctx.accounts.position.reserved_wh, EnergyError::InvalidAmount);
        ctx.accounts.position.reserved_wh = ctx.accounts.position.reserved_wh
            .checked_sub(amount_wh)
            .ok_or(EnergyError::MathOverflow)?;
        emit!(PositionReleased { position: ctx.accounts.position.key(), amount_wh, reserved_wh: ctx.accounts.position.reserved_wh });
        Ok(())
    }

    pub fn retire(ctx: Context<RetirePosition>, amount_wh: u64) -> Result<()> {
        require!(!ctx.accounts.config.paused, EnergyError::ProgramPaused);
        require!(amount_wh > 0, EnergyError::InvalidAmount);
        let position = &mut ctx.accounts.position;
        let next_retired = position
            .retired_wh
            .checked_add(amount_wh)
            .ok_or(EnergyError::MathOverflow)?;
        require!(next_retired <= position.amount_wh, EnergyError::InvalidAmount);
        position.retired_wh = next_retired;
        position.reserved_wh = position.reserved_wh.saturating_sub(amount_wh);

        let batch = &mut ctx.accounts.batch;
        batch.retired_wh = batch
            .retired_wh
            .checked_add(amount_wh)
            .ok_or(EnergyError::MathOverflow)?;
        require!(batch.retired_wh <= batch.positioned_wh, EnergyError::RetirementExceedsIssued);
        emit!(PositionRetired { position: position.key(), batch: batch.key(), amount_wh, position_retired_wh: position.retired_wh, batch_retired_wh: batch.retired_wh });
        Ok(())
    }

    pub fn set_paused(ctx: Context<AdminConfig>, paused: bool) -> Result<()> {
        ctx.accounts.config.paused = paused;
        emit!(ProgramPauseChanged { paused });
        Ok(())
    }

    pub fn set_verification_authority(
        ctx: Context<AdminConfig>,
        verification_authority: Pubkey,
    ) -> Result<()> {
        ctx.accounts.config.verification_authority = verification_authority;
        emit!(VerificationAuthorityChanged { verification_authority });
        Ok(())
    }
}

fn validate_unit_amount(amount_wh: u64, unit: u8) -> Result<()> {
    require!(amount_wh > 0, EnergyError::InvalidAmount);
    match unit {
        UNIT_KWH => require!(amount_wh % WH_PER_KWH == 0, EnergyError::UnitAlignment),
        UNIT_MWH => require!(amount_wh % WH_PER_MWH == 0, EnergyError::UnitAlignment),
        _ => return err!(EnergyError::InvalidUnit),
    }
    Ok(())
}

#[derive(Accounts)]
pub struct InitializeConfig<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        init,
        payer = admin,
        space = 8 + PowerChainConfig::INIT_SPACE,
        seeds = [b"config"],
        bump
    )]
    pub config: Account<'info, PowerChainConfig>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(batch_id: [u8; 32])]
pub struct CreateBatch<'info> {
    #[account(seeds = [b"config"], bump = config.bump, has_one = verification_authority)]
    pub config: Account<'info, PowerChainConfig>,
    #[account(mut)]
    pub verification_authority: Signer<'info>,
    #[account(
        init,
        payer = verification_authority,
        space = 8 + EnergyBatch::INIT_SPACE,
        seeds = [b"batch", batch_id.as_ref()],
        bump
    )]
    pub batch: Account<'info, EnergyBatch>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct FinalizeBatch<'info> {
    #[account(seeds = [b"config"], bump = config.bump, has_one = verification_authority)]
    pub config: Account<'info, PowerChainConfig>,
    pub verification_authority: Signer<'info>,
    #[account(mut, has_one = verification_authority)]
    pub batch: Account<'info, EnergyBatch>,
}

#[derive(Accounts)]
#[instruction(position_nonce: u64)]
pub struct CreatePosition<'info> {
    #[account(seeds = [b"config"], bump = config.bump)]
    pub config: Account<'info, PowerChainConfig>,
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(mut)]
    pub batch: Account<'info, EnergyBatch>,
    #[account(
        init,
        payer = owner,
        space = 8 + EnergyPosition::INIT_SPACE,
        seeds = [b"position", batch.key().as_ref(), owner.key().as_ref(), &position_nonce.to_le_bytes()],
        bump
    )]
    pub position: Account<'info, EnergyPosition>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MutatePosition<'info> {
    #[account(seeds = [b"config"], bump = config.bump)]
    pub config: Account<'info, PowerChainConfig>,
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(mut, has_one = owner)]
    pub position: Account<'info, EnergyPosition>,
}

#[derive(Accounts)]
pub struct RetirePosition<'info> {
    #[account(seeds = [b"config"], bump = config.bump)]
    pub config: Account<'info, PowerChainConfig>,
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(mut, has_one = owner, constraint = position.batch == batch.key() @ EnergyError::BatchMismatch)]
    pub position: Account<'info, EnergyPosition>,
    #[account(mut)]
    pub batch: Account<'info, EnergyBatch>,
}

#[derive(Accounts)]
pub struct AdminConfig<'info> {
    #[account(mut, seeds = [b"config"], bump = config.bump, has_one = admin)]
    pub config: Account<'info, PowerChainConfig>,
    pub admin: Signer<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct PowerChainConfig {
    pub admin: Pubkey,
    pub verification_authority: Pubkey,
    pub paused: bool,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct EnergyBatch {
    pub batch_id: [u8; 32],
    pub verification_authority: Pubkey,
    pub verified_wh: u64,
    pub invalidated_wh: u64,
    pub positioned_wh: u64,
    pub retired_wh: u64,
    pub source: u8,
    pub evidence_root: [u8; 32],
    pub finalized: bool,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct EnergyPosition {
    pub batch: Pubkey,
    pub owner: Pubkey,
    pub position_nonce: u64,
    pub amount_wh: u64,
    pub reserved_wh: u64,
    pub retired_wh: u64,
    pub unit: u8,
    pub bump: u8,
}

#[event]
pub struct ConfigInitialized { pub admin: Pubkey, pub verification_authority: Pubkey }
#[event]
pub struct VerificationAuthorityChanged { pub verification_authority: Pubkey }
#[event]
pub struct ProgramPauseChanged { pub paused: bool }
#[event]
pub struct BatchCreated { pub batch: Pubkey, pub batch_id: [u8; 32], pub verified_wh: u64, pub source: u8, pub evidence_root: [u8; 32] }
#[event]
pub struct BatchFinalized { pub batch: Pubkey }
#[event]
pub struct BatchEnergyInvalidated { pub batch: Pubkey, pub amount_wh: u64, pub total_invalidated_wh: u64 }
#[event]
pub struct PositionCreated { pub position: Pubkey, pub batch: Pubkey, pub owner: Pubkey, pub position_nonce: u64, pub amount_wh: u64, pub unit: u8 }
#[event]
pub struct PositionReserved { pub position: Pubkey, pub amount_wh: u64, pub reserved_wh: u64 }
#[event]
pub struct PositionReleased { pub position: Pubkey, pub amount_wh: u64, pub reserved_wh: u64 }
#[event]
pub struct PositionRetired { pub position: Pubkey, pub batch: Pubkey, pub amount_wh: u64, pub position_retired_wh: u64, pub batch_retired_wh: u64 }

#[error_code]
pub enum EnergyError {
    #[msg("Invalid amount")]
    InvalidAmount,
    #[msg("Invalid Energy RWA unit")]
    InvalidUnit,
    #[msg("Energy RWA amount is not aligned to the selected kWh/MWh denomination")]
    UnitAlignment,
    #[msg("Energy RWA exceeds verified physical supply")]
    OverIssuance,
    #[msg("Insufficient available energy")]
    InsufficientAvailable,
    #[msg("Arithmetic overflow")]
    MathOverflow,
    #[msg("Energy Batch has not been finalized by the verification authority")]
    BatchNotFinalized,
    #[msg("Energy Batch is already finalized")]
    BatchAlreadyFinalized,
    #[msg("Invalidation would reduce verified backing below issued Energy Positions")]
    InvalidationUndercollateralizesPositions,
    #[msg("Program is paused")]
    ProgramPaused,
    #[msg("Energy Position references a different Energy Batch")]
    BatchMismatch,
    #[msg("Retirement exceeds issued Energy RWA")]
    RetirementExceedsIssued,
}
