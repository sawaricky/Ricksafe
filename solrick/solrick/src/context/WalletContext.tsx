import {
  createContext, useContext, useEffect, useMemo, useState, type ReactNode,
} from 'react';
import {
  Keypair, Connection, LAMPORTS_PER_SOL, PublicKey, Transaction, SystemProgram, sendAndConfirmTransaction,
} from '@solana/web3.js';
import { useAuth } from './AuthContext';

type WalletInfo = { keypair: Keypair; balance: number; };

type WalletContextType = {
  wallet: WalletInfo | null;
  createWallet: () => Promise<void>;
  importFromSecret: (secretBase64: string) => Promise<void>;
  exportSecret: () => string | null;
  fetchBalance: () => Promise<void>;
  sendSol: (to: string, amountSol: number) => Promise<string>;
  clearWallet: () => void;
};

const RPC_URL = import.meta.env.VITE_SOLANA_RPC || 'https://api.mainnet-beta.solana.com';
const WS_URL  = import.meta.env.VITE_SOLANA_WS  || RPC_URL.replace('https://', 'wss://');

console.log("env RPC:", import.meta.env.VITE_SOLANA_RPC);
console.log("env WS :", import.meta.env.VITE_SOLANA_WS);

const connection = new Connection(RPC_URL, {
  commitment: 'confirmed',
  wsEndpoint: WS_URL,
});


function bytesToBase64(bytes: Uint8Array): string {
  let bin = ''; for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]); return btoa(bin);
}
function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64); const out = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i); return out;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<WalletInfo | null>(null);

  // derive storage key from *current* user each render
  const storageKey = useMemo(
    () => (user ? `solrick.wallet.${user.id}.secret.base64` : null),
    [user?.id]
  );

  // reset and load when user changes
  useEffect(() => {
    setWallet(null);
    if (!storageKey) return;
    try {
      const b64 = localStorage.getItem(storageKey);
      if (!b64) return;
      const kp = Keypair.fromSecretKey(base64ToBytes(b64));
      setWallet({ keypair: kp, balance: 0 });
    } catch {}
  }, [storageKey]);

  // live balance updates
  useEffect(() => {
    if (!wallet) return;
    const sub = connection.onAccountChange(wallet.keypair.publicKey, () => { fetchBalance().catch(() => {}); }, 'confirmed');
    return () => { connection.removeAccountChangeListener(sub); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet?.keypair.publicKey.toBase58()]);

  const mustBeSignedIn = () => {
    if (!user || !storageKey) throw new Error('Sign in required');
  };

  const createWallet = async () => {
    mustBeSignedIn();
    const kp = Keypair.generate();
    setWallet({ keypair: kp, balance: 0 });
    localStorage.setItem(storageKey!, bytesToBase64(kp.secretKey));
    await fetchBalance();
  };

  const importFromSecret = async (secretBase64: string) => {
    mustBeSignedIn();
    const kp = Keypair.fromSecretKey(base64ToBytes(secretBase64.trim()));
    setWallet({ keypair: kp, balance: 0 });
    localStorage.setItem(storageKey!, secretBase64.trim());
    await fetchBalance();
  };

  const exportSecret = () => (wallet ? bytesToBase64(wallet.keypair.secretKey) : null);

  const fetchBalance = async () => {
    if (!wallet) return;
    const lamports = await connection.getBalance(wallet.keypair.publicKey);
    setWallet(prev => (prev ? { ...prev, balance: lamports / LAMPORTS_PER_SOL } : prev));
  };

  const sendSol = async (to: string, amountSol: number) => {
    if (!wallet) throw new Error('No wallet loaded');
    const toPubkey = new PublicKey(to);
    const lamports = Math.floor(amountSol * LAMPORTS_PER_SOL);
    const tx = new Transaction().add(SystemProgram.transfer({
      fromPubkey: wallet.keypair.publicKey, toPubkey, lamports,
    }));
    const sig = await sendAndConfirmTransaction(connection, tx, [wallet.keypair]);
    await fetchBalance();
    console.log("Transaction signature:", sig);
    return sig;
  };

  const clearWallet = () => {
    if (storageKey) localStorage.removeItem(storageKey);
    setWallet(null);
  };

  const value = useMemo(() => ({
    wallet, createWallet, importFromSecret, exportSecret, fetchBalance, sendSol, clearWallet,
  }), [wallet, storageKey, user?.id]);

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWalletContext() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWalletContext must be used within WalletProvider');
  return ctx;
}
