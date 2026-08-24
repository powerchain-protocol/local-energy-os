#[derive(Debug, Clone)] pub struct Proposal { pub id:u64, pub proposer:[u8;32], pub starts_at:i64, pub ends_at:i64, pub yes_votes:u64, pub no_votes:u64 }
impl Proposal { pub fn is_open(&self,now:i64)->bool { now>=self.starts_at && now<self.ends_at } pub fn passed(&self,quorum:u64)->bool { self.yes_votes.saturating_add(self.no_votes)>=quorum && self.yes_votes>self.no_votes } }
