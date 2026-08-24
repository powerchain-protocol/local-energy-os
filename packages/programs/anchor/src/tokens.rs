//! PowerChain token program domain constants and validation helpers.
pub const PWRC_SYMBOL: &str = "PWRC";
pub const CRT_SYMBOL: &str = "CRT";
pub const TOKEN_DECIMALS: u8 = 9;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum TokenKind { UtilityGovernance, CarbonCredit }

pub fn validate_carbon_amount(amount: u64) -> bool { amount > 0 }
pub fn governance_weight(balance: u64, locked_balance: u64) -> u128 {
    balance as u128 + (locked_balance as u128 * 2)
}
