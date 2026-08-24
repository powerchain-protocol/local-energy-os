//! PowerChain OracleRegistry domain primitive.
#[derive(Clone, Debug, PartialEq)]
pub struct OracleRegistryState { pub authority: [u8; 32], pub paused: bool }
impl OracleRegistryState { pub fn assert_active(&self) -> Result<(), &'static str> { if self.paused { Err("program paused") } else { Ok(()) } } }
