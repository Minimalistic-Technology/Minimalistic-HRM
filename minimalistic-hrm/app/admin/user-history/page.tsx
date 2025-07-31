"use client"
import React, { useState, useEffect } from 'react';
import { Users, Clock, LogIn, LogOut, Calendar, Filter, Search, Eye, BarChart3 } from 'lucide-react';

interface Session {
  date: string;
  checkIn: string;
  checkOut: string | null;
  duration: string | null;
}

interface User {
  id: number;
  email: string;
  fullName: string;
  isActive: boolean;
  lastCheckIn: string;
  lastCheckOut: string;
  totalCheckIns: number;
  totalCheckOuts: number;
  sessions: Session[];
}

const UserHistoryDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      email: 'john.doe@company.com',
      fullName: 'John Doe',
      isActive: true,
      lastCheckIn: '2025-07-23T09:15:00',
      lastCheckOut: '2025-07-22T17:30:00',
      totalCheckIns: 156,
      totalCheckOuts: 155,
      sessions: [
        { date: '2025-07-23', checkIn: '09:15', checkOut: null, duration: null },
        { date: '2025-07-22', checkIn: '08:45', checkOut: '17:30', duration: '8h 45m' },
        { date: '2025-07-21', checkIn: '09:00', checkOut: '18:15', duration: '9h 15m' }
      ]
    },
    {
      id: 2,
      email: 'sarah.smith@company.com',
      fullName: 'Sarah Smith',
      isActive: false,
      lastCheckIn: '2025-07-23T08:30:00',
      lastCheckOut: '2025-07-23T16:45:00',
      totalCheckIns: 203,
      totalCheckOuts: 203,
      sessions: [
        { date: '2025-07-23', checkIn: '08:30', checkOut: '16:45', duration: '8h 15m' },
        { date: '2025-07-22', checkIn: '09:30', checkOut: '17:00', duration: '7h 30m' },
        { date: '2025-07-21', checkIn: '08:15', checkOut: '17:45', duration: '9h 30m' }
      ]
    },
    {
      id: 3,
      email: 'mike.johnson@company.com',
      fullName: 'Mike Johnson',
      isActive: true,
      lastCheckIn: '2025-07-23T07:45:00',
      lastCheckOut: '2025-07-22T19:20:00',
      totalCheckIns: 298,
      totalCheckOuts: 297,
      sessions: [
        { date: '2025-07-23', checkIn: '07:45', checkOut: null, duration: null },
        { date: '2025-07-22', checkIn: '08:00', checkOut: '19:20', duration: '11h 20m' },
        { date: '2025-07-21', checkIn: '07:30', checkOut: '18:00', duration: '10h 30m' }
      ]
    },
    {
      id: 4,
      email: 'emma.wilson@company.com',
      fullName: 'Emma Wilson',
      isActive: false,
      lastCheckIn: '2025-07-22T10:00:00',
      lastCheckOut: '2025-07-22T18:30:00',
      totalCheckIns: 87,
      totalCheckOuts: 87,
      sessions: [
        { date: '2025-07-22', checkIn: '10:00', checkOut: '18:30', duration: '8h 30m' },
        { date: '2025-07-21', checkIn: '09:45', checkOut: '17:15', duration: '7h 30m' },
        { date: '2025-07-20', checkIn: '08:30', checkOut: '16:45', duration: '8h 15m' }
      ]
    }
  ]);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showSessionHistory, setShowSessionHistory] = useState<boolean>(false);

  const filteredUsers: User[] = users.filter((user: User) => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && user.isActive) ||
                         (statusFilter === 'inactive' && !user.isActive);
    
    return matchesSearch && matchesStatus;
  });

  const totalActiveUsers: number = users.filter((user: User) => user.isActive).length;
  const totalCheckIns: number = users.reduce((sum: number, user: User) => sum + user.totalCheckIns, 0);
  const totalCheckOuts: number = users.reduce((sum: number, user: User) => sum + user.totalCheckOuts, 0);

  const formatDateTime = (dateTime: string): string => {
    const date = new Date(dateTime);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds}`;
  };

  const handleViewSessions = (user: User): void => {
    setSelectedUser(user);
    setShowSessionHistory(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
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
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Now</p>
                <p className="text-2xl font-bold text-gray-900">{totalActiveUsers}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <LogIn className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Check-ins</p>
                <p className="text-2xl font-bold text-gray-900">{totalCheckIns}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <LogOut className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Check-outs</p>
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
                  placeholder="Search by name or email..."
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                        user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        <div className={`w-2 h-2 rounded-full mr-1 ${
                          user.isActive ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        {user.isActive ? 'Active' : 'Offline'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDateTime(user.lastCheckIn)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.lastCheckOut ? formatDateTime(user.lastCheckOut) : 'Still active'}
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
                  <h3 className="text-lg font-semibold text-gray-900">Session History</h3>
                  <p className="text-sm text-gray-600">{selectedUser.fullName} ({selectedUser.email})</p>
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
                          {selectedUser.isActive ? 'Active' : 'Offline'}
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
                        <tr key={index}>
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
                            {session.duration || 'In progress'}
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








