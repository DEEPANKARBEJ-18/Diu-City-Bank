import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./AuthContext";
import Layout from "./Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Accounts from "./pages/Accounts";
import AccountDetail from "./pages/AccountDetail";
import Transfer from "./pages/Transfer";
import Transactions from "./pages/Transactions";

function Protected({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <Protected>
            <Layout />
          </Protected>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/accounts/:id" element={<AccountDetail />} />
        <Route path="/transfer" element={<Transfer />} />
        <Route path="/transactions" element={<Transactions />} />
      </Route>
    </Routes>
  );
}
