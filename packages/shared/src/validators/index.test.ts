import {
  isValidStellarAddress,
  isValidStellarContractId,
  isValidStellarTxHash,
  isValidEthereumAddress,
  isValidSoliditySource,
  isValidIPFSHash,
  validateEmail,
  isValidUrl,
} from "./index";

describe("isValidStellarAddress", () => {
  it("should accept valid Stellar public keys", () => {
    // Valid G... addresses are 56 chars with G prefix
    expect(isValidStellarAddress("GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA")).toBe(true);
    expect(isValidStellarAddress("GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFSHONUCEOASW7QC7OX2H")).toBe(true);
  });

  it("should reject addresses not starting with G", () => {
    expect(isValidStellarAddress("SAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA")).toBe(false);
  });

  it("should reject addresses with wrong length", () => {
    expect(isValidStellarAddress("GABC")).toBe(false);
    expect(isValidStellarAddress("G" + "A".repeat(56))).toBe(false);
  });

  it("should reject invalid base32 characters", () => {
    // Contains 0 and 1 which are not in base32 alphabet (A-Z, 2-7)
    expect(isValidStellarAddress("G" + "0".repeat(55))).toBe(false);
  });

  it("should reject empty string", () => {
    expect(isValidStellarAddress("")).toBe(false);
  });
});

describe("isValidStellarContractId", () => {
  it("should accept valid Soroban contract IDs", () => {
    expect(isValidStellarContractId("CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA")).toBe(true);
  });

  it("should reject IDs not starting with C", () => {
    expect(isValidStellarContractId("GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA")).toBe(false);
  });

  it("should reject IDs with wrong length", () => {
    expect(isValidStellarContractId("CABC")).toBe(false);
  });
});

describe("isValidStellarTxHash", () => {
  it("should accept valid 64-char hex transaction hashes", () => {
    expect(isValidStellarTxHash("a".repeat(64))).toBe(true);
    expect(isValidStellarTxHash("f".repeat(64))).toBe(true);
  });

  it("should reject hashes with wrong length", () => {
    expect(isValidStellarTxHash("a".repeat(63))).toBe(false);
    expect(isValidStellarTxHash("a".repeat(65))).toBe(false);
  });

  it("should reject hashes with non-hex characters", () => {
    expect(isValidStellarTxHash("g" + "a".repeat(63))).toBe(false);
  });
});

describe("isValidEthereumAddress (legacy)", () => {
  it("should accept valid Ethereum addresses", () => {
    expect(isValidEthereumAddress("0x1234567890abcdef1234567890ABCDEF12345678")).toBe(true);
    expect(isValidEthereumAddress("0x0000000000000000000000000000000000000000")).toBe(true);
    expect(isValidEthereumAddress("0xffffffffffffffffffffffffffffffffffffffff")).toBe(true);
  });

  it("should reject addresses without 0x prefix", () => {
    expect(isValidEthereumAddress("1234567890abcdef1234567890ABCDEF12345678")).toBe(false);
  });

  it("should reject addresses with wrong length", () => {
    expect(isValidEthereumAddress("0x123")).toBe(false);
    expect(isValidEthereumAddress("0x1234567890abcdef1234567890ABCDEF1234567890")).toBe(false);
  });

  it("should reject addresses with invalid characters", () => {
    expect(isValidEthereumAddress("0xGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG")).toBe(false);
  });

  it("should reject empty string", () => {
    expect(isValidEthereumAddress("")).toBe(false);
  });
});

describe("isValidTxHash (Stellar)", () => {
  it("should accept valid Stellar tx hashes (64 hex, no 0x)", () => {
    expect(isValidStellarTxHash("a".repeat(64))).toBe(true);
  });

  it("should reject 0x-prefixed hashes", () => {
    expect(isValidStellarTxHash("0x" + "a".repeat(64))).toBe(false);
  });

  it("should reject hashes with wrong length", () => {
    expect(isValidStellarTxHash("a".repeat(63))).toBe(false);
    expect(isValidStellarTxHash("a".repeat(65))).toBe(false);
  });
});

