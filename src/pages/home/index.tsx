"use client";

import Link from "next/link";
import React from "react";

type Props = {};

const Home = (props: Props) => {
  return (
    <div className="text-7xl text-red-500">
      <div>Home</div>
      <Link
        href={"/api/auth/signout"}
        className="border-primaryText bg-background hover:border-secondaryText hover:bg-primaryHover hover:text-secondaryText flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium transition hover:text-indigo-600"
      >
        {/* <TbLogout className="h-5 w-5" /> */}
        Sign out
      </Link>
    </div>
  );
};

export default Home;
