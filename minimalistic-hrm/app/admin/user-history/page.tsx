

"use client";
import React, { useState, useEffect } from "react";
import { Users, Clock, LogIn, LogOut, Calendar, Filter, Search, Eye, BarChart3, RefreshCw, AlertCircle } from "lucide-react";

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
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showSessionHistory, setShowSessionHistory] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/checksession";

  // Get auth token from localStorage
  const getAuthToken = (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  };

  

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (silent = false) => {
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
      
      // First, try to get all sessions to build user data
      console.log("Fetching from sessions endpoint...");
      const sessionsResponse = await fetch(`${API_BASE_URL}/session`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json();
        console.log("Sessions data:", sessionsData);
        
        if (Array.isArray(sessionsData) && sessionsData.length > 0) {
          const processedUsers = processSessionData(sessionsData);
          console.log("Processed Users from sessions:", processedUsers);
          setUsers(processedUsers);
          setError(null);
          return;
        }
      }
      
      // Fallback to history endpoint if sessions doesn't work
      console.log("Falling back to history endpoint...");
      const historyResponse = await fetch(`${API_BASE_URL}/history`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      if (!historyResponse.ok) {
        if (historyResponse.status === 401) {
          setError("Session expired. Please log in again.");
          localStorage.removeItem("token");
          return;
        }
        
        const errorText = await historyResponse.text();
        console.error("API Response Error:", {
          status: historyResponse.status,
          statusText: historyResponse.statusText,
          body: errorText,
        });
        setError(`Failed to fetch data: ${historyResponse.status} - ${historyResponse.statusText}`);
        return;
      }
      
      const historyData = await historyResponse.json();
      console.log("History data:", historyData);
      
      const processedUsers = processHistoryData(historyData);
      console.log("Processed Users from history:", processedUsers);
      
      setUsers(processedUsers);
      setError(null);
    } catch (error) {
      console.error("Fetch error:", error);
      if (!silent) {
        setError("Failed to load data. Please check your connection and try again.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Process session data (from /session endpoint)
  const processSessionData = (sessionsData: any[]): User[] => {
    console.log("Processing session data:", sessionsData);
    
    const userMap = new Map<string, User>();
    
    sessionsData.forEach((session: any) => {
      const userId = session.userId;
      if (!userId) return;
      
      if (!userMap.has(userId)) {
        userMap.set(userId, {
          id: userId,
          _id: userId,
          email: `user${userId.substring(0, 6)}@example.com`,
          fullName: `User ${userId.substring(0, 6)}`,
          isActive: false,
          lastCheckIn: "",
          lastCheckOut: null,
          totalCheckIns: 0,
          totalCheckOuts: 0,
          sessions: [],
        });
      }
      
      const user = userMap.get(userId)!;
      
      // Create session entry
      const sessionEntry: Session = {
        _id: session._id,
        date: new Date(session.checkIn).toISOString().split("T")[0],
        checkIn: formatTime(session.checkIn),
        checkOut: session.checkOut ? formatTime(session.checkOut) : null,
        duration: session.checkOut ? calculateDuration(session.checkIn, session.checkOut) : null,
      };
      
      user.sessions.push(sessionEntry);
      user.totalCheckIns++;
      if (session.checkOut) {
        user.totalCheckOuts++;
      }
      
      // Update last check-in/out
      const checkInTime = new Date(session.checkIn);
      const lastCheckInTime = user.lastCheckIn ? new Date(user.lastCheckIn) : new Date(0);
      
      if (checkInTime > lastCheckInTime) {
        user.lastCheckIn = session.checkIn;
        user.lastCheckOut = session.checkOut;
        user.isActive = !session.checkOut; // User is active if no checkout
      }
    });
    
    // Sort sessions for each user by date (newest first)
    userMap.forEach(user => {
      user.sessions.sort((a, b) => new Date(b.date + " " + b.checkIn).getTime() - new Date(a.date + " " + a.checkIn).getTime());
    });
    
    return Array.from(userMap.values());
  };

  // Process history data (from /history endpoint) - keep existing logic
  const processHistoryData = (apiData: any): User[] => {
    console.log("Processing history data:", apiData);
    
    let histories = [];
    if (Array.isArray(apiData)) {
      histories = apiData;
    } else if (apiData.data && Array.isArray(apiData.data)) {
      histories = apiData.data;
    } else if (apiData.users && Array.isArray(apiData.users)) {
      histories = apiData.users;
    } else {
      console.error("Unexpected API response structure:", apiData);
      return [];
    }

    const userMap = new Map<string, User>();
    
    histories.forEach((history: any) => {
      console.log("Processing history item:", history);
      
      const userId = history.userId || history.id || history._id;
      if (!userId) {
        console.warn("No userId found in history item:", history);
        return;
      }
      
      // Get the history array - it might be nested differently
      const sessionHistory = history.history || history.sessions || [];
      
      // Sort sessions by checkIn time (most recent first)
      const sortedSessions = sessionHistory
        .filter((session: any) => session.checkIn || session.checkInTime)
        .sort((a: any, b: any) => {
          const aTime = new Date(a.checkIn || a.checkInTime).getTime();
          const bTime = new Date(b.checkIn || b.checkInTime).getTime();
          return bTime - aTime;
        });
      
      const latestSession = sortedSessions[0];
      
      // Improved active status logic
      const isActive = latestSession && !(latestSession.checkOut || latestSession.checkOutTime);
      
      const user: User = {
        id: userId,
        _id: history._id || userId,
        email: history.email || `user${userId.substring(0, 6)}@example.com`,
        fullName: history.fullName || history.name || `User ${userId.substring(0, 6)}`,
        isActive: isActive || false,
        lastCheckIn: latestSession ? (latestSession.checkIn || latestSession.checkInTime) : "",
        lastCheckOut: latestSession ? (latestSession.checkOut || latestSession.checkOutTime) : null,
        totalCheckIns: sortedSessions.length,
        totalCheckOuts: sortedSessions.filter((s: any) => s.checkOut || s.checkOutTime).length,
        sessions: sortedSessions.map((s: any) => {
          const checkInTime = s.checkIn || s.checkInTime;
          const checkOutTime = s.checkOut || s.checkOutTime;
          
          return {
            _id: s._id || `${userId}-${Date.now()}-${Math.random()}`,
            date: new Date(checkInTime).toISOString().split("T")[0],
            checkIn: formatTime(checkInTime),
            checkOut: checkOutTime ? formatTime(checkOutTime) : null,
            duration: checkOutTime ? calculateDuration(checkInTime, checkOutTime) : null,
          };
        }),
      };
      
      userMap.set(userId, user);
    });
    
    return Array.from(userMap.values());
  };

  const fetchUserSessions = async (userId: string) => {
    try {
      const token = getAuthToken();
      if (!token) {
        setError("No authentication token found. Please log in.");
        return null;
      }
      
      console.log(`Fetching user sessions for userId: ${userId}`);
      
      // Try to get user sessions from the session endpoint first
      const sessionResponse = await fetch(`${API_BASE_URL}/history/${userId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      if (sessionResponse.ok) {
        const sessionsData = await sessionResponse.json();
        console.log("User sessions data:", sessionsData);
        
        if (Array.isArray(sessionsData) && sessionsData.length > 0) {
          // Process session data for this specific user
          const processedData = processSessionData(sessionsData.filter(s => s.userId === userId));
          return processedData[0] || null;
        }
      }
      
      // Fallback to history endpoint
      const historyResponse = await fetch(`${API_BASE_URL}/history/${userId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      if (!historyResponse.ok) {
        const errorText = await historyResponse.text();
        console.error("API Response for user history:", {
          status: historyResponse.status,
          statusText: historyResponse.statusText,
          body: errorText,
        });
        return null;
      }
      
      const history = await historyResponse.json();
      console.log("User history data:", history);
      
      // Process single user data
      const processedData = processHistoryData([history]);
      return processedData[0] || null;
      
    } catch (error) {
      console.error("Fetch user sessions error:", error);
      return null;
    }
  };

  const calculateDuration = (checkIn: string, checkOut: string): string => {
    try {
      const inTime = new Date(checkIn);
      const outTime = new Date(checkOut);
      const diffMs = outTime.getTime() - inTime.getTime();
      
      if (diffMs < 0) return "0h 0m";
      
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m`;
    } catch (error) {
      console.error("Error calculating duration:", error);
      return "Invalid";
    }
  };

  const formatTime = (dateTimeString: string): string => {
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleTimeString('en-IN', {
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Asia/Kolkata'
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
      return date.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error("Error formatting datetime:", error);
      return "Invalid Date";
    }
  };

  const getTodaysSessions = (sessions: Session[]): Session[] => {
    const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD format
    return sessions.filter(session => session.date === today);
  };

  // Fixed function to get users with recent activity (not just today)
  const getUsersWithRecentActivity = (users: User[]): User[] => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    return users.filter(user => {
      if (!user.lastCheckIn) return false;
      const lastActivity = new Date(user.lastCheckIn);
      return lastActivity >= threeDaysAgo;
    });
  };

  const filteredUsers: User[] = users.filter((user: User) => {
    const matchesSearch =
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && user.isActive) ||
      (statusFilter === "inactive" && !user.isActive);
    
    let matchesDate = true;
    if (dateFilter === "today") {
      const todaysSessions = getTodaysSessions(user.sessions);
      matchesDate = todaysSessions.length > 0;
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalActiveUsers: number = users.filter((user: User) => user.isActive).length;
  const totalCheckIns: number = users.reduce((sum: number, user: User) => sum + user.totalCheckIns, 0);
  const totalCheckOuts: number = users.reduce((sum: number, user: User) => sum + user.totalCheckOuts, 0);
  const todaysActiveUsers: number = users.filter(user => {
    const todaysSessions = getTodaysSessions(user.sessions);
    return todaysSessions.length > 0;
  }).length;

  // Calculate users with recent activity instead of just today
  const recentActiveUsers = getUsersWithRecentActivity(users).length;

  const handleViewSessions = async (user: User): Promise<void> => {
    setLoading(true);
    const detailedUser = await fetchUserSessions(user.id);
    setSelectedUser(detailedUser || user);
    setShowSessionHistory(true);
    setLoading(false);
  };

  const handleRefresh = () => {
    fetchUsers();
  };

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading user data...</p>
          <p className="mt-2 text-sm text-gray-500">This may take a moment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6 flex items-center" role="alert">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <span className="block sm:inline flex-grow">{error}</span>
            <button 
              className="absolute top-0 bottom-0 right-0 px-4 py-3 hover:bg-red-200 rounded-r-lg transition-colors"
              onClick={() => setError(null)}
            >
              <span className="sr-only">Dismiss</span>
              ✕
            </button>
          </div>
        )}
        
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">User History Dashboard</h1>
            <p className="text-gray-600">Monitor user activity, check-ins, and session history</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleTimeString('en-IN', {timeZone: 'Asia/Kolkata'})}
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
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
              <Calendar className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Today's Activity</p>
                <p className="text-2xl font-bold text-gray-900">{todaysActiveUsers}</p>
                <p className="text-xs text-gray-400">Users active today</p>
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
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              value={statusFilter}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              value={dateFilter}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDateFilter(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="today">Today Only</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              User Activity ({filteredUsers.length} users)
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Check-in</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Check-out</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Today's Sessions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Sessions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                      <Users className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                      <p className="text-lg font-medium text-gray-400">No users found</p>
                      <p className="text-sm text-gray-400">
                        {users.length === 0 ? "No user data available" : "No users match your current filters"}
                      </p>
                      {users.length === 0 && (
                        <button
                          onClick={handleRefresh}
                          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Try Again
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user: User) => {
                    const todaysSessions = getTodaysSessions(user.sessions);
                    return (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                          <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                            {user.id.substring(0, 8)}...
                          </span>
                        </td>
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
                                user.isActive ? "bg-green-500 animate-pulse" : "bg-red-500"
                              }`}
                            ></div>
                            {user.isActive ? "Active" : "Offline"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.lastCheckIn ? (
                            <div>
                              <div className="font-medium">{formatDateTime(user.lastCheckIn)}</div>
                            </div>
                          ) : (
                            <span className="text-gray-400">No check-in</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.lastCheckOut ? (
                            <div className="font-medium">{formatDateTime(user.lastCheckOut)}</div>
                          ) : (
                            <span className="text-green-600 font-medium">Still active</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              todaysSessions.length > 0 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {todaysSessions.length} session{todaysSessions.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                          </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                           <div className="flex items-center space-x-4">
                             <span className="text-green-600 font-medium">In: {user.totalCheckIns}</span>
                            <span className="text-red-600 font-medium">Out: {user.totalCheckOuts}</span>
                           </div>
                        </td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleViewSessions(user)}
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
                    Session History - {selectedUser.fullName}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    ID: <span className="font-mono bg-gray-200 px-1 rounded">{selectedUser.id}</span> | {selectedUser.email}
                  </p>
                </div>
                <button
                  onClick={() => setShowSessionHistory(false)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 p-2 rounded-full transition-colors"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[70vh]">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center">
                      <BarChart3 className="h-6 w-6 text-blue-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-blue-600">Total Check-ins</p>
                        <p className="text-2xl font-bold text-blue-900">{selectedUser.totalCheckIns}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <div className="flex items-center">
                      <BarChart3 className="h-6 w-6 text-red-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-red-600">Total Check-outs</p>
                        <p className="text-2xl font-bold text-red-900">{selectedUser.totalCheckOuts}</p>
                      </div>
                    </div>
                  </div>
                  
                   <div className="bg-green-50 rounded-lg p-4 border border-green-200">
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

                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                     <div className="flex items-center">
                       <Calendar className="h-6 w-6 text-purple-600" />
                       <div className="ml-3">
                         <p className="text-sm font-medium text-purple-600">Today's Sessions</p>
                         <p className="text-2xl font-bold text-purple-900">
                           {getTodaysSessions(selectedUser.sessions).length}
                         </p>
                       </div>
                     </div>
                   </div>
                 </div>
                
                 <div className="overflow-x-auto">
                   <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-in</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-out</th>
                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                       </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedUser.sessions.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                            No session history available
                          </td>
                        </tr>
                      ) : (
                        selectedUser.sessions.map((session: Session, index: number) => (
                          <tr key={session._id || index}>
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
                        ))
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
