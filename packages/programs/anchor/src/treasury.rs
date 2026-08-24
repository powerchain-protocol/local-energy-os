#[derive(Debug, Clone)] pub struct TreasuryPolicy { pub authority:[u8;32], pub daily_limit:u64, pub spent_today:u64 }
impl TreasuryPolicy { pub fn authorize(&mut self,amount:u64)->Result<(),&'static str>{let next=self.spent_today.checked_add(amount).ok_or("overflow")?;if next>self.daily_limit{return Err("daily limit exceeded")}self.spent_today=next;Ok(())} }
