import { Container, Row, Col } from 'react-bootstrap';
import Topbar from './layout/Topbar';
import Sidebar from './layout/Sidebar';
import { Outlet } from 'react-router-dom';

export default function Layout({ children }: { children?: React.ReactNode }) {
  return (
    <>
      <Topbar />
      <Container fluid className="mt-3">
        <Row>
          <Col xs={12} md={3} lg={2} className="mb-3">
            <Sidebar />
          </Col>
          <Col xs={12} md={9} lg={10}>
            {children ?? <Outlet />}
          </Col>
        </Row>
      </Container>
    </>
  );
}
