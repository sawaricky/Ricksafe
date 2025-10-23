// src/components/wallet/ExportWallet.tsx
// --------------------------------------------------
// Lets user export their private key (secret key) in base64.

import { useState } from 'react';
import { useWalletContext } from '../../context/WalletContext';
import { Card, Button, Alert } from 'react-bootstrap';
import { KeyFill } from 'react-bootstrap-icons';

export default function ExportWallet() {
  const { wallet, exportSecret } = useWalletContext();
  const [copied, setCopied] = useState(false);

  if (!wallet) {
    return (
      <Alert variant="warning" className="m-3">
        No wallet loaded. Please sign in and create or import a wallet first.
      </Alert>
    );
  }

  const secret = exportSecret();

  const handleCopy = async () => {
    if (secret) {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <Card
        className="p-4 shadow-lg"
        style={{ maxWidth: 600, width: '100%' }}
      >
        {/* Header */}
        <div className="d-flex align-items-center gap-2 mb-3">
          <KeyFill size={26} className="text-danger" />
          <h3 className="mb-0">Export Private Key</h3>
        </div>

        {/* Warning */}
        <Alert variant="danger" className="fw-semibold">
          ⚠️ Anyone with this key has full control of your wallet.
          <br />
          Keep it secret. Do not share it.
        </Alert>

        {/* Secret Key Box */}
        <div
          className="p-3 bg-dark text-white rounded mt-3"
          style={{
            wordBreak: 'break-all',
            fontFamily: 'monospace',
            fontSize: '0.9rem',
          }}
        >
          {secret}
        </div>

        {/* Buttons */}
        <div className="d-flex gap-3 mt-4">
          <Button
            variant="outline-danger"
            onClick={handleCopy}
            style={{ borderRadius: 8 }}
          >
            Copy Secret Key
          </Button>
        </div>

        {copied && (
          <Alert className="mt-3 py-2 mb-0" variant="success">
            ✅ Secret key copied to clipboard
          </Alert>
        )}
      </Card>
    </div>
  );
}
