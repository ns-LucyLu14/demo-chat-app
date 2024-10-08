import React from "react";

type ButtonProps = {
  title: string;
};

const Button = ({ title }: ButtonProps) => {
  return (
    <button
      type="submit"
      className="bg-secondaryBackground text-primaryText hover:bg-primaryHover hover:text-secondaryText rounded-md px-5 py-3 font-semibold no-underline transition"
    >
      {title}
    </button>
  );
};

export default Button;
