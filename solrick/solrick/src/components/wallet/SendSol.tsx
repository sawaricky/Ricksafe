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

export default function SendSol() {
  const { wallet, sendSol } = useWalletContext();

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");
  const [feeLamports, setFeeLamports] = useState<number | null>(null);
  const [estError, setEstError] = useState("");

  // Use the same RPC/WS as your Helius .env (falls back to public if missing)
  const RPC_URL =
    import.meta.env.VITE_SOLANA_RPC || "https://api.mainnet-helius.rpcpool.com"; // fallback not expected to be used
  const WS_URL =
    import.meta.env.VITE_SOLANA_WS || RPC_URL.replace("https://", "wss://");

  // Single connection for this component (better: consume from context if you expose it)
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
  const estFee = feeLamports ?? 5000; // default if estimate fails
  const totalCostLamports = sendLamports + estFee;
  const insufficient = totalCostLamports > balanceLamports;

  // Estimate fee for a simple transfer using getLatestBlockhash + getFeeForMessage
  useEffect(() => {
    let cancelled = false;

    async function estimate() {
      setEstError("");
      setFeeLamports(null);

      if (!wallet) return;
      if (!parsedAmount) return;

      // Validate recipient early
      let toPubkey: PublicKey;
      try {
        toPubkey = new PublicKey(recipient.trim());
      } catch {
        // Invalid address; skip estimation silently
        return;
      }

      try {
        const tx = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: wallet.keypair.publicKey,
            toPubkey,
            lamports: Math.max(1, Math.floor(parsedAmount * LAMPORTS_PER_SOL)),
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
  }, [wallet, recipient, parsedAmount, connection]);

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
      setStatus(`Sent. Signature: ${sig}`);
    } catch (e: any) {
      setStatus(`Error: ${e?.message || String(e)}`);
    }
  };

  return (
    <Card className="p-3">
      <h3>Send SOL</h3>

      <Form.Group className="mt-2">
        <Form.Label>Recipient Address</Form.Label>
        <Form.Control
          type="text"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="Enter recipient public key"
        />
      </Form.Group>

      <Form.Group className="mt-2">
        <Form.Label>Amount (SOL)</Form.Label>
        <Form.Control
          type="number"
          step="0.000000001"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
        />
      </Form.Group>

      {/* Estimator readout */}
      {wallet && (
        <div className="mt-3 small text-muted">
          <div>
            Available: {(balanceLamports / LAMPORTS_PER_SOL).toFixed(9)} SOL
          </div>
          {parsedAmount > 0 && (
            <>
              <div>
                Estimated fee: {(estFee / LAMPORTS_PER_SOL).toFixed(9)} SOL
              </div>
              <div>
                Total cost:{" "}
                {(totalCostLamports / LAMPORTS_PER_SOL).toFixed(9)} SOL
              </div>
            </>
          )}
          {estError && (
            <div className="text-danger mt-1">Fee estimate: {estError}</div>
          )}
        </div>
      )}

      {insufficient && parsedAmount > 0 && (
        <Alert className="mt-3" variant="danger">
          Amount plus fee exceeds your balance. Try a smaller amount.
        </Alert>
      )}

      <Button
        className="mt-3"
        variant="light"
        onClick={handleSend}
        disabled={!wallet || !parsedAmount || insufficient || !recipient.trim()}
      >
        Send
      </Button>

      {status && (
        <Alert variant="info" className="mt-3">
          {status}
        </Alert>
      )}
    </Card>
  );
}
