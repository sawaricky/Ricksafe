import { useState } from 'react';
import { useWalletContext } from '../../context/WalletContext';
import { useAuth } from '../../context/AuthContext';
import { Card, Button, Alert } from 'react-bootstrap';

export default function CreateWallet() {
  const { user } = useAuth();
  const { wallet, createWallet, exportSecret, fetchBalance } = useWalletContext();
  const [status, setStatus] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [err, setErr] = useState('');

  const handleCreate = async () => {
    setStatus('');
    setErr('');
    try {
      await createWallet();
      await fetchBalance();
      setStatus('New wallet created');
      setTimeout(() => setStatus(''), 1200);
    } catch (e: any) {
      setErr(e?.message || 'Failed to create wallet');
    }
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setStatus('Copied');
    setTimeout(() => setStatus(''), 800);
  };

  const handleDownload = () => {
    if (!wallet) return;
    const secret = exportSecret();
    if (!secret) return;

    const username = user?.name ?? null;
    const payload = {
      name: 'solrick-keypair',
      app: 'Solrick Wallet',
      version: 1,
      network: 'mainnet-beta',
      username, // <- included for your reference
      publicKey: wallet.keypair.publicKey.toBase58(),
      secretKeyBase64: secret,
      createdAt: new Date().toISOString(),
      note: 'Keep this file private. Anyone with the secret can spend your funds.',
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const shortPk = wallet.keypair.publicKey.toBase58().slice(0, 6);
    const userPart = username ? `${username.replace(/\s+/g, '_')}-` : '';
    const a = document.createElement('a');
    a.href = url;
    a.download = `solrick-${userPart}${shortPk}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="p-3">
      <h3>Create Wallet</h3>
      <Button className="mt-2" variant="light" onClick={handleCreate}>Generate New Wallet</Button>

      {err && <Alert className="mt-3" variant="danger">{err}</Alert>}

      {wallet && (
        <>
          <div className="mt-3">
            <div className="text-muted">Public Address</div>
            <code style={{ wordBreak: 'break-all' }}>
              {wallet.keypair.publicKey.toBase58()}
            </code>
            <div className="d-flex gap-2 mt-2">
              <Button variant="light" onClick={() => handleCopy(wallet.keypair.publicKey.toBase58())}>Copy Address</Button>
              <Button variant="light" onClick={handleDownload}>Download Backup</Button>
            </div>
          </div>

          <div className="mt-4">
            <div className="text-muted">Secret Key (base64)</div>
            <div className="d-flex gap-2 mt-2">
              <Button variant="outline-secondary" onClick={() => setShowSecret(s => !s)}>
                {showSecret ? 'Hide' : 'Reveal'}
              </Button>
              <Button variant="light" onClick={() => { const s = exportSecret(); if (s) handleCopy(s); }}>
                Copy Secret
              </Button>
            </div>
            {showSecret && (
              <pre className="mt-2 p-2 bg-light" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                {exportSecret()}
              </pre>
            )}
            <Alert className="mt-2" variant="warning">
              Store this secret safely. Anyone with it can spend your funds.
            </Alert>
          </div>

          <div className="mt-4">
            <div className="text-muted">Balance</div>
            <div>{wallet.balance ?? 0} SOL</div>
            <Button className="mt-2" variant="light" onClick={() => fetchBalance()}>
              Refresh Balance
            </Button>
          </div>
        </>
      )}

      {status && <Alert className="mt-3 py-1 mb-0" variant="success">{status}</Alert>}
    </Card>
  );
}
