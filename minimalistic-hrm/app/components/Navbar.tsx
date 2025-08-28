"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */
import { LogOut, Navigation, UserIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { formatDate, getAuthToken } from "../functions/helperFunctions";
import { useAuth } from "../context/AuthContext";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import { usePathname, useRouter } from "next/navigation";
import { setLocation, setUser } from "../store/authSlice";

const Navbar = () => {
  const router = useRouter()
  const pathname = usePathname()
  const dispatch = useDispatch()
  const {location, user} = useSelector((store: RootState) => store.auth)
  
  const logout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("token");
    // localStorage.removeItem("location");
    dispatch(setUser({user: {}, token: ""}))
    dispatch(setLocation({}))
    router.replace("/login");
  }

  return (
    <nav className="dark:bg-white/40 bg-white rounded-2xl shadow-xl p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Only show user icon when NOT on login page */}
          {(pathname !== "/login") && !(pathname === "/") && user && (
            <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-white" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {user?.username}
            </h1>
            <p className="text-gray-600">
              {!(pathname === "/login") && user && location?.city && (
                <span className="flex items-center">
                  <Navigation className="w-4 h-4 mr-1 text-blue-500" />
                  {location?.city}
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="text-right space-y-2">
          <p className="text-sm text-gray-500">Today</p>
          <p className="text-lg font-semibold text-gray-900">
            {formatDate(new Date())}
          </p>
          {!(pathname === "/login") && !(pathname === "/") && user && (
            <button
              onClick={logout}
              // disabled={loading}
              className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:bg-gray-400"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;