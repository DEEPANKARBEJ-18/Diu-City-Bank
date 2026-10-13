import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";

function money(value) {
  return Number(value || 0).toLocaleString("en-BD", { style: "currency", currency: "BDT" });
}

export default function AccountDetail() {
  const { id } = useParams();
  const [account, setAccount] = useState(null);
  const [txs, setTxs] = useState([]);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const [acc, history] = await Promise.all([
      api.get(`/accounts/${id}`),
      api.get(`/accounts/${id}/transactions`),
    ]);
    setAccount(acc.data);
    setTxs(history.data);
  }

  useEffect(() => {
    load().catch((err) => setError(err.response?.data?.message || "Could not load account"));
  }, [id]);

  async function move(kind) {
    setError("");
    try {
      await api.post(`/accounts/${id}/${kind}`, { amount: Number(amount), description });
      setAmount("");
      setDescription("");
      await load();
    } catch (err) {
      setError(err.response?.data?.message || `Could not ${kind}`);
    }
  }

  if (!account) return <p>{error || "Loading account..."}</p>;

  return (
    <div>
      <h1>{account.account_number}</h1>
      <p className="muted">
        {account.customer_name} · {account.account_type} · {account.status}
      </p>
      <p className="balance">{money(account.balance)}</p>
      {error && <p className="alert">{error}</p>}
      <div className="grid-2">
        <form
          className="card"
          onSubmit={(e) => {
            e.preventDefault();
            move("deposit");
          }}
        >
          <h2>Deposit / withdraw</h2>
          <label>
            Amount
            <input type="number" min="0.01" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
          </label>
          <label>
            Description
            <input value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>
          <div className="row">
            <button type="submit">Deposit</button>
            <button type="button" className="secondary" onClick={() => move("withdraw")}>
              Withdraw
            </button>
          </div>
        </form>
        <section className="card">
          <h2>Statement</h2>
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Amount</th>
                <th>Balance</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {txs.map((t) => (
                <tr key={t.id}>
                  <td>{t.type.replace("_", " ")}</td>
                  <td>{money(t.amount)}</td>
                  <td>{money(t.balance_after)}</td>
                  <td>{new Date(t.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
