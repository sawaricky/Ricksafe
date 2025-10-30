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
    <div className="container py-4" style={{ minHeight: 'calc(100vh - 56px)' }}>
      <div className="row justify-content-center">
        <div className="col-12 col-md-10 col-lg-8">
          <div className="p-3 p-md-4 rounded-4 bg-white shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="mb-0">Receive SOL</h4>
              <small className="text-muted d-none d-sm-inline">{shortKey}</small>
            </div>

            <div className="row g-3 align-items-center">
              <div className="col-12 col-lg-7">
                <div className="mb-2 text-uppercase small text-muted">Public Key</div>
                <div className="d-flex flex-column gap-2">
                  <code className="text-break" style={{ fontSize: 13 }}>
                    {address}
                  </code>
                  <div className="d-flex gap-2">
                    <Button size="sm" variant="outline-primary" onClick={handleCopy}>
                      Copy
                    </Button>
                    {copied && (
                      <Alert className="mb-0 py-1 px-2" variant="success">
                        Address copied
                      </Alert>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-12 col-lg-5 d-flex justify-content-center">
                <div
                  style={{
                    width: 'min(240px, 45vw)',
                    maxWidth: 260,
                    background: '#f8fafc',
                    padding: 12,
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <QRCodeCanvas value={address} size={Math.min(240, Math.round(window.innerWidth * 0.45))} includeMargin />
                </div>
              </div>
            </div>

            <div className="text-center text-muted small mt-3">
              Share this QR code or address to receive SOL.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
