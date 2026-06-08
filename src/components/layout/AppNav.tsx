import React from "react";
import { useAuth } from "../../context/AuthContext";

interface AppNavProps {
  tradingName?: string;
}

const AppNav: React.FC<AppNavProps> = ({ tradingName }) => {
  const { logout } = useAuth();

  return (
    <nav className="app-nav">
      <div className="app-nav-brand">
        <span className="brand-mark">P</span>
        <span className="brand-name">Perkd</span>
      </div>
      <div className="app-nav-right">
        {tradingName && (
          <span className="app-nav-business">{tradingName}</span>
        )}
        <button className="btn btn-ghost btn-sm" onClick={logout}>
          Sign out
        </button>
      </div>
    </nav>
  );
};

export default AppNav;
