#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, BytesN, Env};

#[test]
fn test_register_audit() {
    let env = Env::default();
    let contract_id = env.register(AuditRegistry, ());
    let client = AuditRegistryClient::new(&env, &contract_id);

    let auditor = Address::generate(&env);
    let contract_addr = Address::generate(&env);
    let report_hash = BytesN::from_array(&env, &[1u8; 32]);

    // Mock authorization
    env.mock_all_auths();

    let audit_id = client.register_audit(&auditor, &contract_addr, &report_hash, &85);

    // Verify the audit exists
    assert!(client.verify_audit(&audit_id));

    // Check count
    assert_eq!(client.get_audit_count(), 1);

    // Retrieve and verify the record
    let record = client.get_audit(&audit_id);
    assert_eq!(record.security_score, 85);
    assert_eq!(record.auditor, auditor);
}

#[test]
fn test_register_multiple_audits() {
    let env = Env::default();
    let contract_id = env.register(AuditRegistry, ());
    let client = AuditRegistryClient::new(&env, &contract_id);

    let auditor = Address::generate(&env);
    let contract_addr = Address::generate(&env);
    let report_hash = BytesN::from_array(&env, &[1u8; 32]);

    env.mock_all_auths();

    // Advance ledger between registrations to get unique timestamps
    env.ledger().with_mut(|li| {
        li.timestamp = 1;
    });
    client.register_audit(&auditor, &contract_addr, &report_hash, &90);

    env.ledger().with_mut(|li| {
        li.timestamp = 2;
    });
    client.register_audit(&auditor, &contract_addr, &report_hash, &70);

    env.ledger().with_mut(|li| {
        li.timestamp = 3;
    });
    client.register_audit(&auditor, &contract_addr, &report_hash, &50);

    assert_eq!(client.get_audit_count(), 3);
    assert_eq!(client.get_contract_audit_count(&contract_addr), 3);

    let audits = client.get_audits_by_contract(&contract_addr);
    assert_eq!(audits.len(), 3);
}

#[test]
#[should_panic(expected = "Score must be 0-100")]
fn test_reject_invalid_score() {
    let env = Env::default();
    let contract_id = env.register(AuditRegistry, ());
    let client = AuditRegistryClient::new(&env, &contract_id);

    let auditor = Address::generate(&env);
    let contract_addr = Address::generate(&env);
    let report_hash = BytesN::from_array(&env, &[1u8; 32]);

    env.mock_all_auths();

    client.register_audit(&auditor, &contract_addr, &report_hash, &101);
}

#[test]
fn test_get_audits_by_contract_empty() {
    let env = Env::default();
    let contract_id = env.register(AuditRegistry, ());
    let client = AuditRegistryClient::new(&env, &contract_id);

    let contract_addr = Address::generate(&env);

    let audits = client.get_audits_by_contract(&contract_addr);
    assert_eq!(audits.len(), 0);
    assert_eq!(client.get_contract_audit_count(&contract_addr), 0);
}

#[test]
fn test_verify_nonexistent_audit_returns_false() {
    let env = Env::default();
    let contract_id = env.register(AuditRegistry, ());
    let client = AuditRegistryClient::new(&env, &contract_id);

    let fake_id = BytesN::from_array(&env, &[0u8; 32]);

    assert!(!client.verify_audit(&fake_id));
}

#[test]
fn test_different_contracts_have_separate_audits() {
    let env = Env::default();
    let contract_id = env.register(AuditRegistry, ());
    let client = AuditRegistryClient::new(&env, &contract_id);

    let auditor = Address::generate(&env);
    let contract_a = Address::generate(&env);
    let contract_b = Address::generate(&env);
    let report_hash = BytesN::from_array(&env, &[2u8; 32]);

    env.mock_all_auths();

    client.register_audit(&auditor, &contract_a, &report_hash, &80);
    client.register_audit(&auditor, &contract_a, &report_hash, &60);
    client.register_audit(&auditor, &contract_b, &report_hash, &70);

    assert_eq!(client.get_contract_audit_count(&contract_a), 2);
    assert_eq!(client.get_contract_audit_count(&contract_b), 1);
    assert_eq!(client.get_audit_count(), 3);
}
