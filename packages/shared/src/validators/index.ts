export function isValidStellarAddress(address: string): boolean {
  // Stellar public keys start with G and are 56 characters of base32
  return /^G[A-Z2-7]{55}$/.test(address);
}

export function isValidStellarContractId(id: string): boolean {
  // Soroban contract IDs start with C and are 56 characters of base32
  return /^C[A-Z2-7]{55}$/.test(id);
}

export function isValidStellarTxHash(hash: string): boolean {
  // Stellar transaction hashes are 64 hex characters
  return /^[a-f0-9]{64}$/.test(hash);
}

export function isValidEthereumAddress(address: string): boolean {
  // Kept for backward compatibility during migration
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/** @deprecated Use isValidStellarTxHash instead */
export const isValidTxHash = isValidStellarTxHash;

export function isValidSoliditySource(source: string): boolean {
  if (!source || source.trim().length === 0) return false;

  const solidityKeywords = ["pragma solidity", "contract ", "interface ", "library "];
  return solidityKeywords.some((kw) => source.includes(kw));
}

export function isValidIPFSHash(hash: string): boolean {
  return /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/.test(hash) || /^b[a-z2-7]{58}$/.test(hash);
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
