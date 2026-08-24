//! PowerChain Treasury domain primitive.
#[derive(Clone, Debug, PartialEq)]
pub struct TreasuryState { pub authority: [u8; 32], pub paused: bool }
impl TreasuryState { pub fn assert_active(&self) -> Result<(), &'static str> { if self.paused { Err("program paused") } else { Ok(()) } } }
