"use client";

import Sidebar from "@/app/components/Sidebar";

export default function MessagesPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-4">
        <h1 className="text-2xl font-semibold">Messages</h1>
        <p>Welcome to your messages page.</p>
      </div>
    </div>
  );
}

