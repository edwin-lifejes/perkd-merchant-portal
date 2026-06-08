import React from "react";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
}

const Spinner: React.FC<SpinnerProps> = ({ size = "md" }) => {
  return <span className={`spinner spinner-${size}`} aria-label="Loading" />;
};

export default Spinner;
