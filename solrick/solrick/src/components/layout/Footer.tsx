import { Container, Row, Col } from 'react-bootstrap';

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#f8f9fa' }} className="border-top mt-4 py-3">
      <Container>
        <Row className="align-items-center text-center text-md-start">
          <Col xs={12} md={6} className="d-flex flex-column flex-md-row align-items-center gap-2 justify-content-center justify-content-md-start">
            <div
              style={{
                fontWeight: 700,
                color: '#0b3b5a',
                fontSize: 18,
                letterSpacing: 0.4,
              }}
            >
              RickSafe
            </div>
            <div className="text-muted small">Secure Wallet for Solana</div>
          </Col>

          <Col xs={12} md={6} className="mt-3 mt-md-0 small text-muted d-flex flex-column flex-md-row align-items-center justify-content-center justify-content-md-end gap-2">
            <div>
              <span className="me-2">copyright © 2025 RickSafe</span>
            </div>
            <div>
              <a href="#" className="text-muted me-2">Privacy</a>
              <a href="#" className="text-muted">Terms</a>
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}
