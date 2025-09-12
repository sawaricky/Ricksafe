import { Outlet } from 'react-router-dom';
import { Card } from 'react-bootstrap';

export default function AccountHome() {
  return (
    <Card className="p-3">
      <h3>Account</h3>
      <p className="text-muted">Use the sidebar to create, import, send, or receive SOL.</p>
      <Outlet />
    </Card>
  );
}
