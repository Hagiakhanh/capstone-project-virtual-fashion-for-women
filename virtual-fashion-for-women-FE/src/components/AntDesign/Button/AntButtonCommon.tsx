// components/AntButtonCommon.tsx
import React from "react";
import { Button, ButtonProps } from "antd";
import clsx from "clsx";

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
  disabled,
  ...rest
}) => {
  const colorClasses: Record<string, string> = {
    primary: clsx(
      // Trạng thái thường
      "!bg-gradient-to-r !from-[#FFAF37] !to-[#996921] !text-white !border-none",
      // Hover sáng hơn
      "hover:!from-[#ffc15b] hover:!to-[#b27a26]",
      // Disabled: màu nhạt, không hover, tắt pointer
      "disabled:!from-[#E0E0E0] disabled:!to-[#BDBDBD] disabled:!text-[#8d8d8d] disabled:!cursor-not-allowed disabled:!border-none"
    ),
    
    secondary: clsx(
      "!bg-gradient-to-r !from-[#37AFFF] !to-[#216999] !text-white !border-none",
      "hover:!from-[#5ec2ff] hover:!to-[#2c7cb2]",
      "disabled:!bg-gray-300 disabled:!text-gray-500 disabled:!cursor-not-allowed"
    ),
    outlined: clsx(
      "!bg-transparent !border-2 !border-[#FFAF37] !text-[#FFAF37]",
      "hover:!bg-[#FFAF37]/10",
      "disabled:!border-gray-300 disabled:!text-gray-400 disabled:!cursor-not-allowed"
    ),
  };

  return (
    <Button
      shape="round"
      disabled={disabled}
      className={clsx(
        "!py-6 !px-12 mt-5 !text-[1rem] !font-bold",
        colorClasses[colorType],
        className
      )}
      {...rest}
    >
      {label ? <span>{label}</span> : children}
    </Button>
  );
};