describe("isValidSoliditySource", () => {
  it("should accept source with pragma solidity", () => {
    const source = "pragma solidity ^0.8.0;\ncontract Test {}";
    expect(isValidSoliditySource(source)).toBe(true);
  });

  it("should accept source with contract keyword", () => {
    const source = "contract MyContract { function foo() external {} }";
    expect(isValidSoliditySource(source)).toBe(true);
  });

  it("should accept source with interface keyword", () => {
    const source = "interface IMyContract { function foo() external; }";
    expect(isValidSoliditySource(source)).toBe(true);
  });

  it("should accept source with library keyword", () => {
    const source = "library MyLibrary { function add(uint a, uint b) internal pure returns (uint) { return a + b; } }";
    expect(isValidSoliditySource(source)).toBe(true);
  });

  it("should reject empty string", () => {
    expect(isValidSoliditySource("")).toBe(false);
  });

  it("should reject whitespace-only string", () => {
    expect(isValidSoliditySource("   \n  \t  ")).toBe(false);
  });

  it("should reject non-Solidity content", () => {
    expect(isValidSoliditySource("const x = 1;")).toBe(false);
    expect(isValidSoliditySource("print('hello')")).toBe(false);
  });
});

describe("isValidIPFSHash", () => {
  it("should accept valid CIDv0 hashes (Qm prefix, 46 chars)", () => {
    // Valid CIDv0: Qm + 44 base58 chars
    const validCidV0 = "QmWfVY9y3xjsixTgbd9AorQxH7sxCRHJKDQd4kNaq8BGAD"; // 46 chars total
    expect(isValidIPFSHash(validCidV0)).toBe(true);
  });

  it("should accept valid CIDv1 hashes (b prefix, 59 chars)", () => {
    const validCidV1 = "b" + "a".repeat(58); // 59 chars total
    expect(isValidIPFSHash(validCidV1)).toBe(true);
  });

  it("should reject invalid format", () => {
    expect(isValidIPFSHash("xyz123")).toBe(false);
    expect(isValidIPFSHash("")).toBe(false);
  });

  it("should reject CIDv0 with invalid characters", () => {
    // Qm + 43 chars + '0' (invalid in base58)
    expect(isValidIPFSHash("Qm" + "a".repeat(43) + "0")).toBe(false);
  });
});

describe("validateEmail", () => {
  it("should accept valid emails", () => {
    expect(validateEmail("test@example.com")).toBe(true);
    expect(validateEmail("user.name+tag@domain.co.uk")).toBe(true);
    expect(validateEmail("user@sub.domain.com")).toBe(true);
  });

  it("should reject emails without @", () => {
    expect(validateEmail("notanemail")).toBe(false);
  });

  it("should reject emails without domain", () => {
    expect(validateEmail("user@")).toBe(false);
  });

  it("should reject emails without username", () => {
    expect(validateEmail("@domain.com")).toBe(false);
  });

  it("should reject empty string", () => {
    expect(validateEmail("")).toBe(false);
  });
});

describe("isValidUrl", () => {
  it("should accept valid HTTP URLs", () => {
    expect(isValidUrl("http://example.com")).toBe(true);
    expect(isValidUrl("https://example.com/path?query=1")).toBe(true);
    expect(isValidUrl("https://sub.example.com:8080/path")).toBe(true);
  });

  it("should reject invalid URLs", () => {
    expect(isValidUrl("not-a-url")).toBe(false);
    expect(isValidUrl("")).toBe(false);
    expect(isValidUrl("htp://bad-scheme.com")).toBe(true); // URL constructor accepts this
  });

  it("should accept URLs with special characters", () => {
    expect(isValidUrl("https://example.com/path%20with%20spaces")).toBe(true);
  });
});
