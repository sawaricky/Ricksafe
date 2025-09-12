import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Card, Nav, Button } from 'react-bootstrap';
import { useWalletContext } from '../../context/WalletContext';
import { useAuth } from '../../context/AuthContext';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  'nav-link ' + (isActive ? 'active fw-semibold' : '');

export default function Sidebar() {
  const { wallet, clearWallet } = useWalletContext();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const loc = useLocation();

  const goSignIn = () => navigate('/signin', { state: { next: loc.pathname } });

  const handleWalletSignOut = () => {
    clearWallet();
    navigate('/account');
  };

  const handleUserSignOut = () => {
    clearWallet();
    signOut();
    navigate('/signin');
  };

  return (
    <Card className="p-2">
      <div className="px-2 pt-2 pb-1 mb-2 d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Solrick Wallet</h5>
      </div>

      <div className="px-2 pb-2 small">
        {user ? (
          <div className="d-flex gap-2 align-items-center">
            <span className="text-muted">Signed in as</span>
            <strong>{user.name}</strong>
            <Button size="sm" variant="outline-secondary" onClick={handleUserSignOut}>
              Sign out
            </Button>
          </div>
        ) : (
          <Button size="sm" variant="light" onClick={goSignIn}>Sign in</Button>
        )}
      </div>

      {/* Section 1: App navigation */}
      <Nav className="flex-column">
        <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>

        <div className="mt-2 mb-1 small text-muted px-2">Wallet</div>
        <NavLink to="/account/create" className={linkClass}>Create Wallet</NavLink>
        <NavLink to="/account/import" className={linkClass}>Import Wallet</NavLink>
        <NavLink to="/account/send" className={linkClass}>Send SOL</NavLink>
        <NavLink to="/account/view" className={linkClass}>Receive SOL</NavLink>
      </Nav>

      {wallet && (
        <div className="px-2 pb-2 pt-3">
          <Button size="sm" variant="outline-danger" onClick={handleWalletSignOut}>
            Remove this wallet
          </Button>
        </div>
      )}

      {/* Section 2: Pump.fun (buttons only, no handlers) */}
      <div className="mt-3 mb-1 small text-muted px-2">Pump.fun</div>
      <div className="d-grid gap-2 px-2 pb-2">
        <Button size="sm" variant="outline-primary">Create Token</Button>
        <Button size="sm" variant="outline-primary">Trending</Button>
        <Button size="sm" variant="outline-primary">New Pairs</Button>
        <Button size="sm" variant="outline-primary">Buy</Button>
        <Button size="sm" variant="outline-primary">Sell</Button>
        <Button size="sm" variant="outline-primary">My Tokens</Button>
        {/* <Button size="sm" variant="outline-primary">Airdrop</Button> */}
        <Button size="sm" variant="outline-primary">Claim</Button>
        <Button size="sm" variant="outline-primary">Analytics</Button>
        <Button size="sm" variant="outline-primary">Open Pump.fun</Button>
      </div>
    </Card>
  );
}
