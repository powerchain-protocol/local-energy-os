//! Cross-domain invariants for verified energy, settlement, and treasury accounting.
use crate::errors::PowerChainError;
use anchor_lang::prelude::*;

pub fn require_positive(amount: u64) -> Result<()> {
    require!(amount > 0, PowerChainError::InvalidAmount);
    Ok(())
}

pub fn mintable_energy(
    verified_wh: u64,
    transmission_loss_wh: u64,
    previously_tokenized_wh: u64,
    disputed_wh: u64,
) -> Result<u64> {
    require_positive(verified_wh)?;
    let deductions = transmission_loss_wh
        .checked_add(previously_tokenized_wh)
        .and_then(|value| value.checked_add(disputed_wh))
        .ok_or(PowerChainError::ArithmeticOverflow)?;
    verified_wh
        .checked_sub(deductions)
        .ok_or(PowerChainError::InvalidAmount.into())
}

pub fn enforce_supply_backing(circulating: u64, locked_or_escrowed: u64) -> Result<()> {
    require!(circulating <= locked_or_escrowed, PowerChainError::InvalidAmount);
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn calculates_mintable_energy_without_double_issuance() {
        assert_eq!(mintable_energy(1_000, 20, 100, 30).unwrap(), 850);
    }

    #[test]
    fn rejects_unbacked_supply() {
        assert!(enforce_supply_backing(101, 100).is_err());
    }
}
