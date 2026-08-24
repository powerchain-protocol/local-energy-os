//! PowerChain Escrow domain primitive.
#[derive(Clone, Debug, PartialEq)]
pub struct EscrowState { pub authority: [u8; 32], pub paused: bool }
impl EscrowState { pub fn assert_active(&self) -> Result<(), &'static str> { if self.paused { Err("program paused") } else { Ok(()) } } }
