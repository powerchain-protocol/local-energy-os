use anchor_lang::prelude::*;

declare_id!("8QfX3BkJd3hY8wWbMh2n7eL2j24CrB4K1fYyYH2CwC8L");

pub mod depin;
pub mod exchange;
pub mod governance;
pub mod metering;
pub mod registry;
pub mod smart_grid;
pub mod tokens;
pub mod treasury;

pub mod digital_twin;
pub mod errors;
pub mod events;
pub mod gridllm;
pub mod invariants;
pub mod proof_of_energy;
pub mod config;

pub mod certificate_registry;
