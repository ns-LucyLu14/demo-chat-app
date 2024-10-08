"use client";

import Link from "next/link";
import React from "react";

type DashboardPageProps = {};

const DashboardPage = (props: DashboardPageProps) => {
  return (
    <div className="text-7xl">
      <div>Dashboard</div>
      <Link
        href={"/api/auth/signout"}
        className="border-primaryText bg-background hover:border-secondaryText hover:bg-primaryHover hover:text-secondaryText flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium transition hover:text-indigo-600"
      >
        Sign out
      </Link>
    </div>
  );
};

export default DashboardPage;
