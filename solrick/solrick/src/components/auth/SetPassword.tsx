// src/components/auth/SetPassword.tsx
// --------------------------------------------------
// Step 2 of authentication flow.
// User sets a strong password. This will later be used to encrypt/decrypt wallet data.
// On continue → navigates to SetPin.tsx.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Button, Alert } from 'react-bootstrap';

export default function SetPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [err, setErr] = useState('');
  const navigate = useNavigate();

  const handle = () => {
    // simple validation
    if (password.length < 8) {
      setErr('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirm) {
      setErr('Passwords do not match.');
      return;
    }

    // TODO (Step 2 utils): encrypt + store password securely
    localStorage.setItem('solrick.auth.password', password); 
    // ⚠️ temporary → will be replaced with encrypted IndexedDB storage.

    navigate('/auth/set-pin', { replace: true });
  };

  return (
    <Card className="p-3">
      <h3>Set Password</h3>
      <p className="text-muted">This password will protect your wallet data.</p>

      <Form.Group className="mt-2">
        <Form.Label>Password</Form.Label>
        <Form.Control
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
        />
      </Form.Group>

      <Form.Group className="mt-2">
        <Form.Label>Confirm Password</Form.Label>
        <Form.Control
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Re-enter password"
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
