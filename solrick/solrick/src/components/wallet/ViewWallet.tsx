import { useEffect, useState } from 'react';
import { useWalletContext } from '../../context/WalletContext';
import { Card, Button, Alert, Form } from 'react-bootstrap';
import { QRCodeCanvas } from 'qrcode.react';

export default function ViewWallet() {
  const { wallet, fetchBalance } = useWalletContext();
  const [copied, setCopied] = useState(false);
  const [amount, setAmount] = useState(''); // optional: encode amount in QR

  useEffect(() => {
    fetchBalance().catch(() => {});
  }, [fetchBalance]);

  if (!wallet) return <Alert variant="warning">No wallet loaded.</Alert>;

  const address = wallet.keypair.publicKey.toBase58();
  const payload = amount ? `solana:${address}?amount=${amount}` : address;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <Card className="p-3">
      <h3>Receive SOL</h3>

      <div className="mt-2">
        <div className="text-muted">Your Address</div>
        <code className="d-block mt-1" style={{ wordBreak: 'break-all' }}>
          {address}
        </code>
        <div className="d-flex gap-2 mt-2">
          <Button variant="light" onClick={handleCopy}>Copy</Button>
        </div>
        {copied && <Alert className="mt-2 py-1 mb-0" variant="success">Copied</Alert>}
      </div>

      <div className="mt-3">
        <Form.Label>Optional amount (SOL) to encode in QR</Form.Label>
        <Form.Control
          type="number"
          step="0.000000001"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="e.g. 0.1"
        />
      </div>

      <div className="mt-3">
        <QRCodeCanvas value={payload} size={240} includeMargin />
      </div>

      <Alert className="mt-3" variant="info">
        Share this address or the QR with the sender. Ensure they send on <strong>mainnet</strong>.
      </Alert>
    </Card>
  );
}
