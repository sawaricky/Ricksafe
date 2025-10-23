// src/components/layout/Topbar.tsx
import { Navbar, Container, Button } from "react-bootstrap";
import { List } from "react-bootstrap-icons"; // Bootstrap hamburger icon

interface TopbarProps {
  onToggleSidebar: () => void;
}

export default function Topbar({ onToggleSidebar }: TopbarProps) {
  return (
    <Navbar
      className="shadow-sm px-3"
      style={{ backgroundColor: "#001f3f", height: "56px" }}
      expand="md"
      fixed="top"
    >
      <Container className="d-flex justify-content-between align-items-center">
        {/* Hamburger (only visible on small screens) */}
        <Button
          variant="link"
          className="d-md-none p-0 text-white"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <List size={28} />
        </Button>

        {/* Centered RickSafe title */}
        <Navbar.Brand
          className="mx-auto text-white fw-bold"
          style={{
            fontSize: "1.5rem",
            letterSpacing: "0.5px",
          }}
        >
          RickSafe
        </Navbar.Brand>

        {/* Placeholder div to balance spacing */}
        <div className="d-md-none" style={{ width: "28px" }}></div>
      </Container>
    </Navbar>
  );
}
