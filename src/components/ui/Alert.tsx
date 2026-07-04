import React from "react";
import Icon from "./Icon";

interface AlertProps {
  type: "success" | "error" | "warning" | "info";
  message: string;
  icon?: string;
}

const TYPE_ICONS: Record<string, string> = {
  success: "check_circle",
  error:   "error",
  warning: "warning",
  info:    "info",
};

const Alert: React.FC<AlertProps> = ({ type, message, icon }) => {
  const iconName = icon ?? TYPE_ICONS[type] ?? "info";
  return (
    <div className={`alert alert-${type}`}>
      <span className="alert-icon">
        <Icon name={iconName} size={18} />
      </span>
      <span>{message}</span>
    </div>
  );
};

export default Alert;
