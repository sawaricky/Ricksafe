// src/utils/storage.tsx
// --------------------------------------------------
// Handles saving/loading users + wallets in IndexedDB (via localForage).

import localforage from 'localforage';

// Configure store
const store = localforage.createInstance({
  name: 'solrick-store',
  storeName: 'data',
});

// ---------------- Types ----------------

export type StoredWallet = {
  ciphertext: string;
  iv: string;
  salt: string;
  publicKey: string;
};

export type StoredUser = {
  username: string;
  password: string; // plaintext for now (later: hash)
};

const USER_STORE = 'solrick-users';

// ---------------- Users (for future multi-user mode) ----------------

export async function saveUser(user: StoredUser) {
  const users = (await store.getItem<Record<string, StoredUser>>(USER_STORE)) || {};
  const key = user.username.trim().toLowerCase();
  users[key] = user;
  await store.setItem(USER_STORE, users);
  console.log(`💾 User saved: ${user.username}`);
}

export async function loadUser(username: string): Promise<StoredUser | null> {
  const users = (await store.getItem<Record<string, StoredUser>>(USER_STORE)) || {};
  return users[username.trim().toLowerCase()] || null;
}

// ---------------- Wallets (username-based) ----------------
// These remain available for potential future "account-based" version.

export async function saveWallet(username: string, wallet: StoredWallet): Promise<void> {
  await store.setItem(username.trim().toLowerCase(), wallet);
  console.log(`💾 Wallet saved for username: ${username}`, wallet);
}

export async function loadWallet(username: string): Promise<StoredWallet | null> {
  const wallet = await store.getItem<StoredWallet>(username.trim().toLowerCase());
  console.log(`📥 Loaded wallet for username: ${username}`, wallet);
  return wallet || null;
}

export async function deleteWallet(username: string): Promise<void> {
  await store.removeItem(username.trim().toLowerCase());
  console.log(`🗑️ Wallet deleted for username: ${username}`);
}

export async function listAllWallets(): Promise<void> {
  console.log('🔎 Listing all wallets in IndexedDB:');
  await store.iterate((value, key) => {
    console.log(`➡️ ${key}:`, value);
  });
}

// ---------------- Single Vault (Phantom-style mode) ----------------
// Used when no username is required (local vault only)

export async function saveLocalVault(vault: StoredWallet): Promise<void> {
  await store.setItem('solrick_vault', vault);
  console.log('💾 Local vault saved (Phantom-style)', vault);
}

export async function loadLocalVault(): Promise<StoredWallet | null> {
  const vault = await store.getItem<StoredWallet>('solrick_vault');
  console.log('📥 Loaded local vault', vault);
  return vault || null;
}

export async function deleteLocalVault(): Promise<void> {
  await store.removeItem('solrick_vault');
  console.log('🗑️ Local vault deleted');
}

export async function vaultExists(): Promise<boolean> {
  const vault = await store.getItem('solrick_vault');
  return !!vault;
}
