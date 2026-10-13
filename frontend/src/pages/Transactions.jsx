import { useEffect, useState } from "react";
import api from "../api";

function money(value) {
  return Number(value || 0).toLocaleString("en-BD", { style: "currency", currency: "BDT" });
}

export default function Transactions() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/transactions")
      .then((res) => setRows(res.data))
      .catch((err) => setError(err.response?.data?.message || "Could not load transactions"));
  }, []);

  return (
    <div>
      <h1>Transactions</h1>
      {error && <p className="alert">{error}</p>}
      <section className="card">
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Customer</th>
              <th>Account</th>
              <th>Type</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => (
              <tr key={t.id}>
                <td>{new Date(t.created_at).toLocaleString()}</td>
                <td>{t.customer_name}</td>
                <td>{t.account_number}</td>
                <td>{t.type.replace("_", " ")}</td>
                <td>{money(t.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
