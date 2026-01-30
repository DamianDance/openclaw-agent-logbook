import { useEffect, useMemo, useState } from "react";
import { BrowserProvider, Contract } from "ethers";
import { AGENT_LOGBOOK_ABI } from "./abi";

const BASE_SEPOLIA = {
  chainIdHex: "0x14a34", // 84532
  chainIdDec: 84532,
  name: "Base Sepolia",
  rpcUrls: ["https://sepolia.base.org"],
  blockExplorerUrls: ["https://sepolia.basescan.org"],
  nativeCurrency: { name: "Sepolia ETH", symbol: "ETH", decimals: 18 },
};

type Task = {
  task: string;
  agent: string;
  timestamp: number;
};

export default function App() {
  const [account, setAccount] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [taskText, setTaskText] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS as string | undefined;

  const hasProvider = typeof window !== "undefined" && (window as any).ethereum;

  const provider = useMemo(() => {
    if (!hasProvider) return null;
    return new BrowserProvider((window as any).ethereum);
  }, [hasProvider]);

  async function ensureBaseSepolia() {
    if (!hasProvider) return false;
    try {
      const chainId = await (window as any).ethereum.request({ method: "eth_chainId" });
      if (chainId === BASE_SEPOLIA.chainIdHex) return true;
      await (window as any).ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: BASE_SEPOLIA.chainIdHex }],
      });
      return true;
    } catch (err: any) {
      if (err?.code === 4902) {
        await (window as any).ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: BASE_SEPOLIA.chainIdHex,
              chainName: BASE_SEPOLIA.name,
              nativeCurrency: BASE_SEPOLIA.nativeCurrency,
              rpcUrls: BASE_SEPOLIA.rpcUrls,
              blockExplorerUrls: BASE_SEPOLIA.blockExplorerUrls,
            },
          ],
        });
        return true;
      }
      throw err;
    }
  }

  async function connect() {
    setStatus(null);
    if (!hasProvider) {
      setStatus("No wallet found. Install MetaMask or use a compatible wallet.");
      return;
    }
    try {
      await ensureBaseSepolia();
      const accounts = await (window as any).ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts?.[0] ?? null);
    } catch (e: any) {
      setStatus(e?.message || "Failed to connect wallet");
    }
  }

  async function loadTasks() {
    if (!provider || !contractAddress) return;
    setLoading(true);
    try {
      const contract = new Contract(contractAddress, AGENT_LOGBOOK_ABI, provider);
      const count = await contract.entryCount();
      const total = Number(count);
      const items: Task[] = [];
      for (let i = total - 1; i >= 0 && items.length < 5; i--) {
        const [task, agent, timestamp] = await contract.entries(i);
        items.push({ task, agent, timestamp: Number(timestamp) });
      }
      setTasks(items);
    } catch (e: any) {
      setStatus(e?.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }

  async function submitTask() {
    if (!provider || !contractAddress) return;
    if (!taskText.trim()) return;
    setSending(true);
    setStatus(null);
    try {
      await ensureBaseSepolia();
      const signer = await provider.getSigner();
      const contract = new Contract(contractAddress, AGENT_LOGBOOK_ABI, signer);
      const tx = await contract.logTask(taskText.trim());
      setStatus(`Submitted. Tx: ${tx.hash}`);
      await tx.wait();
      setTaskText("");
      await loadTasks();
    } catch (e: any) {
      setStatus(e?.message || "Failed to submit task");
    } finally {
      setSending(false);
    }
  }

  useEffect(() => {
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractAddress]);

  return (
    <div className="page">
      <header className="header">
        <div>
          <h1>OpenClaw Agent Logbook</h1>
          <p className="sub">On‑chain record of what your personal agent completed (Base Sepolia).</p>
        </div>
        <button className="btn" onClick={connect}>
          {account ? `Connected: ${account.slice(0, 6)}…${account.slice(-4)}` : "Connect Wallet"}
        </button>
      </header>

      <section className="card">
        <h2>Log a completed task</h2>
        <p className="muted">Store what your personal agent finished (e.g., “Checked Gmail + summarized”).</p>
        <div className="row">
          <input
            value={taskText}
            onChange={(e) => setTaskText(e.target.value)}
            placeholder="What did your agent complete? (max 280 chars)"
          />
          <button className="btn" onClick={submitTask} disabled={sending || !taskText.trim()}>
            {sending ? "Logging…" : "Log"}
          </button>
        </div>
        {status && <p className="status">{status}</p>}
        {!contractAddress && (
          <p className="warning">
            Missing contract address. Set <code>VITE_CONTRACT_ADDRESS</code> in <code>web/.env</code>.
          </p>
        )}
      </section>

      <section className="card">
        <div className="row space">
          <h2>Latest tasks</h2>
          <button className="btn ghost" onClick={loadTasks} disabled={loading}>
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
        <ul className="list">
          {tasks.length === 0 && <li className="muted">No tasks yet.</li>}
          {tasks.map((t, idx) => (
            <li key={`${t.agent}-${t.timestamp}-${idx}`}>
              <div className="task-text">{t.task}</div>
              <div className="task-meta">
                <span>{t.agent.slice(0, 6)}…{t.agent.slice(-4)}</span>
                <span>{new Date(t.timestamp * 1000).toLocaleString()}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <footer className="footer">
        <p>OpenClaw Agent Logbook — transparent history for personal agent work.</p>
      </footer>
    </div>
  );
}
