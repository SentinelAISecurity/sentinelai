#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, vec, Address, Bytes, BytesN, Env,
    IntoVal, TryIntoVal, Val, Vec,
};
use soroban_sdk::xdr::{ScVal, ToXdr};

/// Key for storing records in persistent/instance storage
#[contracttype]
enum StorageKey {
    TotalAudits,
    AuditRecord(BytesN<32>),
    ContractAudits(Address),
}

/// Represents a single audit record stored on-chain
#[contracttype]
#[derive(Clone)]
pub struct AuditRecord {
    pub contract_address: Address,
    pub report_hash: BytesN<32>,
    pub timestamp: u64,
    pub auditor: Address,
    pub security_score: u32,
}

/// SentinelAI Audit Registry — Stellar Soroban
///
/// On-chain registry on the Stellar network for storing and verifying
/// smart contract audit proofs. Stores audit metadata including the audited
/// contract address, IPFS report hash, auditor, timestamp, and security score.
#[contract]
pub struct AuditRegistry;

#[contractimpl]
impl AuditRegistry {
    /// Register a new audit record on-chain.
    ///
    /// # Authentication
    /// The auditor must be passed explicitly and must authorize.
    ///
    /// # Arguments
    /// * `auditor` - The Stellar address of the auditor (must authorize)
    /// * `contract_address` - The Stellar address of the audited contract
    /// * `report_hash` - 32-byte IPFS content hash of the audit report
    /// * `security_score` - Security score from 0 to 100
    ///
    /// # Returns
    /// A unique 32-byte audit identifier (SHA-256 hash)
    pub fn register_audit(
        env: Env,
        auditor: Address,
        contract_address: Address,
        report_hash: BytesN<32>,
        security_score: u32,
    ) -> BytesN<32> {
        // Validate score range
        assert!(security_score <= 100, "Score must be 0-100");

        // The auditor must authorize this call
        auditor.require_auth();

        let timestamp = env.ledger().timestamp();

        // Generate audit ID via SHA-256 of the ScVal-serialized tuple.
        // Individual SDK types don't implement ToXdr; we convert through ScVal.
        let tuple_scval: ScVal = (
            contract_address.clone(),
            report_hash.clone(),
            timestamp,
            auditor.clone(),
            security_score,
        )
            .into_val(&env)
            .try_into_val(&env)
            .unwrap();
        let xdr_bytes = tuple_scval.to_xdr().unwrap();
        let payload = Bytes::from_slice(&env, &xdr_bytes);
        let audit_id = env.crypto().sha256(&payload);

        // Build the audit record for storage
        let record = AuditRecord {
            contract_address: contract_address.clone(),
            report_hash: report_hash.clone(),
            timestamp,
            auditor: auditor.clone(),
            security_score,
        };

        // Ensure audit doesn't already exist
        let record_key = StorageKey::AuditRecord(audit_id.clone());
        assert!(!env.storage().persistent().has(&record_key), "Audit already exists");

        // Store the record
        env.storage().persistent().set(&record_key, &record);

        // Update contract-level audit list
        let contract_key = StorageKey::ContractAudits(contract_address.clone());
        let mut audits: Vec<BytesN<32>> = env
            .storage()
            .persistent()
            .get(&contract_key)
            .unwrap_or(vec![&env]);

        audits.push_back(audit_id.clone());
        env.storage().persistent().set(&contract_key, &audits);

        // Increment total audits counter
        let total_key = StorageKey::TotalAudits;
        let total: u32 = env.storage().instance().get(&total_key).unwrap_or(0);
        env.storage().instance().set(&total_key, &(total + 1));

        // Emit event
        env.events().publish(
            (
                symbol_short!("audit"),
                contract_address,
                auditor,
                record.security_score,
            ),
            audit_id.clone(),
        );

        audit_id
    }

    /// Verify that an audit record exists on-chain.
    ///
    /// Returns `false` if the audit does not exist (does NOT panic).
    pub fn verify_audit(env: Env, audit_id: BytesN<32>) -> bool {
        let record_key = StorageKey::AuditRecord(audit_id);
        env.storage().persistent().has(&record_key)
    }

    /// Retrieve an audit record by its ID.
    ///
    /// Panics if the audit does not exist.
    pub fn get_audit(env: Env, audit_id: BytesN<32>) -> AuditRecord {
        let record_key = StorageKey::AuditRecord(audit_id);
        env.storage()
            .persistent()
            .get(&record_key)
            .unwrap_or_else(|| panic!("Audit not found"))
    }

    /// Get all audit IDs for a specific contract address.
    pub fn get_audits_by_contract(env: Env, contract_address: Address) -> Vec<BytesN<32>> {
        let contract_key = StorageKey::ContractAudits(contract_address);
        env.storage()
            .persistent()
            .get(&contract_key)
            .unwrap_or(vec![&env])
    }

    /// Get the total count of registered audits.
    pub fn get_audit_count(env: Env) -> u32 {
        let total_key = StorageKey::TotalAudits;
        env.storage().instance().get(&total_key).unwrap_or(0)
    }

    /// Get the number of audits for a specific contract.
    pub fn get_contract_audit_count(env: Env, contract_address: Address) -> u32 {
        let contract_key = StorageKey::ContractAudits(contract_address);
        let audits: Vec<BytesN<32>> = env
            .storage()
            .persistent()
            .get(&contract_key)
            .unwrap_or(vec![&env]);
        audits.len()
    }
}

#[cfg(test)]
mod test;
