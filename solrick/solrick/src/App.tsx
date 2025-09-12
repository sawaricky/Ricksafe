import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import AccountHome from './components/pages/AccountHome';
import DashboardPage from './components/pages/DashboardPage';
import CreateWallet from './components/wallet/CreateWallet';
import ImportWallet from './components/wallet/ImportWallet';
import SendSol from './components/wallet/SendSol';
import ViewWallet from './components/wallet/ViewWallet';
import SignIn from './components/auth/SignIn';
import { useAuth } from './context/AuthContext';
import type { JSX } from 'react';

function RequireAuth({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  const loc = useLocation();
  if (!user) return <Navigate to="/signin" state={{ next: loc.pathname }} replace />;
  return children;
}

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/account" replace />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/dashboard" element={
            <RequireAuth><DashboardPage /></RequireAuth>
          } />
          <Route path="/account" element={<AccountHome />}>
            <Route index element={<div>Sign in, then pick an option from the sidebar</div>} />
            <Route path="create" element={<RequireAuth><CreateWallet /></RequireAuth>} />
            <Route path="import" element={<RequireAuth><ImportWallet /></RequireAuth>} />
            <Route path="send" element={<RequireAuth><SendSol /></RequireAuth>} />
            <Route path="view" element={<RequireAuth><ViewWallet /></RequireAuth>} />
          </Route>
          <Route path="*" element={<div style={{ padding: 16 }}>Not Found</div>} />
        </Routes>
      </Layout>
    </Router>
  );
}
