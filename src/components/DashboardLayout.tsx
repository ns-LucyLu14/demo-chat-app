import React from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div style={{ padding: "20px", backgroundColor: "#f5f5f5" }}>
      <h1>Dashboard Layout</h1>
      <nav>
        <a href="/dashboard">Home</a> |<a href="/dashboard/add">Add</a> |
        <a href="/dashboard/chat/123">Chat 123</a>
      </nav>
      <hr />
      <main>{children}</main>
    </div>
  );
};

export default DashboardLayout;
