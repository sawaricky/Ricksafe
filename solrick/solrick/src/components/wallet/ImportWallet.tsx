import { useState } from 'react';
import { useWalletContext } from '../../context/WalletContext';
import { Card, Button, Alert, Form } from 'react-bootstrap';

export default function ImportWallet() {
  const { importFromSecret, fetchBalance } = useWalletContext();
  const [secret, setSecret] = useState('');
  const [status, setStatus] = useState('');
  const [err, setErr] = useState('');

  const handleImport = async () => {
    setStatus(''); setErr('');
    try {
      await importFromSecret(secret);
      await fetchBalance();
      setStatus('Imported successfully');
      setTimeout(() => setStatus(''), 1400);
    } catch (e: any) {
      setErr(e?.message || 'Invalid secret');
    }
  };

  return (
    <Card className="p-3">
      <h3>Import Wallet</h3>
      <p className="text-muted mt-1">Paste your <strong>base64</strong> secret key.</p>
      <Form.Group className="mt-2">
        <Form.Label>Secret Key (base64)</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          placeholder="Paste your base64 secret"
        />
      </Form.Group>
      <Button className="mt-3" variant="light" onClick={handleImport}>Import</Button>

      {err && <Alert className="mt-3" variant="danger">{err}</Alert>}
      {status && <Alert className="mt-3">{status}</Alert>}
    </Card>
  );
}
