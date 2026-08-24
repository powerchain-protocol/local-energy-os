//! PowerChain Governance domain primitive.
#[derive(Clone, Debug, PartialEq)]
pub struct GovernanceState { pub authority: [u8; 32], pub paused: bool }
impl GovernanceState { pub fn assert_active(&self) -> Result<(), &'static str> { if self.paused { Err("program paused") } else { Ok(()) } } }
