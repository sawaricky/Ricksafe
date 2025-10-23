// src/components/wallet/ViewWallet.tsx
// --------------------------------------------------
// Stylish credit-card style wallet view with balance,
// public key, copy, export, and QR code.

import { useEffect, useState } from 'react';
import { useWalletContext } from '../../context/WalletContext';
import { Button, Alert } from 'react-bootstrap';

export default function ViewWallet() {
  const { wallet, fetchBalance, exportSecret } = useWalletContext();
  const [exported, setExported] = useState(false);

  useEffect(() => {
    fetchBalance().catch(() => {});
  }, [fetchBalance]);

  if (!wallet) return <Alert variant="warning">No wallet loaded.</Alert>;

  const address = wallet.keypair.publicKey.toBase58();
  const shortKey = address.slice(0, 6) + '...' + address.slice(-6);
  // Public key and QR moved to ReceiveSol page

  const handleExport = async () => {
    const secret = exportSecret();
    if (!secret) return;
    await navigator.clipboard.writeText(secret);
    setExported(true);
    setTimeout(() => setExported(false), 1500);
  };

  return (
    <div
      className="p-5 text-white rounded-4 shadow-lg"
      style={{
        background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
        maxWidth: 720,
        width: '95%',
        margin: '0 auto',
      }}
    >
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">💠 RickSafe Wallet</h4>
        <small>{shortKey}</small>
      </div>

      <div className="mb-5">
        <div className="text-uppercase small text-white-50">Balance</div>
        <div className="fs-2 fw-bold">◎ {wallet.balance.toFixed(3)} SOL</div>
      </div>

      <div className="mb-4">
        {/* Public key and QR code moved to ReceiveSol page to avoid duplication */}
        <div className="text-uppercase small text-white-50">Public Key</div>
        <div className="text-white-50 small">See Receive SOL to view address QR</div>
      </div>

      <div className="d-grid gap-3">
        <Button size="sm" variant="light" onClick={handleExport}>
          Export Secret Key
        </Button>
        {exported && (
          <Alert className="mt-2 py-1 mb-0" variant="warning">
            Secret key copied — keep it safe!
          </Alert>
        )}
      </div>
    </div>
  );
}
