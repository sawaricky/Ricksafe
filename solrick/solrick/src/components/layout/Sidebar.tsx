import { useNavigate } from "react-router-dom";
import { Card, Nav, Button, Alert, Offcanvas } from "react-bootstrap";
import { useWalletContext } from "../../context/WalletContext";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";
import { vaultExists, deleteLocalVault } from "../../utils/storage";

interface SidebarProps {
  show: boolean;
  onHide: () => void;
  // Allow parent to control which variant renders when multiple
  // Sidebar instances are mounted. Defaults keep current behavior.
  renderDesktop?: boolean;
  renderMobile?: boolean;
}

const linkClass = ({ isActive }: { isActive: boolean }) =>
  "nav-link " + (isActive ? "active fw-semibold" : "");

export default function Sidebar({
  show,
  onHide,
  renderDesktop = true,
  renderMobile = true,
}: SidebarProps) {
  const { wallet, clearWallet, exportSecret } = useWalletContext();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [copied, setCopied] = useState(false);
  const [hasVault, setHasVault] = useState(false);

  useEffect(() => {
    (async () => {
      const exists = await vaultExists();
      setHasVault(exists);
    })();
  }, [wallet]);

  const handleRemoveWallet = async () => {
    try {
      await deleteLocalVault();
      clearWallet();
      setHasVault(false);
      navigate("/");
      onHide();
    } catch (err) {
      console.error("❌ Failed to remove wallet:", err);
    }
  };

  const handleExport = async () => {
    const secret = exportSecret();
    if (!secret) return;
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("❌ Failed to copy secret:", err);
    }
  };

  const handleNavClick = (path: string) => {
    navigate(path);
    onHide(); // close Offcanvas automatically after navigation
  };

  const DisabledLink = ({ children }: { children: React.ReactNode }) => (
    <span
      className="nav-link text-muted"
      style={{ pointerEvents: "none", opacity: 0.5 }}
    >
      {children}
    </span>
  );

  // ✅ Single SidebarContent definition
  const SidebarContent = (
    <Card className="p-2 d-flex flex-column h-100 border-0">
      <div className="px-2 pt-2 pb-1 mb-2 d-flex justify-content-between align-items-center">
        <h5 className="mb-0">RickSafe</h5>
      </div>

      <div className="px-2 pb-2 small">
        {hasVault ? (
          <span className="text-success fw-semibold">Wallet active</span>
        ) : (
          <span className="text-muted">
            No wallet found. Create or import to begin.
          </span>
        )}
      </div>

      <div className="flex-grow-1 overflow-auto">
        <Nav className="flex-column">
          <div className="mt-2 mb-1 small text-muted px-2">Wallet</div>

          {hasVault ? (
            <>
              <DisabledLink>Create Wallet</DisabledLink>
              <DisabledLink>Import Wallet</DisabledLink>
            </>
          ) : (
            <>
              <Button
                variant="link"
                className={linkClass({ isActive: false })}
                onClick={() => handleNavClick("/account/create")}
              >
                Create Wallet
              </Button>
              <Button
                variant="link"
                className={linkClass({ isActive: false })}
                onClick={() => handleNavClick("/account/import")}
              >
                Import Wallet
              </Button>
            </>
          )}

          {hasVault ? (
            <>
              <Button
                variant="link"
                className={linkClass({ isActive: false })}
                onClick={() => handleNavClick("/account/view")}
              >
                View Wallet
              </Button>
              <Button
                variant="link"
                className={linkClass({ isActive: false })}
                onClick={() => handleNavClick("/account/send")}
              >
                Send SOL
              </Button>
              <Button
                variant="link"
                className={linkClass({ isActive: false })}
                onClick={() => handleNavClick("/account/receive")}
              >
                Receive SOL
              </Button>
            </>
          ) : (
            <>
              <DisabledLink>View Wallet</DisabledLink>
              <DisabledLink>Send SOL</DisabledLink>
              <DisabledLink>Receive SOL</DisabledLink>
            </>
          )}
        </Nav>

        {hasVault && (
          <div className="px-2 pb-2 pt-3 d-flex flex-column gap-2">
            <Button size="sm" variant="outline-dark" onClick={handleExport}>
              Export Secret Key
            </Button>

            {copied && (
              <Alert className="py-1 mb-0" variant="success">
                Secret copied
              </Alert>
            )}

            <Button
              size="sm"
              variant="outline-danger"
              onClick={handleRemoveWallet}
            >
              Remove this wallet
            </Button>
          </div>
        )}

        <div className="mt-3 mb-1 small text-muted px-2">Pump fun</div>
        <div
          className="d-grid gap-2 px-2 pb-2"
          style={{
            opacity: 0.5,
            pointerEvents: "none",
            filter: "grayscale(100%)",
          }}
        >
          {[
            "Create Token",
            "Trending",
            "New Pairs",
            "Buy",
            "Sell",
            "My Tokens",
            "Claim",
            "Analytics",
            "Open Pump.fun",
          ].map((label, idx) => (
            <Button key={idx} size="sm" variant="outline-secondary" disabled>
              {label}
            </Button>
          ))}
        </div>
      </div>

      {user && (
        <div className="px-2 pt-2">
          <Button
            className="w-100 fw-semibold"
            style={{
              backgroundColor: "#dc3545",
              border: "none",
              color: "#fff",
            }}
            onClick={() => {
              signOut();
              onHide();
              navigate("/signin");
            }}
          >
            Sign Out
          </Button>
        </div>
      )}
    </Card>
  );

  return (
    <>
      {/* ✅ Desktop Sidebar (visible from md and up) */}
      {renderDesktop && (
        <div className="d-none d-md-flex flex-column h-100 bg-white border-end">
          {SidebarContent}
        </div>
      )}

      {/* ✅ Mobile Offcanvas Sidebar (rendered only below md) */}
      {renderMobile && (
        <div className="d-md-none">
          <Offcanvas
            show={show}
            onHide={onHide}
            placement="start"
            style={{
              width: "80%",
              maxWidth: "300px",
              borderRight: "1px solid #ddd",
              backgroundColor: "#fff",
              boxShadow: "2px 0 6px rgba(0,0,0,0.15)",
              marginRight: "40px",
            }}
          >
            <Offcanvas.Header closeButton>
              <Offcanvas.Title>RickSafe Menu</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>{SidebarContent}</Offcanvas.Body>
          </Offcanvas>
        </div>
      )}
    </>
  );
}
