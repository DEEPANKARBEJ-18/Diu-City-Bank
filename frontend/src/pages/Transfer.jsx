import { useEffect, useState } from "react";
import api from "../api";

export default function Transfer() {
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState({ from_account_id: "", to_account_number: "", amount: "", description: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/accounts")
      .then((res) => {
        setAccounts(res.data);
        if (res.data[0]) setForm((prev) => ({ ...prev, from_account_id: String(res.data[0].id) }));
      })
      .catch((err) => setError(err.response?.data?.message || "Could not load accounts"));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      const { data } = await api.post("/transactions/transfer", {
        ...form,
        from_account_id: Number(form.from_account_id),
        amount: Number(form.amount),
      });
      setMessage(`Transfer complete. Destination ${data.to_account_number} now has ${data.to_balance} BDT.`);
      setForm((prev) => ({ ...prev, amount: "", description: "", to_account_number: "" }));
    } catch (err) {
      setError(err.response?.data?.message || "Transfer failed");
    }
  }

  return (
    <div>
      <h1>Fund transfer</h1>
      {error && <p className="alert">{error}</p>}
      {message && <p className="success">{message}</p>}
      <form className="card narrow" onSubmit={handleSubmit}>
        <label>
          From account
          <select
            value={form.from_account_id}
            onChange={(e) => setForm({ ...form, from_account_id: e.target.value })}
            required
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.account_number} — {a.customer_name} ({a.balance})
              </option>
            ))}
          </select>
        </label>
        <label>
          To account number
          <input
            value={form.to_account_number}
            onChange={(e) => setForm({ ...form, to_account_number: e.target.value })}
            placeholder="DCB10000002"
            required
          />
        </label>
        <label>
          Amount
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            required
          />
        </label>
        <label>
          Description
          <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </label>
        <button type="submit">Send transfer</button>
      </form>
    </div>
  );
}
