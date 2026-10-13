import { useEffect, useState } from "react";
import api from "../api";

function money(value) {
  return Number(value || 0).toLocaleString("en-BD", { style: "currency", currency: "BDT" });
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/dashboard/stats")
      .then((res) => setStats(res.data))
      .catch((err) => setError(err.response?.data?.message || "Could not load dashboard"));
  }, []);

  if (error) return <p className="alert">{error}</p>;
  if (!stats) return <p>Loading dashboard...</p>;

  return (
    <div>
      <h1>Dashboard</h1>
      <p className="muted">Overview of Diu City Bank operations.</p>
      <div className="stats">
        <article className="card stat">
          <span>Customers</span>
          <strong>{stats.customers}</strong>
        </article>
        <article className="card stat">
          <span>Active accounts</span>
          <strong>{stats.accounts}</strong>
        </article>
        <article className="card stat">
          <span>Total deposits</span>
          <strong>{money(stats.totalDeposits)}</strong>
        </article>
        <article className="card stat">
          <span>Today's transactions</span>
          <strong>{stats.todayTransactions}</strong>
        </article>
      </div>
      <section className="card">
        <h2>Recent activity</h2>
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Account</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {stats.recent.map((row) => (
              <tr key={row.id}>
                <td>{row.customer_name}</td>
                <td>{row.account_number}</td>
                <td className="type">{row.type.replace("_", " ")}</td>
                <td>{money(row.amount)}</td>
                <td>{new Date(row.created_at).toLocaleString()}</td>
              </tr>
            ))}
            {stats.recent.length === 0 && (
              <tr>
                <td colSpan={5}>No transactions yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
