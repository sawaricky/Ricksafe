// --------------------------------------------------
// Import wallet using seed phrase OR private key
// --------------------------------------------------

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWalletContext } from '../../context/WalletContext';
import { Card, Button, Alert, Form, Row, Col, Nav } from 'react-bootstrap';
import { KeyFill, Eye, EyeSlash } from 'react-bootstrap-icons';
import { encryptWithPassword, toBase64 } from '../../utils/crypto';
import { saveWallet } from '../../utils/storage';
import {
  deriveSolanaKeypairFromMnemonic,
  validateMnemonicPhrase,
} from '../../utils/derivation';
import { Keypair } from '@solana/web3.js';

export default function ImportWallet() {
  const { setWalletFromKeypair, fetchBalance } = useWalletContext();
  const navigate = useNavigate();

  // State variables
  const [mode, setMode] = useState<'seed' | 'private'>('seed');
  const [words, setWords] = useState<string[]>(Array(12).fill(''));
  const [privateKey, setPrivateKey] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  // handle seed word updates
  const handleWordChange = (index: number, value: string) => {
    const next = [...words];
    next[index] = value.trim().toLowerCase();
    setWords(next);
  };

  // reset fields
  const resetFields = () => {
    setWords(Array(12).fill(''));
    setPrivateKey('');
    setPassword('');
    setConfirm('');
    setErr('');
  };

  // handle import click
  const handleImport = async () => {
    setErr('');
    setLoading(true);
    try {
      if (!password) throw new Error('Please set a password for this wallet.');
      if (password.length < 8)
        throw new Error('Password must be at least 8 characters.');
      if (password !== confirm) throw new Error('Passwords do not match.');

      let kp: Keypair;

      if (mode === 'seed') {
        // ✅ Import from Seed Phrase
        if (words.some((w) => !w)) throw new Error('Please fill all 12 words.');
        const mnemonic = words.join(' ').trim().toLowerCase();
        if (!validateMnemonicPhrase(mnemonic))
          throw new Error('Invalid seed phrase.');
        kp = await deriveSolanaKeypairFromMnemonic(mnemonic);
      } else {
        // 🔑 Import from Private Key (base64)
        if (!privateKey.trim()) throw new Error('Private key required.');
        let decoded: Uint8Array;
        try {
          const bin = atob(privateKey.trim());
          const secret = new Uint8Array(bin.length);
          for (let i = 0; i < bin.length; i++) secret[i] = bin.charCodeAt(i);
          decoded = secret;
        } catch {
          throw new Error('Invalid private key format. Must be base64.');
        }
        kp = Keypair.fromSecretKey(decoded);
      }

      // 🔒 Encrypt and store wallet locally
      const enc = await encryptWithPassword(password, kp.secretKey);
      await saveWallet('solrick_vault', {
        ciphertext: toBase64(enc.ciphertext),
        iv: toBase64(enc.iv),
        salt: toBase64(enc.salt),
        publicKey: kp.publicKey.toBase58(),
      });

      // Update context + fetch balance
      setWalletFromKeypair(kp);
      await fetchBalance();

      // Redirect to wallet view
      navigate('/account/view');
    } catch (e: any) {
      console.error('ImportWallet error:', e);
      setErr(e?.message || 'Failed to import wallet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-start py-5 bg-light"
      style={{ minHeight: '80vh', width: '100%' }}
    >
      <Card className="p-4 shadow-lg w-100" style={{ maxWidth: 760 }}>
        {/* Header */}
        <div className="d-flex align-items-center gap-2 mb-3">
          <KeyFill size={26} className="text-primary" />
          <h3 className="mb-0">Import Wallet</h3>
        </div>

        {/* Warning */}
        <Alert variant="warning" className="fw-semibold">
          Never share your recovery phrase or private key. Anyone with it can
          access your funds.
        </Alert>

        {/* Mode Tabs */}
        <Nav
          variant="tabs"
          activeKey={mode}
          onSelect={(k) => setMode(k as 'seed' | 'private')}
          className="mb-3"
        >
          <Nav.Item>
            <Nav.Link eventKey="seed">Seed Phrase</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="private">Private Key</Nav.Link>
          </Nav.Item>
        </Nav>

        {/* Input form */}
        <Form>
          {mode === 'seed' ? (
            <Row xs={2} sm={3} md={4}>
              {words.map((word, idx) => (
                <Col key={idx} className="mb-3">
                  <Form.Group>
                    <Form.Label className="fw-semibold small">
                      Word {idx + 1}
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={word}
                      onChange={(e) =>
                        handleWordChange(idx, e.target.value)
                      }
                      placeholder={`word ${idx + 1}`}
                      style={{ borderRadius: 8, fontFamily: 'monospace' }}
                    />
                  </Form.Group>
                </Col>
              ))}
            </Row>
          ) : (
            <Form.Group className="mt-2">
              <Form.Label className="fw-semibold">
                Private Key (base64)
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                placeholder="Paste your base64 private key here"
                style={{ fontFamily: 'monospace', borderRadius: 8 }}
              />
            </Form.Group>
          )}

          {/* Password section */}
          <Row className="mt-3">
            <Col md={6} className="mb-3">
              <Form.Label className="fw-semibold">Set Password</Form.Label>
              <div className="d-flex align-items-center gap-2">
                <Form.Control
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  style={{ borderRadius: 8 }}
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowPw((s) => !s)}
                >
                  {showPw ? <EyeSlash /> : <Eye />}
                </Button>
              </div>
            </Col>

            <Col md={6} className="mb-3">
              <Form.Label className="fw-semibold">
                Confirm Password
              </Form.Label>
              <Form.Control
                type={showPw ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat password"
                style={{ borderRadius: 8 }}
              />
            </Col>
          </Row>
        </Form>

        {/* Buttons */}
        <div className="d-flex gap-2 mt-3">
          <Button
            variant="secondary"
            size="lg"
            className="w-50"
            onClick={resetFields}
            disabled={loading}
          >
            Reset
          </Button>
          <Button
            variant="primary"
            size="lg"
            className="w-50"
            onClick={handleImport}
            disabled={loading}
          >
            {loading ? 'Importing...' : 'Import Wallet'}
          </Button>
        </div>

        {/* Error */}
        {err && (
          <Alert className="mt-3" variant="danger">
            {err}
          </Alert>
        )}
      </Card>
    </div>
  );
}
