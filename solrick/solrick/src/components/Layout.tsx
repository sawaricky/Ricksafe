import { useState } from "react";
import Topbar from "./layout/Topbar";
import Sidebar from "./layout/Sidebar";
import { Outlet } from "react-router-dom";

export default function Layout({ children }: { children?: React.ReactNode }) {
  const [showSidebar, setShowSidebar] = useState(false);

  return (
    <div
      className="d-flex flex-column"
      style={{ minHeight: "100vh", overflow: "hidden" }}
    >
      {/* Topbar */}
      <Topbar onToggleSidebar={() => setShowSidebar(true)} />

      {/* Main layout */}
      <div className="d-flex flex-grow-1">
        {/* Sidebar (desktop fixed, mobile offcanvas) */}
        <div
          className="d-none d-md-flex flex-column bg-white border-end"
          style={{
            width: "16.6%", // matches lg={2}
            minHeight: "calc(100vh - 56px)",
            marginTop: "56px",
          }}
        >
          {/* Render only desktop variant for this instance */}
          <Sidebar
            show={showSidebar}
            onHide={() => setShowSidebar(false)}
            renderMobile={false}
          />
        </div>

        {/* Main Content */}
        <div
          className="flex-grow-1 bg-light"
          style={{
            minHeight: "calc(100vh - 56px)",
            marginTop: "56px",
          }}
        >
          <div className="p-3 border-bottom bg-white">
            <h2 className="mb-1">RickSafe</h2>
            <p className="text-muted mb-0">
              Secure Wallet for Solana Tokens
            </p>
          </div>

          <div className="flex-grow-1 overflow-auto p-4">
            {children ?? <Outlet />}
          </div>
        </div>
      </div>

      {/* Mobile Offcanvas Sidebar (separate so it still mounts) */}
      <Sidebar
        show={showSidebar}
        onHide={() => setShowSidebar(false)}
        renderDesktop={false}
      />
    </div>
  );
}
