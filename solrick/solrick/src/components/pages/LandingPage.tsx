import { useEffect, useState } from 'react';
import { Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { vaultExists } from '../../utils/storage';

export default function LandingPage() {
  const [hasVault, setHasVault] = useState(false);
  const navigate = useNavigate();

  // 🔍 Check for existing vault
  useEffect(() => {
    (async () => {
      const exists = await vaultExists();
      setHasVault(exists);
    })();
  }, []);

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
      <Card className="p-5 shadow-lg text-center" style={{ maxWidth: 480 }}>
        <h2 className="mb-3 fw-bold">RickSafe Wallet</h2>
        <p className="text-muted mb-4">
          Secure your Solana tokens with confidence. 
          {hasVault
            ? ' You already have a wallet active.'
            : ' Create a wallet or access your existing one.'}
        </p>

        {hasVault ? (
          <div className="d-flex flex-column gap-3">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/account/view')}
            >
              View My Wallet
            </Button>
            <Button
              variant="outline-danger"
              size="lg"
              onClick={() => navigate('/account')}
            >
              Remove or Manage Wallet
            </Button>
          </div>
        ) : (
          <div className="d-flex justify-content-center gap-3">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/account/create')}
            >
              Create Wallet
            </Button>
            <Button
              variant="outline-primary"
              size="lg"
              onClick={() => navigate('/account/import')}
            >
              Import Wallet
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
