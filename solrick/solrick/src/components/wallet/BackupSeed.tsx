// src/pages/wallet/BackupSeed.tsx
// --------------------------------------------------
// Step 2: Show 12-word seed phrase to the user.
// They must write it down. Continue → ConfirmSeed.tsx.

import { useLocation, useNavigate } from 'react-router-dom';
import { Card, Button, Alert } from 'react-bootstrap';

export default function BackupSeed() {
  const navigate = useNavigate();
  const loc = useLocation();

  // Safely extract mnemonic from location.state
  const mnemonic = (loc.state as { mnemonic?: string })?.mnemonic ?? '';

  // Convert into string[] (safe split on whitespace)
  const words: string[] = mnemonic.trim() ? mnemonic.trim().split(/\s+/) : [];

  if (!mnemonic) {
    return (
      <Alert variant="danger">
        No seed phrase found. Go back and create a new wallet.
      </Alert>
    );
  }

  const handleContinue = () => {
    navigate('/wallet/confirm', { state: { mnemonic } });
  };

  return (
    <Card className="p-3">
      <h3>Backup Seed Phrase</h3>
      <p className="text-muted">
        Write down these 12 words in the exact order. This is the only way to
        recover your wallet if you lose access.
      </p>

      <div className="p-3 bg-light rounded d-flex flex-wrap gap-2">
        {words.map((w: string, i: number) => (
          <span
            key={`${w}-${i}`}
            className="px-2 py-1 border rounded bg-white"
            style={{ minWidth: 70, textAlign: 'center' }}
          >
            {i + 1}. {w}
          </span>
        ))}
      </div>

      <Button className="mt-3" variant="light" onClick={handleContinue}>
        I have written it down
      </Button>
    </Card>
  );
}
