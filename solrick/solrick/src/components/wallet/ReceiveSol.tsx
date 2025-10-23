// src/components/wallet/ReceiveSol.tsx
// Centered Receive SOL UI: public key, copy button, and QR code.

import { useState } from 'react';
import { useWalletContext } from '../../context/WalletContext';
import { Button, Alert } from 'react-bootstrap';
import { QRCodeCanvas } from 'qrcode.react';

export default function ReceiveSol() {
  const { wallet } = useWalletContext();
  const [copied, setCopied] = useState(false);

  if (!wallet) return <Alert variant="warning">No wallet loaded.</Alert>;

  const address = wallet.keypair.publicKey.toBase58();
  const shortKey = address.slice(0, 6) + '...' + address.slice(-6);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: 'calc(100vh - 56px)' }}
    >
      <div
        className="p-4 rounded-4 bg-white"
        style={{
          maxWidth: 560,
          width: '95%',
          boxShadow: '0 12px 30px rgba(59,130,246,0.14)'
        }}
      >
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0">Receive SOL</h4>
          <small className="text-muted">{shortKey}</small>
        </div>

        <div className="mb-4">
          <div className="text-uppercase small text-muted">Public Key</div>
          <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-2">
            <code className="text-truncate" style={{ wordBreak: 'break-all' }}>
              {address}
            </code>
            <Button size="sm" variant="primary" onClick={handleCopy}>
              Copy
            </Button>
          </div>
          {copied && (
            <Alert className="mt-2 py-1 mb-0" variant="success">
              Address copied
            </Alert>
          )}
        </div>

        <div className="d-flex justify-content-center bg-light p-3 rounded mb-2">
          <QRCodeCanvas value={address} size={200} includeMargin />
        </div>

        <div className="text-center text-muted small mt-2">
          Share this QR code or address to receive SOL.
        </div>
      </div>
    </div>
  );
}
