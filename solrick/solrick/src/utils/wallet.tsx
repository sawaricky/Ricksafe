// src/utils/wallet.tsx
// --------------------------------------------------
// Type definitions for wallets, encryption, and seed phrases.

import { Keypair } from '@solana/web3.js';

export type WalletInfo = {
  keypair: Keypair;
  balance: number;
};

export type EncryptedWallet = {
  ciphertext: string; // base64
  iv: string;         // base64
  salt: string;       // base64
};

export type SeedPhrase = {
  words: string[];
};
