// src/utils/crypto.tsx
// --------------------------------------------------
// Handles encryption & decryption of wallet data.
// Uses AES-GCM + PBKDF2 (password-based key derivation).

const encoder = new TextEncoder();

// Safe accessors for WebCrypto in the browser
function getCrypto(): any {
  const c = (globalThis as any).crypto;
  if (!c) throw new Error('WebCrypto is not available in this environment');
  return c;
}
function getSubtle(): any {
  const c = getCrypto();
  if (!c.subtle) throw new Error('SubtleCrypto is not available');
  return c.subtle;
}

// Derive a crypto key from password using PBKDF2
export async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const subtle = getSubtle();
  const keyMaterial = await subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 250000, // professional-strength
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// Encrypt arbitrary data with password
export async function encryptWithPassword(password: string, data: ArrayBuffer | Uint8Array) {
  const cryptoObj = getCrypto();
  const iv = cryptoObj.getRandomValues(new Uint8Array(12));
  const salt = cryptoObj.getRandomValues(new Uint8Array(16));
  const key = await deriveKey(password, salt);

  const subtle = getSubtle();
  const input = data instanceof Uint8Array ? data.buffer : data;
  const ciphertext = new Uint8Array(
    await subtle.encrypt({ name: 'AES-GCM', iv }, key, input)
  );

  return { ciphertext, iv, salt };
}

// Decrypt data with password
export async function decryptWithPassword(
  password: string,
  ciphertext: Uint8Array,
  iv: Uint8Array,
  salt: Uint8Array
) {
  const key = await deriveKey(password, salt);
  const subtle = getSubtle();
  const plain = await subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
  return new Uint8Array(plain);
}

// Helpers: base64 encode/decode (browser)
export function toBase64(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

export function fromBase64(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
