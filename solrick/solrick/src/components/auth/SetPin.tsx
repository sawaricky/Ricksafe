// src/components/auth/SetPin.tsx
// --------------------------------------------------
// Step 3 of authentication flow.
// User sets a PIN (4–6 digits). Used for quick unlock (optional).
// On continue → navigates to wallet creation flow (/account/create).

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Button, Alert } from 'react-bootstrap';

export default function SetPin() {
  const [pin, setPin] = useState('');
  const [confirm, setConfirm] = useState('');
  const [err, setErr] = useState('');
  const navigate = useNavigate();

  const handle = () => {
    if (!pin) {
      // Skip allowed → go to wallet creation directly
      navigate('/account/create', { replace: true });
      return;
    }

    if (!/^\d{4,6}$/.test(pin)) {
      setErr('PIN must be 4–6 digits.');
      return;
    }
    if (pin !== confirm) {
      setErr('PINs do not match.');
      return;
    }

    // TODO (Step 2 utils): store PIN securely (encrypted with password).
    localStorage.setItem('solrick.auth.pin', pin);
    // ⚠️ temporary → will be replaced with encrypted IndexedDB storage.

    // After PIN setup → go to wallet creation
    navigate('/account/create', { replace: true });
  };

  return (
    <Card className="p-3">
      <h3>Set PIN (Optional)</h3>
      <p className="text-muted">
        You can set a quick PIN (4–6 digits) for faster access. Password will
        always be required as fallback.
      </p>

      <Form.Group className="mt-2">
        <Form.Label>PIN</Form.Label>
        <Form.Control
          type="password"
          inputMode="numeric"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="Enter PIN (optional)"
        />
      </Form.Group>

      <Form.Group className="mt-2">
        <Form.Label>Confirm PIN</Form.Label>
        <Form.Control
          type="password"
          inputMode="numeric"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Re-enter PIN"
        />
      </Form.Group>

      <Button className="mt-3" variant="light" onClick={handle}>
        Continue
      </Button>

      {err && (
        <Alert className="mt-3" variant="danger">
          {err}
        </Alert>
      )}
    </Card>
  );
}
