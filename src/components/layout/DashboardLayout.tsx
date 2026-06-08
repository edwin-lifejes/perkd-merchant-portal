import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AppNav from "./AppNav";

interface NavItem {
  path: string;
  label: string;
  emoji: string;
}

const NAV_ITEMS: NavItem[] = [
  { path: "/dashboard", label: "Dashboard", emoji: "🏠" },
  { path: "/offers", label: "My Offers", emoji: "🏷️" },
  { path: "/profile/setup", label: "Profile", emoji: "✏️" },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
  tradingName?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, tradingName }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="dashboard-shell">
      <AppNav tradingName={tradingName} />
      <div className="dashboard-body">
        <aside className="sidebar">
          <nav className="sidebar-nav">
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  className={`sidebar-nav-item${isActive ? " active" : ""}`}
                  onClick={() => navigate(item.path)}
                >
                  <span className="sidebar-nav-emoji">{item.emoji}</span>
                  <span className="sidebar-nav-label">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>
        <main className="dashboard-main">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
