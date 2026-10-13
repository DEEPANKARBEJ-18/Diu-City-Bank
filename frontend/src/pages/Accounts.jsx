import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

function money(value) {
  return Number(value || 0).toLocaleString("en-BD", { style: "currency", currency: "BDT" });
}

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({ customer_id: "", account_type: "savings", opening_balance: "0" });
  const [error, setError] = useState("");

  async function load() {
    const [acc, cust] = await Promise.all([api.get("/accounts"), api.get("/customers")]);
    setAccounts(acc.data);
    setCustomers(cust.data);
    if (!form.customer_id && cust.data[0]) {
      setForm((prev) => ({ ...prev, customer_id: String(cust.data[0].id) }));
    }
  }

  useEffect(() => {
    load().catch((err) => setError(err.response?.data?.message || "Could not load accounts"));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/accounts", {
        ...form,
        customer_id: Number(form.customer_id),
        opening_balance: Number(form.opening_balance),
      });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not open account");
    }
  }

  return (
    <div>
      <h1>Accounts</h1>
      {error && <p className="alert">{error}</p>}
      <div className="grid-2">
        <form className="card" onSubmit={handleSubmit}>
          <h2>Open account</h2>
          <label>
            Customer
            <select value={form.customer_id} onChange={(e) => setForm({ ...form, customer_id: e.target.value })} required>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Type
            <select value={form.account_type} onChange={(e) => setForm({ ...form, account_type: e.target.value })}>
              <option value="savings">Savings</option>
              <option value="current">Current</option>
            </select>
          </label>
          <label>
            Opening balance
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.opening_balance}
              onChange={(e) => setForm({ ...form, opening_balance: e.target.value })}
            />
          </label>
          <button type="submit">Open account</button>
        </form>
        <section className="card">
          <h2>All accounts</h2>
          <table>
            <thead>
              <tr>
                <th>Number</th>
                <th>Customer</th>
                <th>Type</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((a) => (
                <tr key={a.id}>
                  <td>
                    <Link to={`/accounts/${a.id}`}>{a.account_number}</Link>
                  </td>
                  <td>{a.customer_name}</td>
                  <td>{a.account_type}</td>
                  <td>{money(a.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
