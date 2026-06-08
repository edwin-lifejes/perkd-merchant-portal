import React from "react";

interface AlertProps {
  type: "success" | "error" | "warning" | "info";
  message: string;
  icon?: string;
}

const ICONS: Record<string, string> = {
  success: "✅",
  error: "❌",
  warning: "⚠️",
  info: "ℹ️",
};

const Alert: React.FC<AlertProps> = ({ type, message, icon }) => {
  const emoji = icon ?? ICONS[type] ?? "";
  return (
    <div className={`alert alert-${type}`}>
      {emoji && <span className="alert-icon">{emoji}</span>}
      <span>{message}</span>
    </div>
  );
};

export default Alert;
