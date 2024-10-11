import React from "react";
import { IconType } from "react-icons/lib";

type ButtonProps = {
  title: string;
  onClick?: () => void;
  children?: any;
};

const Button = ({ title, onClick, children }: ButtonProps) => {
  return (
    <button
      onClick={onClick ? onClick : undefined}
      type="submit"
      className="flex items-center gap-2 rounded-md bg-secondaryBackground px-5 py-3 font-semibold text-primaryText no-underline transition hover:bg-primaryHover hover:text-secondaryText"
    >
      {title} {children}
    </button>
  );
};

export default Button;
