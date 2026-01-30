# OpenClaw Agent Logbook (Dapp)

A simple on‑chain logbook that records **what your personal OpenClaw agent completed**. Each entry is a short, immutable record on Base Sepolia so the work is auditable and shareable.

## Why this exists (X research)
Recent OpenClaw posts highlight a few recurring use cases:
- **Workflow/toolkit focus:** people want repeatable autonomous workflows and plug‑ins.
- **Deployability:** quick deployment to WhatsApp/Signal/other channels.
- **Privacy + control:** local execution + guardrails are a key selling point.

This dapp turns those workflows into a lightweight **on‑chain logbook**.

References:
- https://x.com/milesdeutscher/status/2017300537323229458
- https://x.com/lizziepika/status/2017325577968161008
- https://x.com/marksuman/status/2017297077601243436
- https://x.com/getFoundry/status/2017307387124977774
- https://x.com/vishalojha_me/status/2017307678113206578

## What it does
- **Connect wallet** (MetaMask or compatible)
- **Log a completed task** (max 280 chars)
- **Read latest entries** (last 5 tasks)

## Stack
- **Solidity** smart contract (Hardhat)
- **React + Vite** frontend
- **ethers v6** for wallet + contract calls
- **Base Sepolia** as target testnet

---

# 1) Contracts

```bash
cd contracts
npm install
cp .env.example .env
# fill BASE_SEPOLIA_RPC_URL + DEPLOYER_PRIVATE_KEY
npm run compile
npm run deploy:sepolia
```

This prints the deployed contract address.

## Contract address
Copy the address into the web app:

```
web/.env
VITE_CONTRACT_ADDRESS=0xYourDeployedAddress
```

---

# 2) Web App

```bash
cd web
npm install
cp .env.example .env
# set VITE_CONTRACT_ADDRESS
npm run dev
```

Open: http://localhost:5173

---

## Future ideas
- Sign + hash task payloads from OpenClaw runs
- Allow tags (channel, tool, duration)
- Attach off‑chain proofs (IPFS)
- Add a simple “run explorer” page

---

## License
MIT
