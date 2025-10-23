// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import AccountHome from './components/pages/AccountHome';
import DashboardPage from './components/pages/DashboardPage';
import CreateWallet from './components/wallet/CreateWallet';
import ImportWallet from './components/wallet/ImportWallet';
import SendSol from './components/wallet/SendSol';
import ViewWallet from './components/wallet/ViewWallet';
import BackupSeed from './components/wallet/BackupSeed';
import ConfirmSeed from './components/wallet/ConfirmSeed';
import LandingPage from './components/pages/LandingPage';
import { useAuth } from './context/AuthContext';
import type { JSX } from 'react';

// ✅ Keep this only for /dashboard
function RequireAuth({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  if (!user) return <div style={{ padding: 16 }}>Access denied. Please sign in.</div>;
  return children;
}

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Landing page */}
          <Route path="/" element={<LandingPage />} />

          {/* Wallet routes (open, no sign-in needed) */}
          <Route path="/account" element={<AccountHome />}>
            <Route index element={<div>Create or import a wallet to begin.</div>} />
            <Route path="create" element={<CreateWallet />} />
            <Route path="import" element={<ImportWallet />} />
            <Route path="send" element={<SendSol />} />
            <Route path="view" element={<ViewWallet />} />
            <Route path="receive" element={<div>Coming soon: Receive SOL</div>} />
          </Route>

          {/* Wallet creation flow */}
          <Route path="/wallet/backup" element={<BackupSeed />} />
          <Route path="/wallet/confirm" element={<ConfirmSeed />} />

          {/* Protected dashboard (optional) */}
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <DashboardPage />
              </RequireAuth>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<div style={{ padding: 16 }}>Not Found</div>} />
        </Routes>
      </Layout>
    </Router>
  );
}
