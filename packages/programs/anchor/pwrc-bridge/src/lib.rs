#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct BridgeSupply { pub native_locked: u64, pub solana_circulating: u64, pub nonce: u64, pub paused: bool }
impl BridgeSupply {
    pub fn can_mint(&self, amount: u64) -> bool {
        !self.paused && self.solana_circulating.checked_add(amount).map(|next| next <= self.native_locked).unwrap_or(false)
    }
    pub fn record_mint(&mut self, amount: u64) -> Result<(), &'static str> {
        if !self.can_mint(amount) { return Err("bridge supply invariant violated"); }
        self.solana_circulating = self.solana_circulating.checked_add(amount).ok_or("overflow")?;
        self.nonce = self.nonce.checked_add(1).ok_or("nonce overflow")?;
        Ok(())
    }
    pub fn record_burn(&mut self, amount: u64) -> Result<(), &'static str> {
        self.solana_circulating = self.solana_circulating.checked_sub(amount).ok_or("insufficient circulating supply")?;
        self.nonce = self.nonce.checked_add(1).ok_or("nonce overflow")?;
        Ok(())
    }
}
