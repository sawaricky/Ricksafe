// src/components/auth/SignUp.tsx
// --------------------------------------------------

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { generateMnemonic } from '../../utils/derivation';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft } from 'react-bootstrap-icons';

export default function SignUp() {
  const { signIn } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const navigate = useNavigate();

  const handleSignUp = () => {
    if (!username.trim() || !password.trim()) {
      setErr('Username and password are required.');
      return;
    }

    const mnemonic = generateMnemonic();
    localStorage.setItem('solrick.auth.password', password);

    signIn(username, password);

    console.log("🆕 Signing up new user:", username);
    navigate('/wallet/backup', { state: { mnemonic } });
  };

  return (
    <div
      style={{
        backgroundColor: '#F7F9FC',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Card
        className="p-4 shadow-sm"
        style={{
          width: '100%',
          maxWidth: 520, // wider card
          borderRadius: 12,
        }}
      >
        {/* Back button */}
        <Button
          variant="link"
          className="text-decoration-none text-primary d-flex align-items-center mb-3 p-0"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="me-1" /> Back
        </Button>

        {/* Header */}
        <h2 style={{ color: '#1C1E26', fontWeight: 600, textAlign: 'center' }}>
          Create your RickSafe account
        </h2>
        <p style={{ color: '#5A6270', textAlign: 'center' }}>
          Securely set up your wallet in a few steps
        </p>

        {/* Username */}
        <Form.Group className="mt-3">
          <Form.Label style={{ color: '#5A6270' }}>Username</Form.Label>
          <Form.Control
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Choose a username"
            style={{ borderRadius: 8 }}
          />
        </Form.Group>

        {/* Password */}
        <Form.Group className="mt-3">
          <Form.Label style={{ color: '#5A6270' }}>Password</Form.Label>
          <Form.Control
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password"
            style={{ borderRadius: 8 }}
          />
        </Form.Group>

        {/* Continue */}
        <Button
          className="mt-4 w-100"
          style={{ backgroundColor: '#4F8DF7', border: 'none', borderRadius: 8 }}
          onClick={handleSignUp}
        >
          Continue
        </Button>

        {/* Error */}
        {err && (
          <Alert className="mt-3" variant="danger">
            {err}
          </Alert>
        )}

        {/* Footer */}
        <div className="mt-4 text-center">
          <span style={{ color: '#5A6270' }}>Already have an account? </span>
          <a href="/signin" style={{ color: '#4F8DF7', fontWeight: 500 }}>
            Sign In
          </a>
        </div>
      </Card>
    </div>
  );
}
