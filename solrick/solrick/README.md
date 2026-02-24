# Solrick - Solana Wallet

A minimal, developer-friendly Solana wallet for mainnet. Create or import wallets, check balances, and send & Receive SOL seamlessly.

## Features

- **Create & Import Wallets** - Generate new wallets or import from existing seed phrases
- **View SOL Balance** - Check wallet balance in real-time on Solana mainnet
- **Send SOL** - Transfer SOL to other addresses with transaction confirmation
- **Receive SOL** - Share wallet address and receive SOL from others
- **Pin-Protected** - Optional PIN authentication for additional security

## Tech Stack

- **Frontend**: React 19 + Vite
- **Blockchain**: @solana/web3.js for mainnet interaction
- **State Management**: React Context API
- **Styling**: Tailwind CSS
- **Build**: Vite + TypeScript

## Quick Start

### Prerequisites
- Node.js 18+
- Yarn package manager

### Installation & Development

\\\Bash
# Install dependencies
yarn

# Start development server
yarn dev

# Build for production
yarn build
\\\

The development server runs on \http://localhost:5173\

## Environment Configuration

Create a \.env.local\ file in the project root:

\\\env
VITE_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
\\\

Use a reliable mainnet RPC endpoint. Alternatives:
- https://api.mainnet-beta.solana.com (Solana Foundation)
- https://rpc.helius.xyz (Helius RPC)
- https://rpc.ironforge.network/mainnet (IronForge)

## Project Structure

\\\
src/
+-- components/
   +-- auth/              # Authentication (SignUp, SignIn, SetPassword, SetPin)
   +-- wallet/            # Wallet operations (Create, Import, Send, Receive)
   +-- pages/             # Main pages (Dashboard, Account Home, Landing)
   +-- layout/            # UI components (Topbar, Sidebar, Footer)
+-- context/
   +-- AuthContext.tsx    # User authentication state
   +-- WalletContext.tsx  # Wallet state & blockchain interactions
+-- utils/
   +-- crypto.tsx         # Encryption/decryption utilities
   +-- derivation.tsx     # Key derivation logic
   +-- storage.tsx        # Local storage management
   +-- wallet.tsx         # Solana wallet operations
+-- App.tsx                # Main app component
\\\

## Security Warnings ??

**This is a mainnet wallet handling real SOL tokens and real money. Exercise caution:**

1. **Private Keys** - Never share your seed phrase or private keys. They provide complete access to your funds.
2. **Browser-Based Storage** - Private keys are encrypted and stored locally. Ensure your machine is secure and malware-free.
3. **RPC Endpoint Trust** - Use trusted RPC endpoints. Compromised endpoints can intercept transactions.
4. **Transaction Verification** - Always verify recipient addresses before confirming transactions on mainnet.
5. **Backup Your Seed** - Store your seed phrase securely offline before creating any transactions.
6. **Test Thoroughly** - Double-check all functionality with small amounts before large transactions.

## Development Workflow

1. Clone the repository
2. Run \yarn\ to install dependencies
3. Configure \VITE_SOLANA_RPC_URL\ in \.env.local\
4. Run \yarn dev\ to start the development server
5. Test wallet creation and transactions with small amounts
6. Run \yarn build\ for production deployment

## Production Notes

- Ensure environment variables are properly set in your deployment platform
- Use a web3 security audit before deploying to production
- Consider adding transaction rate limiting and amount validation
- Implement proper error handling and user feedback mechanisms
