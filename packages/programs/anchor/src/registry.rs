#[derive(Debug, Clone)] pub struct RenewableProject { pub authority:[u8;32], pub capacity_watts:u64, pub issued_rec_wh:u64, pub verified:bool }
impl RenewableProject { pub fn issue_rec(&mut self,energy_wh:u64)->Result<(),&'static str>{if !self.verified{return Err("project not verified")}self.issued_rec_wh=self.issued_rec_wh.checked_add(energy_wh).ok_or("overflow")?;Ok(())} }
