# Program testing

Program tests cover successful instructions, invalid signers, incorrect account owners, duplicate submissions, arithmetic boundaries, unauthorized state changes, and lifecycle transitions. Tests should use deterministic fixtures and assert emitted events as well as account state.

Run the Rust workspace tests and JavaScript smoke suite for every change. Integration tests must target a disposable validator or devnet account and must never depend on production balances.
