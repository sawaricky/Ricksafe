import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';

export default function SignIn() {
  const { signIn } = useAuth();
  const [name, setName] = useState('');
  const [err, setErr] = useState('');
  const navigate = useNavigate();
  const loc = useLocation();
  const next = (loc.state as any)?.next || '/account';

  const handle = () => {
    try {
      signIn(name);
      navigate(next, { replace: true });
    } catch (e: any) {
      setErr(e?.message || 'Failed to sign in');
    }
  };

  return (
    <Card className="p-3">
      <h3>Sign In</h3>
      <p className="text-muted">Enter a name to create or access your wallet.</p>
      <Form.Group className="mt-2">
        <Form.Label>Name</Form.Label>
        <Form.Control value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Akash" />
      </Form.Group>
      <Button className="mt-3" variant="light" onClick={handle}>Continue</Button>
      {err && <Alert className="mt-3" variant="danger">{err}</Alert>}
    </Card>
  );
}
