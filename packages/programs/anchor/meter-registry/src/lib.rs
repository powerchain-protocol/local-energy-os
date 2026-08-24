//! PowerChain MeterRegistry domain primitive.
#[derive(Clone, Debug, PartialEq)]
pub struct MeterRegistryState { pub authority: [u8; 32], pub paused: bool }
impl MeterRegistryState { pub fn assert_active(&self) -> Result<(), &'static str> { if self.paused { Err("program paused") } else { Ok(()) } } }
