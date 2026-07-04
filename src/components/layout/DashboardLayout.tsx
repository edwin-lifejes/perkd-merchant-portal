import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AppNav from "./AppNav";
import Icon from "../ui/Icon";

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { path: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { path: "/offers",    label: "My Offers",  icon: "local_offer" },
  { path: "/profile/setup", label: "Profile", icon: "manage_accounts" },
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
                  <Icon name={item.icon} size={20} filled={isActive} className="sidebar-nav-icon" />
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
