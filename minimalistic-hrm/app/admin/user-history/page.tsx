/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import {
  Users,
  Clock,
  LogIn,
  LogOut,
  Calendar,
  Filter,
  Search,
  Eye,
  BarChart3,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

interface CheckInOut {
  dateTime: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

interface Session {
  date: string;
  checkIn: CheckInOut | null;
  checkOut: CheckInOut | null;
  duration: any;
  _id: string;
}

interface HistorySession {
  checkIn: CheckInOut | null;
  checkOut: CheckInOut | null;
  _id: string;
}

interface User {
  id: string;
  email: string;
  username: string;
  isActive: boolean;
  lastCheckIn: string | null;
  lastCheckOut: string | null;
  totalCheckIns: number;
  totalCheckOuts: number;
  sessions: Session[];
  _id: string;
  role?: string; 
  isAdmin?: boolean; 
}

const UserHistoryDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showSessionHistory, setShowSessionHistory] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [history, setHistory] = useState<HistorySession[]>([]);

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/hrm";

  // Get auth token from localStorage
  const getAuthToken = (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  };

  // Function to check if user is admin
  const isUserAdmin = (user: User): boolean => {
    // Method 1: Check by role field
    if (user.role && (user.role.toLowerCase() === 'admin' || user.role.toLowerCase() === 'administrator')) {
      return true;
    }
    
    // Method 2: Check by isAdmin boolean field
    if (user.isAdmin === true) {
      return true;
    }
    
    // Method 3: Check by email domain or specific emails
    const adminEmails = ['admin@company.com', 'administrator@company.com']; // Add your admin emails
    if (adminEmails.includes(user.email.toLowerCase())) {
      return true;
    }
    
    // Method 4: Check by username patterns
    const adminUsernames = ['admin', 'administrator', 'root', 'superuser']; // Add your admin usernames
    if (adminUsernames.includes(user.username.toLowerCase())) {
      return true;
    }
    
    return false;
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const fetchAllUsers = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
        setError(null);
      } else {
        setRefreshing(true);
      }

      const token = getAuthToken();
      if (!token) {
        setError("No authentication token found. Please log in.");
        return;
      }

      // First, fetch all users from the access-control endpoint
      console.log("Fetching all users from access-control endpoint...");
      const usersResponse = await fetch(
        `${API_BASE_URL}/access-control/users`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!usersResponse.ok) {
        if (usersResponse.status === 401) {
          setError("Session expired. Please log in again.");
          localStorage.removeItem("token");
          return;
        }
        throw new Error(`Failed to fetch users: ${usersResponse.statusText}`);
      }

      const usersData = await usersResponse.json();
      
      // Filter out admin users
      const regularUsers = usersData.filter((user: User) => !isUserAdmin(user));
      
      // Process users to get their last check-in/out times from sessions
      const processedUsers = regularUsers.map((user: User) => {
        const lastCheckInTime = getLastCheckInTime(user);
        const lastCheckOutTime = getLastCheckOutTime(user);
        
        return {
          ...user,
          lastCheckIn: lastCheckInTime,
          lastCheckOut: lastCheckOutTime,
        };
      });

      setUsers(processedUsers);
      console.log("users data received (admins filtered out):", processedUsers);
      console.log(`Total users fetched: ${usersData.length}, users: ${processedUsers.length}`);
    } catch (error) {
      console.error("Fetch error:", error);
      if (!silent) {
        setError(
          `Failed to load data: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Helper function to get the last check-in time from sessions
  const getLastCheckInTime = (user: User): string | null => {
    if (!user.sessions || user.sessions.length === 0) {
      return user.lastCheckIn || null;
    }

    // Sort sessions by date descending and get the most recent check-in
    const sortedSessions = [...user.sessions].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    for (const session of sortedSessions) {
      if (session.checkIn && session.checkIn.dateTime) {
        return session.checkIn.dateTime;
      }
    }

    return user.lastCheckIn || null;
  };

  // Helper function to get the last check-out time from sessions
  const getLastCheckOutTime = (user: User): string | null => {
    if (!user.sessions || user.sessions.length === 0) {
      return user.lastCheckOut || null;
    }

    // Sort sessions by date descending and get the most recent check-out
    const sortedSessions = [...user.sessions].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    for (const session of sortedSessions) {
      if (session.checkOut && session.checkOut.dateTime) {
        return session.checkOut.dateTime;
      }
    }

    return user.lastCheckOut || null;
  };

  // Function to fetch specific user history by userId
  const fetchUserHistoryById = async (userId: string): Promise<User | null> => {
    try {
      const token = getAuthToken();
      if (!token) {
        return null;
      }

      console.log(`Fetching user history for userId: ${userId}`);

      const response = await fetch(
        `${API_BASE_URL}/userHistoryByUserId/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        console.error(
          `Failed to fetch history for user ${userId}:`,
          response.statusText
        );
        return null;
      }

      const userData = await response.json();
      const userHistory = userData[0]?.history || [];
      setHistory(userHistory);
      console.log(`User history data for ${userId}:`, userData);

      return null;
    } catch (error) {
      console.error(`Fetch user history error for ${userId}:`, error);
      setHistory([]); // Set empty array on error
      return null;
    }
  };

  // Calculate total check-ins from history
  const calculateTotalCheckIns = (historyData: HistorySession[]): number => {
    return historyData.filter(session => session.checkIn !== null).length;
  };

  // Calculate total check-outs from history
  const calculateTotalCheckOuts = (historyData: HistorySession[]): number => {
    return historyData.filter(session => session.checkOut !== null).length;
  };

  // Calculate today's sessions from history
  const calculateTodaysSessions = (historyData: HistorySession[]): number => {
    const today = new Date();
    const todayDateString = today.toDateString();
    
    return historyData.filter(session => {
      if (session.checkIn) {
        const sessionDate = new Date(session.checkIn.dateTime);
        return sessionDate.toDateString() === todayDateString;
      }
      return false;
    }).length;
  };

  // Get current status based on latest session
  const getCurrentStatus = (historyData: HistorySession[]): string => {
    if (!historyData || historyData.length === 0) return "inactive";
    
    // Sort sessions by check-in time (most recent first)
    const sortedSessions = [...historyData]
      .filter(session => session.checkIn)
      .sort((a, b) => {
        const timeA = new Date(a.checkIn!.dateTime).getTime();
        const timeB = new Date(b.checkIn!.dateTime).getTime();
        return timeB - timeA;
      });

    if (sortedSessions.length === 0) return "inactive";

    const latestSession = sortedSessions[0];
    return latestSession.checkOut === null ? "active" : "offline";
  };

  const calculateDuration = (checkIn: string, checkOut: string): string => {
    try {
      const inTime = new Date(checkIn);
      const outTime = new Date(checkOut);
      const diffMs = outTime.getTime() - inTime.getTime();

      if (diffMs < 0) return "0h 0m";

      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        return `${days}d ${hours}h ${minutes}m`;
      } else {
        return `${hours}h ${minutes}m`;
      }
    } catch (error) {
      console.error("Error calculating duration:", error);
      return "Invalid";
    }
  };

  const formatTime = (dateTimeString: string): string => {
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleTimeString("en-IN", {
        hour12: true,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZone: "Asia/Kolkata",
      });
    } catch (error) {
      console.error("Error formatting time:", error);
      return "Invalid Time";
    }
  };

  const formatDateTime = (dateTime: string): string => {
    try {
      if (!dateTime) return "N/A";

      const date = new Date(dateTime);
      return date.toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
    } catch (error) {
      console.error("Error formatting datetime:", error);
      return "Invalid Date";
    }
  };

  // Enhanced function to get relative time
  const getRelativeTime = (dateTime: string): string => {
    try {
      const date = new Date(dateTime);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      
      const minutes = Math.floor(diffMs / (1000 * 60));
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (minutes < 60) {
        return `${minutes} min ago`;
      } else if (hours < 24) {
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
      } else if (days < 7) {
        return `${days} day${days > 1 ? 's' : ''} ago`;
      } else {
        return formatDateTime(dateTime);
      }
    } catch (error) {
      return formatDateTime(dateTime);
    }
  };

  const getTodaysSessions = (sessions: Session[]): Session[] => {
    const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD format
    return sessions?.filter((session) => session.date === today) || [];
  };

  const getUsersWithRecentActivity = (users: User[]): User[] => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    return users.filter((user) => {
      if (!user.lastCheckIn) return false;
      const lastActivity = new Date(user.lastCheckIn);
      return lastActivity >= threeDaysAgo;
    });
  };

  // Filter users based on search term
  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user._id.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const handleViewSessions = async (user: User): Promise<void> => {
    setLoading(true);
    await fetchUserHistoryById(user._id);
    setSelectedUser(user);
    setShowSessionHistory(true);
    setLoading(false);
  };

  const handleRefresh = () => {
    fetchAllUsers(true);
  };

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading user data...</p>
          <p className="mt-2 text-sm text-gray-500">
            Fetching users and their histories...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6 flex items-center"
            role="alert"
          >
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <span className="block sm:inline flex-grow">{error}</span>
            <button
              className="absolute top-0 bottom-0 right-0 px-4 py-3 hover:bg-red-200 rounded-r-lg transition-colors"
              onClick={() => setError(null)}
            >
              <span className="sr-only">Dismiss</span>✕
            </button>
          </div>
        )}

        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              User History Dashboard
            </h1>
            <p className="text-gray-600">
              Monitor user activity, check-ins, and session history 
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              Last updated:{" "}
              {new Date().toLocaleTimeString("en-IN", {
                timeZone: "Asia/Kolkata",
              })}
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Card - Only Users */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.length}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or user ID..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSearchTerm(e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              User Activity ({filteredUsers?.length} users)
            </h2>
            {refreshing && (
              <div className="flex items-center text-sm text-gray-500">
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Refreshing...
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers?.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      <Users className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                      <p className="text-lg font-medium text-gray-400">
                        No users found
                      </p>
                      <p className="text-sm text-gray-400">
                        {users?.length === 0
                          ? "No users available in the system"
                          : "No users match your current filters"}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user: User) => {
                    return (
                      <tr
                        key={user._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                          <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                            {user._id?.substring(0, 8)}...
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {user.username}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => {
                              handleViewSessions(user);
                            }}
                            className="text-blue-600 hover:text-blue-900 flex items-center transition-colors hover:bg-blue-50 px-2 py-1 rounded"
                            disabled={loading}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View History
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Session History Modal */}
        {showSessionHistory && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[85vh] overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Session History - {selectedUser?.username}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    ID:{" "}
                    <span className="font-mono bg-gray-200 px-1 rounded">
                      {selectedUser?._id}
                    </span>{" "}
                    | {selectedUser?.email}
                  </p>
                </div>
                <button
                  onClick={() => setShowSessionHistory(false)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 p-2 rounded-full transition-colors"
                >
                  <span className="sr-only">Close</span>
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[70vh]">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center">
                      <BarChart3 className="h-6 w-6 text-blue-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-blue-600">
                          Total Check-ins
                        </p>
                        <p className="text-2xl font-bold text-blue-900">
                          {calculateTotalCheckIns(history)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <div className="flex items-center">
                      <BarChart3 className="h-6 w-6 text-red-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-red-600">
                          Total Check-outs
                        </p>
                        <p className="text-2xl font-bold text-red-900">
                          {calculateTotalCheckOuts(history)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center">
                      <Clock className="h-6 w-6 text-green-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-green-600">
                          Current Status
                        </p>
                        <p className="text-xl font-bold text-green-900 capitalize">
                          {getCurrentStatus(history)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <div className="flex items-center">
                      <Calendar className="h-6 w-6 text-purple-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-purple-600">
                          Today&apos;s Sessions
                        </p>
                        <p className="text-2xl font-bold text-purple-900">
                          {calculateTodaysSessions(history)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                               
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Check-in
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Check-out
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Duration
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {history?.length === 0 ? (
                        <tr>
                          <td
                            colSpan={3}
                            className="px-6 py-4 text-center text-gray-500"
                          >
                            No history available
                          </td>
                        </tr>
                      ) : (
                        history &&
                        history
                          .sort((a, b) => {
                            // Sort by check-in time (most recent first)
                            const timeA = a.checkIn ? new Date(a.checkIn.dateTime).getTime() : 0;
                            const timeB = b.checkIn ? new Date(b.checkIn.dateTime).getTime() : 0;
                            return timeB - timeA;
                          })
                          .map((session: HistorySession, index: number) => {
                            const sessionDuration = session.checkIn && session.checkOut 
                              ? calculateDuration(session.checkIn.dateTime, session.checkOut.dateTime)
                              : "In progress";
                            
                            return (
                              <tr key={session._id || index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {session.checkIn ? (
                                    <span className="inline-flex items-center px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                      <LogIn className="w-3 h-3 mr-1" />
                                      {formatDateTime(session.checkIn.dateTime)}
                                    </span>
                                  ) : (
                                    <span className="text-gray-400">No check-in</span>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {session.checkOut ? (
                                    <span className="inline-flex items-center px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                                      <LogOut className="w-3 h-3 mr-1" />
                                      {formatDateTime(session.checkOut.dateTime)}
                                    </span>
                                  ) : (
                                     <span className="inline-flex items-center px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                                      <Clock className="w-3 h-3 mr-1" />
                                      Still active
                                 </span>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  <span className="font-semibold text-blue-600">
                                    {sessionDuration}
                                  </span>
                                </td>
                              </tr>
                            );
                          })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserHistoryDashboard;