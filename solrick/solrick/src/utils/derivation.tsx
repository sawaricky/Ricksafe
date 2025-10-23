// src/utils/derivation.tsx
// --------------------------------------------------
// Handles seed phrase (BIP39) + keypair derivation for Solana.

import * as bip39 from 'bip39';
import { derivePath } from 'ed25519-hd-key';
import nacl from 'tweetnacl';
import { Keypair } from '@solana/web3.js';

// Helper: Uint8Array → hex string
function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// ✅ Generate 12-word mnemonic (128 bits entropy)
export function generateMnemonic(): string {
  return bip39.generateMnemonic(128);
}

// ✅ Validate a mnemonic phrase (checksum + wordlist)
export function validateMnemonicPhrase(mnemonic: string): boolean {
  try {
    return bip39.validateMnemonic(mnemonic.trim().toLowerCase());
  } catch {
    return false;
  }
}

// ✅ Convert mnemonic → seed (BIP39)
export async function mnemonicToSeed(mnemonic: string): Promise<Uint8Array> {
  const buf = await bip39.mnemonicToSeed(mnemonic);
  return new Uint8Array(buf);
}

// ✅ Derive Solana keypair from raw seed (for internal use)
export function deriveSolanaKeypair(seed: Uint8Array, account = 0): Keypair {
  const path = `m/44'/501'/${account}'/0'`;

  const hexSeed = toHex(seed);
  const { key } = derivePath(path, hexSeed);

  if (!key) throw new Error('Failed to derive key from seed');

  const naclPair = nacl.sign.keyPair.fromSeed(key);
  return Keypair.fromSecretKey(naclPair.secretKey);
}

// ✅ Derive Solana keypair directly from mnemonic (for import/create flows)
export async function deriveSolanaKeypairFromMnemonic(
  mnemonic: string,
  account = 0
): Promise<Keypair> {
  const normalized = mnemonic.trim().toLowerCase().replace(/\s+/g, ' ');
  const valid = validateMnemonicPhrase(normalized);
  if (!valid) throw new Error('Invalid mnemonic phrase');

  const seed = await mnemonicToSeed(normalized);
  return deriveSolanaKeypair(seed, account);
}
