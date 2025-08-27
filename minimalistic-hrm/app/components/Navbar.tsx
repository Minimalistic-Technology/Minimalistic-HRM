"use client"

/* eslint-disable @typescript-eslint/no-explicit-any */
import { LogOut, Navigation, UserIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { formatDate, getAuthToken } from "../functions/helperFunctions";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {


  const {logout,location,user} = useAuth()




  return (
    <nav className="dark:bg-white/40 bg-white rounded-2xl shadow-xl  p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center">
            <UserIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {user?.username }
            </h1>
            <p className="text-gray-600">
              {user && location?.city && (
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

          {user && <button
            onClick={logout}
            // disabled={loading}
            className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:bg-gray-400"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </button>}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
