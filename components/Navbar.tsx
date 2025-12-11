// components/Navbar.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useAtom } from "jotai";

import { roleAtom } from "@/store/roleAtom";
import { locationAtom } from "@/store/locationAtom";
import { useEffect, useState } from "react";

export default function Navbar() {
  const router = useRouter();

  const [role, setRole] = useAtom(roleAtom);
  const [, setLocation] = useAtom(locationAtom);

  const [isClient, setIsClient] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // ✅ Only run on client
  useEffect(() => {
    setIsClient(true);
    const token = Cookies.get("token");
    setIsLoggedIn(!!token);
  }, []);

  const commonLinks = [
    { href: "/", label: "Home" },
    { href: "/profile", label: "Profile" },
  ];

  const userLinks = [
    { href: "/jobs", label: "Jobs" },
    { href: "/applications", label: "My Applications" },
  ];

  const hrLinks = [
    { href: "/hr/dashboard", label: "HR Dashboard" },
    { href: "/hr/candidates", label: "Candidates" },
  ];

  const adminLinks = [
    { href: "/admin/users", label: "Manage Users" },
    { href: "/admin/settings", label: "Settings" },
  ];

  const getRoleLinks = () => {
    switch (role) {
      case "user":
        return userLinks;
      case "hr":
        return hrLinks;
      case "admin":
        return adminLinks;
      default:
        return [];
    }
  };

  const handleLogout = () => {
    Cookies.remove("token");
    setRole(null);
    setLocation(null);
    router.push("/login");
  };

  return (
    <nav className="w-full border-b border-slate-200 bg-white px-6 py-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Left */}
        <div className="flex items-center gap-8">
          <h1 className="text-lg font-semibold text-slate-900">MyApp</h1>

          <ul className="flex items-center gap-5 text-sm text-slate-600">
            {commonLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="hover:text-slate-900 transition"
                >
                  {link.label}
                </Link>
              </li>
            ))}

            {/* Role-based links only when logged in and on client */}
            {isClient &&
              isLoggedIn &&
              getRoleLinks().map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:text-slate-900 transition"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
          </ul>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4 text-sm">
          {isClient && isLoggedIn ? (
            <>
              {role && (
                <span className="text-slate-500 capitalize">{role}</span>
              )}
              <button
                onClick={handleLogout}
                className="rounded-md border border-slate-200 px-3 py-1.5 text-slate-700 hover:bg-slate-100 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-md bg-slate-900 px-4 py-1.5 text-white hover:bg-slate-800 transition"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}