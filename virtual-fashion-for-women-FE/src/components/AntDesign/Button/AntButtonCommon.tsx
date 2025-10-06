// components/AntButtonCommon.tsx
import React from "react";
import { Button, ButtonProps } from "antd";
interface Props extends ButtonProps {
  label?: string;
  colorType?: "primary" | "secondary" | "outlined";
  children?: React.ReactNode;
}

export const AntButtonCommon: React.FC<Props> = ({
  label,
  colorType = "primary",
  children,
  className,
  style,
  ...rest
}) => {
  // Style base cho từng loại
  const baseStyle: React.CSSProperties = {
    fontSize: "1.25rem",
    fontWeight: "bold",
    border: "none",
    ...style,
  };

  const colorStyles: Record<string, React.CSSProperties> = {
    primary: {
      backgroundImage: "linear-gradient(to right, #FFAF37, #996921)",
      color: "#fff",
    },
    secondary: {
      backgroundImage: "linear-gradient(to right, #37AFFF, #216999)",
      color: "#fff",
    },
    outlined: {
      background: "transparent",
      border: "2px solid #FFAF37",
      color: "#FFAF37",
    },
  };

  return (
    <Button
      shape="round"
      className={"!py-6 mt-5 " + className}
      style={{ ...baseStyle, ...colorStyles[colorType] }}
      {...rest}
    >
      {label ? <span>{label}</span> : children}
    </Button>
  );
};
