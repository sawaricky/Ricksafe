// src/context/WalletContext.tsx
// --------------------------
// Handles wallet state (balances, transactions, exports).
// Does NOT auto-load/decrypt from storage — that happens in SignIn.tsx.

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  Keypair,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
} from '@solana/web3.js';

// Basic wallet type
type WalletInfo = { keypair: Keypair; balance: number };

type WalletContextType = {
  wallet: WalletInfo | null;
  exportSecret: () => string | null;
  fetchBalance: () => Promise<void>;
  sendSol: (to: string, amountSol: number) => Promise<string>;
  clearWallet: () => void;
  setWalletFromKeypair: (kp: Keypair) => void;
};

const RPC_URL =
  import.meta.env.VITE_SOLANA_RPC || 'https://api.mainnet-beta.solana.com';
const WS_URL =
  import.meta.env.VITE_SOLANA_WS || RPC_URL.replace('https://', 'wss://');

const connection = new Connection(RPC_URL, {
  commitment: 'confirmed',
  wsEndpoint: WS_URL,
});

// Base64 helpers
function bytesToBase64(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<WalletInfo | null>(null);

  // Keep balance up-to-date
  useEffect(() => {
    if (!wallet) return;
    const sub = connection.onAccountChange(
      wallet.keypair.publicKey,
      () => {
        fetchBalance().catch(() => {});
      },
      'confirmed',
    );
    return () => {
      connection.removeAccountChangeListener(sub);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet?.keypair.publicKey.toBase58()]);

  const exportSecret = () =>
    wallet ? bytesToBase64(wallet.keypair.secretKey) : null;

  const fetchBalance = async () => {
    if (!wallet) return;
    const lamports = await connection.getBalance(wallet.keypair.publicKey);
    setWallet((prev) =>
      prev ? { ...prev, balance: lamports / LAMPORTS_PER_SOL } : prev,
    );
  };

  const sendSol = async (to: string, amountSol: number) => {
    if (!wallet) throw new Error('No wallet loaded');
    const toPubkey = new PublicKey(to);
    const lamports = Math.floor(amountSol * LAMPORTS_PER_SOL);
    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: wallet.keypair.publicKey,
        toPubkey,
        lamports,
      }),
    );
    const sig = await sendAndConfirmTransaction(connection, tx, [
      wallet.keypair,
    ]);
    await fetchBalance();
    console.log('Transaction signature:', sig);
    return sig;
  };

  const clearWallet = () => {
    setWallet(null);
  };

  const setWalletFromKeypair = (kp: Keypair) => {
    setWallet({ keypair: kp, balance: 0 });
    fetchBalance().catch(() => {});
  };

  const value = useMemo(
    () => ({
      wallet,
      exportSecret,
      fetchBalance,
      sendSol,
      clearWallet,
      setWalletFromKeypair,
    }),
    [wallet],
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

export function useWalletContext() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWalletContext must be used within WalletProvider');
  return ctx;
}
