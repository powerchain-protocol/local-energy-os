//! PowerChain Marketplace domain primitive.
#[derive(Clone, Debug, PartialEq)]
pub struct MarketplaceState { pub authority: [u8; 32], pub paused: bool }
impl MarketplaceState { pub fn assert_active(&self) -> Result<(), &'static str> { if self.paused { Err("program paused") } else { Ok(()) } } }
