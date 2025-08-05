
"use client";
import React, { useState, useEffect } from "react";
import { Users, Clock, LogIn, LogOut, Calendar, Filter, Search, Eye, BarChart3 } from "lucide-react";

interface Session {
  date: string;
  checkIn: string;
  checkOut: string | null;
  duration: string | null;
  _id: string;
}

interface User {
  id: string;
  email: string;
  fullName: string;
  isActive: boolean;
  lastCheckIn: string;
  lastCheckOut: string | null;
  totalCheckIns: number;
  totalCheckOuts: number;
  sessions: Session[];
  _id: string;
}

const UserHistoryDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showSessionHistory, setShowSessionHistory] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No authentication token found. Please log in.");
          return;
        }
        console.log("Fetching from: http://localhost:5000/api/checksession/history with token:", token.substring(0, 5) + "...");
        const response = await fetch("http://localhost:5000/api/checksession/history", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          const errorText = await response.text();
          console.error("API Response:", {
            status: response.status,
            statusText: response.statusText,
            body: errorText,
          });
          setError(`Failed to fetch data: ${response.statusText} - ${errorText}`);
          return;
        }
        const histories = await response.json();
        console.log("Fetched Histories:", histories);
        const userMap = new Map();
        histories.forEach((history: any) => {
          if (!userMap.has(history.userId)) {
            userMap.set(history.userId, {
              id: history.userId,
              _id: history._id,
              email: `user${history.userId}@example.com`,
              fullName: `User ${history.userId}`,
              isActive: history.history.some((h: any) => !h.checkOut),
              lastCheckIn: history.history[0]?.checkIn || "",
              lastCheckOut: history.history[0]?.checkOut || null,
              totalCheckIns: history.history.length,
              totalCheckOuts: history.history.filter((h: any) => h.checkOut).length,
              sessions: [],
            });
          }
          const user = userMap.get(history.userId);
          user.sessions = history.history.map((h: any) => ({
            _id: h._id,
            date: new Date(h.checkIn).toISOString().split("T")[0],
            checkIn: new Date(h.checkIn).toLocaleTimeString(),
            checkOut: h.checkOut ? new Date(h.checkOut).toLocaleTimeString() : null,
            duration: h.checkOut ? calculateDuration(h.checkIn, h.checkOut) : null,
          }));
        });
        setUsers(Array.from(userMap.values()));
        setError(null);
      } catch (error) {
        console.error("Fetch error:", error);
        setError("Failed to load data. Please try again.");
      }
    };
    fetchUsers();
  }, []);

  const fetchUserSessions = async (userId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found. Please log in.");
        return null;
      }
      console.log(`Fetching user sessions from: http://localhost:5000/api/checksession/history/${userId} with token:`, token.substring(0, 5) + "...");
      const response = await fetch(`http://localhost:5000/api/checksession/history/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Response for user sessions:", {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
        });
        setError(`Failed to fetch user sessions: ${response.statusText} - ${errorText}`);
        return null;
      }
      const history = await response.json();
      return {
        id: history.userId,
        _id: history._id,
        email: `user${history.userId}@example.com`,
        fullName: `User ${history.userId}`,
        isActive: history.history.some((h: any) => !h.checkOut),
        lastCheckIn: history.history[0]?.checkIn || "",
        lastCheckOut: history.history[0]?.checkOut || null,
        totalCheckIns: history.history.length,
        totalCheckOuts: history.history.filter((h: any) => h.checkOut).length,
        sessions: history.history.map((h: any) => ({
          _id: h._id,
          date: new Date(h.checkIn).toISOString().split("T")[0],
          checkIn: new Date(h.checkIn).toLocaleTimeString(),
          checkOut: h.checkOut ? new Date(h.checkOut).toLocaleTimeString() : null,
          duration: h.checkOut ? calculateDuration(h.checkIn, h.checkOut) : null,
        })),
      };
    } catch (error) {
      console.error("Fetch user sessions error:", error);
      setError("Failed to load user sessions due to a server error. Please contact support.");
      return null;
    }
  };

  const calculateDuration = (checkIn: string, checkOut: string): string => {
    const inTime = new Date(checkIn);
    const outTime = new Date(checkOut);
    const diffMs = outTime.getTime() - inTime.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const filteredUsers: User[] = users.filter((user: User) => {
    const matchesSearch =
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && user.isActive) ||
      (statusFilter === "inactive" && !user.isActive);
    return matchesSearch && matchesStatus;
  });

  const totalActiveUsers: number = users.filter((user: User) => user.isActive).length;
  const totalCheckIns: number = users.reduce((sum: number, user: User) => sum + user.totalCheckIns, 0);
  const totalCheckOuts: number = users.reduce((sum: number, user: User) => sum + user.totalCheckOuts, 0);

  const formatDateTime = (dateTime: string): string => {
    const date = new Date(dateTime);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds}`;
  };

  const handleViewSessions = async (user: User): Promise<void> => {
    const detailedUser = await fetchUserSessions(user.id);
    setSelectedUser(detailedUser || null);
    if (!detailedUser) {
      setShowSessionHistory(false);
    } else {
      setShowSessionHistory(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User History Dashboard</h1>
          <p className="text-gray-600">Monitor user activity, check-ins, and session history</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Now</p>
                <p className="text-2xl font-bold text-gray-900">{totalActiveUsers}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <LogIn className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Check-ins</p>
                <p className="text-2xl font-bold text-gray-900">{totalCheckIns}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <LogOut className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Check-outs</p>
                <p className="text-2xl font-bold text-gray-900">{totalCheckOuts}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or user ID..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={statusFilter}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">User Activity</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Check-in</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Check-out</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Sessions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user: User) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">{user.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                          user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full mr-1 ${
                            user.isActive ? "bg-green-500" : "bg-red-500"
                          }`}
                        ></div>
                        {user.isActive ? "Active" : "Offline"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDateTime(user.lastCheckIn)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.lastCheckOut ? formatDateTime(user.lastCheckOut) : "Still active"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center space-x-4">
                        <span className="text-green-600">In: {user.totalCheckIns}</span>
                        <span className="text-red-600">Out: {user.totalCheckOuts}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewSessions(user)}
                        className="text-blue-600 hover:text-blue-900 flex items-center"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View History
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Session History Modal */}
        {showSessionHistory && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Session History for {selectedUser.fullName} (ID: {selectedUser.id})</h3>
                  <p className="text-sm text-gray-600">{selectedUser.email}</p>
                </div>
                <button
                  onClick={() => setShowSessionHistory(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  ✕
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <BarChart3 className="h-6 w-6 text-blue-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-blue-600">Total Check-ins</p>
                        <p className="text-xl font-bold text-blue-900">{selectedUser.totalCheckIns}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-red-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <BarChart3 className="h-6 w-6 text-red-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-red-600">Total Check-outs</p>
                        <p className="text-xl font-bold text-red-900">{selectedUser.totalCheckOuts}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <Clock className="h-6 w-6 text-green-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-green-600">Current Status</p>
                        <p className="text-xl font-bold text-green-900">
                          {selectedUser.isActive ? "Active" : "Offline"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-in</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-out</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedUser.sessions.map((session: Session, index: number) => (
                        <tr key={session._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {session.date}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className="inline-flex items-center px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                              <LogIn className="w-3 h-3 mr-1" />
                              {session.checkIn}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {session.checkOut ? (
                              <span className="inline-flex items-center px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                                <LogOut className="w-3 h-3 mr-1" />
                                {session.checkOut}
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                                <Clock className="w-3 h-3 mr-1" />
                                Still active
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {session.duration || "In progress"}
                          </td>
                        </tr>
                      ))}
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