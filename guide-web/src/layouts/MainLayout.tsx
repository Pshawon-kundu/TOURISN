import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "My Bookings", path: "/bookings" },
  { label: "Messages", path: "/chat" },
  { label: "Profile", path: "/profile" },
];

export function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const name = user?.first_name
    ? `${user.first_name} ${user.last_name || ""}`
    : "Guide";

  return (
    <div className="main-shell">
      <aside className="sidebar">
        <div className="brand">🎒 TOURISN Guide</div>
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
          <input className="search" placeholder="Search bookings..." />
          <div className="user-chip">
            <div className="avatar">{name[0]}</div>
            <div>
              <div style={{ fontWeight: 700 }}>{name}</div>
              <div style={{ color: "var(--muted)", fontSize: 12 }}>
                Verified Guide
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
