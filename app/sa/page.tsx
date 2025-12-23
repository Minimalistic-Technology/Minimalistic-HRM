"use client";

import Link from "next/link";

export default function SuperAdminDashboard() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Super Admin Dashboard</h1>

      <div className="grid grid-cols-2 gap-6">
        <Link href="/super-admin/companies" className="card">
          Manage Companies
        </Link>
        <Link href="/super-admin/users" className="card">
          Manage Users
        </Link>
      </div>
    </div>
  );
}
