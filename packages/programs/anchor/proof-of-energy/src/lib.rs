//! PowerChain ProofOfEnergy domain primitive.
#[derive(Clone, Debug, PartialEq)]
pub struct ProofOfEnergyState { pub authority: [u8; 32], pub paused: bool }
impl ProofOfEnergyState { pub fn assert_active(&self) -> Result<(), &'static str> { if self.paused { Err("program paused") } else { Ok(()) } } }
