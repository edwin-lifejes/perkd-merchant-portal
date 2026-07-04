import React from "react";

interface IconProps {
  name: string;
  size?: number;
  filled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const Icon: React.FC<IconProps> = ({ name, size = 24, filled = false, className = "", style }) => (
  <span
    className={`material-symbols-outlined${className ? ` ${className}` : ""}`}
    style={{
      fontSize: size,
      fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' ${size}`,
      lineHeight: 1,
      display: "inline-flex",
      alignItems: "center",
      userSelect: "none",
      ...style,
    }}
  >
    {name}
  </span>
);

export default Icon;
