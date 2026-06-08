import React from "react";
import type { OfferStatus } from "../../types";

interface BadgeProps {
  status: OfferStatus | string;
  text?: string;
}

const Badge: React.FC<BadgeProps> = ({ status, text }) => {
  const label = text ?? status.charAt(0).toUpperCase() + status.slice(1);
  return <span className={`badge badge-${status}`}>{label}</span>;
};

export default Badge;
