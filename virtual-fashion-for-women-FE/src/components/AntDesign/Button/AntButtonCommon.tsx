// components/AntButtonCommon.tsx
import React from "react";
import { Button, ButtonProps } from "antd";

interface Props extends ButtonProps {
  label: string;
}

export const AntButtonCommon: React.FC<Props> = ({ label, ...rest }) => {
  return <Button {...rest}>{label}</Button>;
};
