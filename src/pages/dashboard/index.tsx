"use client";

import Link from "next/link";
import React from "react";

type DashboardPageProps = {};

const DashboardPage = (props: DashboardPageProps) => {
  return (
    <div className="flex flex-col items-center gap-10 px-5 py-10">
      <h1 className="text-5xl font-bold">Chat App Home Page</h1>
      <p>
        Send message to{" "}
        <span className="text-lg font-semibold text-blue-600">friend</span> or
        add a new{" "}
        <span className="text-lg font-semibold text-green-600">friend</span> to
        open a new chat!
      </p>
    </div>
  );
};

export default DashboardPage;
