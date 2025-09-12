import { Navbar, Container } from 'react-bootstrap';

export default function Topbar() {
  return (
    <Navbar bg="light" data-bs-theme="light" sticky="top" className="border-bottom">
      <Container fluid>
        <Navbar.Brand>Solrick Wallet</Navbar.Brand>
      </Container>
    </Navbar>
  );
}
