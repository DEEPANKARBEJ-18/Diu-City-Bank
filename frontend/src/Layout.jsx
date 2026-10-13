import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const links = [
  { to: "/", label: "Dashboard" },
  { to: "/customers", label: "Customers" },
  { to: "/accounts", label: "Accounts" },
  { to: "/transfer", label: "Transfer" },
  { to: "/transactions", label: "Transactions" },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">DCB</span>
          <div>
            <strong>Diu City Bank</strong>
            <p>Staff portal</p>
          </div>
        </div>
        <nav>
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.to === "/"}>
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="main">
        <header className="topbar">
          <span>{user?.name}</span>
          <span className="role">{user?.role}</span>
          <button type="button" className="ghost" onClick={handleLogout}>
            Sign out
          </button>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
