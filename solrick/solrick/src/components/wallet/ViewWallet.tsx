// src/components/wallet/ViewWallet.tsx
// --------------------------------------------------
// Stylish credit-card style wallet view with balance,
// public key, copy, export, and QR code.

import { useEffect, useState } from 'react';
import { useWalletContext } from '../../context/WalletContext';
import { Button, Alert } from 'react-bootstrap';
import { QRCodeCanvas } from 'qrcode.react';

export default function ViewWallet() {
  const { wallet, fetchBalance, exportSecret } = useWalletContext();
  const [copied, setCopied] = useState(false);
  const [exported, setExported] = useState(false);
  const [amount] = useState('');

  useEffect(() => {
    fetchBalance().catch(() => {});
  }, [fetchBalance]);

  if (!wallet) return <Alert variant="warning">No wallet loaded.</Alert>;

  const address = wallet.keypair.publicKey.toBase58();
  const shortKey = address.slice(0, 6) + '...' + address.slice(-6);
  const payload = amount ? `solana:${address}?amount=${amount}` : address;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleExport = async () => {
    const secret = exportSecret();
    if (!secret) return;
    await navigator.clipboard.writeText(secret);
    setExported(true);
    setTimeout(() => setExported(false), 1500);
  };

  return (
    <div
      className="p-4 text-white rounded-4 shadow-lg"
      style={{
        background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
        maxWidth: 420,
        margin: '0 auto',
      }}
    >
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">💠 RickSafe Wallet</h4>
        <small>{shortKey}</small>
      </div>

      <div className="mb-4">
        <div className="text-uppercase small text-white-50">Balance</div>
        <div className="fs-3 fw-bold">◎ {wallet.balance.toFixed(3)} SOL</div>
      </div>

      <div className="mb-3">
        <div className="text-uppercase small text-white-50">Public Key</div>
        <div className="d-flex align-items-center gap-2">
          <code className="text-truncate">{address}</code>
          <Button size="sm" variant="light" onClick={handleCopy}>
            Copy
          </Button>
        </div>
        {copied && (
          <Alert className="mt-2 py-1 mb-0" variant="success">
            Address copied
          </Alert>
        )}
      </div>

      <div className="bg-white p-3 rounded d-flex justify-content-center mb-3">
        <QRCodeCanvas value={payload} size={160} includeMargin />
      </div>

      <div className="d-grid gap-2">
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
