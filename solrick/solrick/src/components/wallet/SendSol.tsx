import { useEffect, useMemo, useState } from "react";
import { useWalletContext } from "../../context/WalletContext";
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { Card, Form, Button, Alert } from "react-bootstrap";
import { ArrowUpRight } from "react-bootstrap-icons";

export default function SendSol() {
  const { wallet, sendSol } = useWalletContext();

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");
  const [feeLamports, setFeeLamports] = useState<number | null>(null);
  const [estError, setEstError] = useState("");

  const RPC_URL =
    import.meta.env.VITE_SOLANA_RPC || "https://api.mainnet-beta.solana.com";
  const WS_URL =
    import.meta.env.VITE_SOLANA_WS || RPC_URL.replace("https://", "wss://");

  const connection = useMemo(
    () =>
      new Connection(RPC_URL, {
        commitment: "confirmed",
        wsEndpoint: WS_URL,
      }),
    [RPC_URL, WS_URL]
  );

  const parsedAmount = useMemo(() => {
    const n = parseFloat(amount);
    return Number.isFinite(n) && n > 0 ? n : 0;
  }, [amount]);

  const balanceLamports = Math.floor(
    ((wallet?.balance ?? 0) * LAMPORTS_PER_SOL) || 0
  );
  const sendLamports = Math.floor(parsedAmount * LAMPORTS_PER_SOL);
  const estFee = feeLamports ?? 5000;
  const totalCostLamports = sendLamports + estFee;
  const insufficient = totalCostLamports > balanceLamports;

  useEffect(() => {
    let cancelled = false; // fixed: remove stray text

    async function estimate() {
      setEstError("");
      setFeeLamports(null);

      if (!wallet || !parsedAmount) return;

      let toPubkey: PublicKey;
      try {
        toPubkey = new PublicKey(recipient.trim());
      } catch {
        return;
      }

      try {
        const tx = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: wallet.keypair.publicKey,
            toPubkey,
            lamports: Math.max(1, sendLamports),
          })
        );
        tx.feePayer = wallet.keypair.publicKey;

        const { blockhash } = await connection.getLatestBlockhash("finalized");
        tx.recentBlockhash = blockhash;

        const msg = tx.compileMessage();
        const feeResp = await connection.getFeeForMessage(msg, "finalized");
        const lamports = feeResp.value ?? 5000;

        if (!cancelled) setFeeLamports(lamports);
      } catch (e: any) {
        if (!cancelled) {
          setEstError(e?.message || "Could not estimate fee");
          setFeeLamports(5000);
        }
      }
    }

    estimate();
    return () => {
      cancelled = true;
    };
  }, [wallet, recipient, parsedAmount, connection, sendLamports]);

  const handleSend = async () => {
    if (!wallet) {
      setStatus("No wallet loaded");
      return;
    }
    if (!parsedAmount) {
      setStatus("Enter a valid amount");
      return;
    }
    try {
      const sig = await sendSol(recipient.trim(), parsedAmount);
      console.log("Transaction signature:", sig);
      setStatus(`✅ Sent! Signature: ${sig}`);
    } catch (e: any) {
      setStatus(`❌ Error: ${e?.message || String(e)}`);
    }
  };

  return (
    // UI-only change: remove vh-100, center within the layout's canvas
    <div className="d-flex w-100 h-100 align-items-center justify-content-center bg-light">
      <Card
        className="p-4 border-0"
        style={{
          maxWidth: 520,
          width: "100%",
          borderRadius: 16,
          boxShadow: '0 12px 30px rgba(59,130,246,0.14)'
        }}
      >
        {/* Header */}
        <div className="d-flex align-items-center gap-2 mb-3">
          <ArrowUpRight size={28} className="text-primary" />
          <h3 className="mb-0">Send SOL</h3>
        </div>

        {!wallet && (
          <Alert variant="warning" className="mb-0">
            Please sign in and load a wallet to send SOL.
          </Alert>
        )}

        {/* Form */}
        {wallet && (
          <>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Recipient Address</Form.Label>
              <Form.Control
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Enter recipient public key"
                style={{ borderRadius: 8 }}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Amount (SOL)</Form.Label>
              <Form.Control
                type="number"
                step="0.000000001"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                style={{ borderRadius: 8 }}
              />
            </Form.Group>

            {/* Balance + Fee Info */}
            <div className="p-3 bg-light rounded">
              <div>
                <strong>Available:</strong>{" "}
                {(balanceLamports / LAMPORTS_PER_SOL).toFixed(4)} SOL
              </div>
              {parsedAmount > 0 && (
                <>
                  <div>
                    <strong>Estimated fee:</strong>{" "}
                    {(estFee / LAMPORTS_PER_SOL).toFixed(9)} SOL
                  </div>
                  <div>
                    <strong>Total cost:</strong>{" "}
                    {(totalCostLamports / LAMPORTS_PER_SOL).toFixed(9)} SOL
                  </div>
                </>
              )}
              {estError && (
                <div className="text-danger mt-2 small">
                  Fee estimate: {estError}
                </div>
              )}
            </div>

            {insufficient && parsedAmount > 0 && (
              <Alert className="mt-3" variant="danger">
                Amount plus fee exceeds your balance. Try a smaller amount.
              </Alert>
            )}

            <Button
              className="mt-4 w-100"
              variant="primary"
              size="lg"
              style={{ borderRadius: 8 }}
              onClick={handleSend}
              disabled={
                !wallet || !parsedAmount || insufficient || !recipient.trim()
              }
            >
              Send Now
            </Button>
          </>
        )}

        {status && (
          <Alert
            variant={status.startsWith("✅") ? "success" : "danger"}
            className="mt-3 mb-0"
          >
            {status}
          </Alert>
        )}
      </Card>
    </div>
  );
}
