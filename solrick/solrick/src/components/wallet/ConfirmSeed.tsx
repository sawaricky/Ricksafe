// src/components/wallet/ConfirmSeed.tsx
// --------------------------------------------------
// Confirm the seed phrase order, then encrypt & save the wallet locally.

import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, Button, Alert } from 'react-bootstrap';
import { encryptWithPassword, toBase64 } from '../../utils/crypto';
import { deriveSolanaKeypairFromMnemonic } from '../../utils/derivation';
import { saveWallet } from '../../utils/storage';
import { useWalletContext } from '../../context/WalletContext';

export default function ConfirmSeed() {
  const navigate = useNavigate();
  const { setWalletFromKeypair, fetchBalance } = useWalletContext();

  // The previous step should pass the mnemonic via router state:
  // navigate('/wallet/confirm', { state: { mnemonic, password } })
  const loc = useLocation();
  const mnemonic: string = (loc.state as any)?.mnemonic || '';
  const presetPassword: string | undefined = (loc.state as any)?.password;

  const [selected, setSelected] = useState<string[]>([]);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  // Basic guard
  if (!mnemonic) {
    return (
      <div className="d-flex justify-content-center align-items-start py-5">
        <Alert variant="danger" className="w-100" style={{ maxWidth: 640 }}>
          No seed phrase found. Go back and create a new wallet.
        </Alert>
      </div>
    );
  }

  // Split words and present them in a shuffled order to click
  const words = useMemo(() => mnemonic.trim().split(/\s+/), [mnemonic]);
  const choices = useMemo(() => {
    const arr = [...words];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [words]);

  const handlePick = (w: string) => {
    if (!selected.includes(w)) setSelected((s) => [...s, w]);
  };

  const handleUndo = () => {
    setSelected((s) => s.slice(0, -1));
  };

  const handleConfirm = async () => {
    try {
      setErr('');
      if (selected.join(' ') !== mnemonic) {
        throw new Error('Incorrect word order. Please try again.');
      }

      // Derive keypair from the confirmed mnemonic
      const kp = await deriveSolanaKeypairFromMnemonic(mnemonic);

      // Ask for password if not supplied from previous step
      let password = presetPassword;
      if (!password) {
        password = prompt('Set a password to encrypt your wallet (min 8 chars):') || '';
      }
      if (!password || password.length < 8) {
        throw new Error('Password must be at least 8 characters.');
      }

      setLoading(true);

      // Encrypt secret & save to local vault (Phantom-style)
      const enc = await encryptWithPassword(password, kp.secretKey);
      await saveWallet('solrick_vault', {
        ciphertext: toBase64(enc.ciphertext),
        iv: toBase64(enc.iv),
        salt: toBase64(enc.salt),
        publicKey: kp.publicKey.toBase58(),
      });

      // Update context and navigate
      setWalletFromKeypair(kp);
      await fetchBalance();
      setShowSaved(true);
      navigate('/account/view');
    } catch (e: any) {
      setErr(e?.message || 'Failed to save wallet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-start py-5">
      <Card className="p-4 shadow w-100" style={{ maxWidth: 760 }}>
        <h4 className="mb-2">Confirm Seed Phrase</h4>
        <p className="text-muted mb-3">
          Click the words in the correct order to confirm your backup.
        </p>

        {/* clickable choices */}
        <div className="d-flex flex-wrap gap-2 mb-3">
          {choices.map((w, idx) => (
            <Button
              key={`${w}-${idx}`}
              size="sm"
              variant={selected.includes(w) ? 'secondary' : 'outline-secondary'}
              onClick={() => handlePick(w)}
              disabled={selected.includes(w)}
            >
              {w}
            </Button>
          ))}
        </div>

        {/* current selection */}
        <div className="mb-3 border rounded p-2 bg-light small">
          {selected.join(' ')}
        </div>

        <div className="d-flex gap-2">
          <Button variant="outline-secondary" onClick={handleUndo} disabled={!selected.length}>
            Undo
          </Button>
          <Button className="flex-grow-1" onClick={handleConfirm} disabled={loading || selected.length !== words.length}>
            {loading ? 'Saving…' : 'Confirm & Save Wallet'}
          </Button>
        </div>

        {err && (
          <Alert variant="danger" className="mt-3">
            {err}
          </Alert>
        )}
        {showSaved && (
          <Alert variant="success" className="mt-3">
            Wallet saved locally and loaded!
          </Alert>
        )}
      </Card>
    </div>
  );
}
