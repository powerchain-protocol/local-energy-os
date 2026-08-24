//! PowerChain EnergyToken domain primitive.
#[derive(Clone, Debug, PartialEq)]
pub struct EnergyTokenState { pub authority: [u8; 32], pub paused: bool }
impl EnergyTokenState { pub fn assert_active(&self) -> Result<(), &'static str> { if self.paused { Err("program paused") } else { Ok(()) } } }
