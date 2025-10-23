// src/components/wallet/CreateWallet.tsx
// --------------------------------------------------
// Step 1: Generate a new wallet seed phrase.

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button, Alert, ProgressBar } from "react-bootstrap";
import { ShieldLock } from "react-bootstrap-icons";

export default function CreateWallet() {
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const handleCreate = async () => {
    setErr("");
    try {
      const { generateMnemonic } = await import("../../utils/derivation");
      const mnemonic = generateMnemonic();
      navigate("/wallet/backup", { state: { mnemonic } });
    } catch (e: any) {
      setErr(e?.message || "Failed to create wallet");
    }
  };

  return (
  <div
    className="d-flex justify-content-center align-items-center w-100 h-100"
    style={{ backgroundColor: "#f9fafb" }}
  >
    <Card
      className="p-4 shadow border-0"
      style={{ maxWidth: "480px", width: "100%", borderRadius: "16px" }}
    >
        {/* Step indicator */}
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <small className="text-muted fw-semibold">Step 1 of 3</small>
            <span className="text-muted" style={{ fontSize: "0.8rem" }}>
              33%
            </span>
          </div>
          <ProgressBar now={33} style={{ height: "6px" }} />
        </div>

        {/* Icon + Title */}
        <div className="d-flex align-items-center gap-2 mb-3">
          <ShieldLock size={28} className="text-primary" />
          <h4 className="mb-0 fw-semibold">Create New Wallet</h4>
        </div>

        <p className="text-secondary mb-4" style={{ lineHeight: "1.6" }}>
          A secure <strong>12-word recovery phrase</strong> will be generated.{" "}
          <span className="fw-semibold">Save it carefully</span> — this is the
          only way to restore your wallet if you lose access.
        </p>

        <Button
          variant="primary"
          size="lg"
          className="w-100 fw-semibold"
          onClick={handleCreate}
        >
          Generate Wallet
        </Button>

        {err && (
          <Alert className="mt-3" variant="danger">
            {err}
          </Alert>
        )}
      </Card>
    </div>
  );
}
