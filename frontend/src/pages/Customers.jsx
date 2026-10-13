import { useEffect, useState } from "react";
import api from "../api";

const empty = {
  full_name: "",
  email: "",
  phone: "",
  address: "",
  nid: "",
  date_of_birth: "",
};

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");

  async function load() {
    const { data } = await api.get("/customers");
    setCustomers(data);
  }

  useEffect(() => {
    load().catch((err) => setError(err.response?.data?.message || "Could not load customers"));
  }, []);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/customers", form);
      setForm(empty);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not create customer");
    }
  }

  return (
    <div>
      <h1>Customers</h1>
      {error && <p className="alert">{error}</p>}
      <div className="grid-2">
        <form className="card" onSubmit={handleSubmit}>
          <h2>Register customer</h2>
          <label>
            Full name
            <input value={form.full_name} onChange={(e) => update("full_name", e.target.value)} required />
          </label>
          <label>
            Email
            <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required />
          </label>
          <label>
            Phone
            <input value={form.phone} onChange={(e) => update("phone", e.target.value)} required />
          </label>
          <label>
            NID
            <input value={form.nid} onChange={(e) => update("nid", e.target.value)} required />
          </label>
          <label>
            Date of birth
            <input type="date" value={form.date_of_birth} onChange={(e) => update("date_of_birth", e.target.value)} required />
          </label>
          <label>
            Address
            <input value={form.address} onChange={(e) => update("address", e.target.value)} required />
          </label>
          <button type="submit">Save customer</button>
        </form>
        <section className="card">
          <h2>All customers</h2>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td>{c.full_name}</td>
                  <td>{c.email}</td>
                  <td>{c.phone}</td>
                  <td>{c.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
