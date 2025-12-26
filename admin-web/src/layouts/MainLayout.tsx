import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Users", path: "/users" },
  { label: "Bookings", path: "/bookings" },
  { label: "Guides", path: "/guides" },
];

export function MainLayout() {
  const { adminName, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="main-shell">
      <aside className="sidebar">
        <div className="brand">🏙️ TOURISN Admin</div>
        <div className="nav-section">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-link${isActive ? " active" : ""}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </aside>

      <div>
        <header className="topbar">
          <input className="search" placeholder="Search anything" />
          <div className="user-chip">
            <div className="avatar">A</div>
            <div>
              <div style={{ fontWeight: 700 }}>{adminName}</div>
              <div style={{ color: "var(--muted)", fontSize: 12 }}>
                Super Admin
              </div>
            </div>
            <button className="btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
