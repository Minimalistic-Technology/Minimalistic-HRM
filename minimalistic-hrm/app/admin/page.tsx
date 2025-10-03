"use client"
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  Calendar, 
 
  ChevronRight,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  TrendingDown,
  BarChart3,
  Edit3,
  MoreHorizontal
} from 'lucide-react';
import Link from "next/link";


interface Employee {
  id: string;
  name: string;
  department: string;
  position: string;
  image: string;
  avatar: string;
  email: string;
  designation: string;
  performance: 'Excellent' | 'Good' | 'Average' | 'Poor';
  performanceScore: number;
  date: string;
}

interface LeaveApplication {
  id: string;
  name: string;
  reason: string;
  type: string;
  status: 'Approved' | 'Pending' | 'Rejected';
}

interface Notice {
  id: string;
  title: string;
  type: string;
  date: string;
  priority: 'high' | 'medium' | 'low';
}

interface StatCardProps {
  title: string;
  count: string | number;
  percentage?: number;
  trend?: 'up' | 'down';
  details: string;
  icon?: React.ComponentType<{ className?: string }>;
}

const HRDashboard = () => {
  
  const [attendanceData, setAttendanceData] = useState([65, 78, 82, 90, 85, 88, 75, 92, 87, 79, 83, 86]);
  
  // Dynamic data
  const [dashboardStats, setDashboardStats] = useState({
    totalEmployees: { count: 26, change: 8.5, trend: 'up' as const },
    todayPresents: { count: 4, percentage: 16, trend: 'down' as const },
    todayAbsents: { count: 13, percentage: 50, trend: 'up' as const },
    todayLeave: { count: 9, percentage: 36, trend: 'down' as const }
  });

  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: '01',
      name: 'Haary',
      department: 'Electrical',
      position: 'Senior Engineer',
      image: '/api/placeholder/32/32',
      avatar: '/api/placeholder/32/32',
      email: 'honorato@company.com',
      designation: 'Senior Engineer',
      performance: 'Excellent',
      performanceScore: 95,
      date: '22-08-24'
    },
    {
      id: '02',
      name: 'Jorry',
      department: 'Production',
      position: 'Team Lead',
      image: '/api/placeholder/32/32',
      avatar: '/api/placeholder/32/32',
      email: 'jonathan@company.com',
      designation: 'Team Lead',
      performance: 'Good',
      performanceScore: 87,
      date: '30-11-01'
    },
    {
      id: '03',
      name: 'Alex',
      department: 'Software',
      position: 'Developer',
      image: '/api/placeholder/32/32',
      avatar: '/api/placeholder/32/32',
      email: 'malaha@company.com',
      designation: 'Developer',
      performance: 'Good',
      performanceScore: 89,
      date: '22-08-24'
    }
  ]);

  const [leaveApplications, setLeaveApplications] = useState<LeaveApplication[]>([
    {
      id: '1',
      name: 'Harry',
      reason: 'Dental Surgery',
      type: 'Medical Leave',
      status: 'Approved'
    },
    {
      id: '2',
      name: 'Jorry',
      reason: 'Personal Leave',
      type: 'Personal',
      status: 'Approved'
    },
    {
      id: '3',
      name: 'Alex',
      reason: 'Family Emergency',
      type: 'Emergency',
      status: 'Approved'
    }
   
  ]);

  const [notices, setNotices] = useState<Notice[]>([
    {
      id: '1',
      title: 'Get ready for meeting at 6 pm',
      type: 'Meeting',
      date: '25-Aug-24',
      priority: 'high'
    },
    {
      id: '2',
      title: 'Management Decision',
      type: 'Important Management Meeting',
      date: '10-Jul-24',
      priority: 'medium'
    },
    {
      id: '3',
      title: 'Our Organization will Organize a Annual Report',
      type: 'Meeting',
      date: '10-Jul-24',
      priority: 'low'
    }
  ]);

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'Excellent': return 'bg-green-100 text-green-800';
      case 'Good': return 'bg-blue-100 text-blue-800';
      case 'Average': return 'bg-yellow-100 text-yellow-800';
      case 'Poor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPerformanceStyle = (performance: string) => {
    switch (performance) {
      case 'Excellent': return 'text-green-700 bg-green-50 border-green-200';
      case 'Good': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'Average': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'Poor': return 'text-red-700 bg-red-50 border-red-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getPerformanceIcon = (performance: string) => {
    switch (performance) {
      case 'Excellent': return <TrendingUp className="w-3 h-3 mr-1" />;
      case 'Good': return <BarChart3 className="w-3 h-3 mr-1" />;
      case 'Average': return <BarChart3 className="w-3 h-3 mr-1" />;
      case 'Poor': return <TrendingDown className="w-3 h-3 mr-1" />;
      default: return <BarChart3 className="w-3 h-3 mr-1" />;
    }
  };
  
  const StatCard: React.FC<StatCardProps> = ({ title, count, percentage, trend, details, icon: Icon }) => (
  
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <button className="text-xs text-blue-600 hover:text-blue-700">See Details</button>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{count}</div>
          <div className="flex items-center text-sm text-gray-500">
            {percentage && trend && (
              <>
                <span className={`inline-flex items-center ${
                  trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {trend === 'up' ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  {percentage}%
                </span>
                <span className="ml-2">{details}</span>
              </>
            )}
            {!percentage && <span>{details}</span>}
          </div>
        </div>
        <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center">
          {Icon ? <Icon className="w-8 h-8 text-blue-500" /> : <div className="w-8 h-8 bg-blue-200 rounded-lg"></div>}
        </div>
      </div>
    </div>
  );

  const AttendanceChart = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const maxValue = Math.max(...attendanceData);
    
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Daily Attendance Statistic</h3>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-gray-600">Leave 5%</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-gray-600">Present 64%</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <span className="text-gray-600">Absent 13%</span>
            </div>
            <select className="border border-gray-200 rounded px-2 py-1 text-sm">
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
          </div>
        </div>
        
        <div className="h-64 flex items-end justify-between space-x-2">
          {attendanceData.map((value, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div 
                className="w-full bg-gradient-to-t from-blue-200 to-blue-400 rounded-t-sm transition-all duration-300 hover:from-blue-300 hover:to-blue-500"
                style={{ height: `${(value / maxValue) * 200}px` }}
              ></div>
              <span className="text-xs text-gray-500 mt-2">{days[index % 7]}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex  flex-col">
       <header>
                 {/* Buttons directly under the card */}
<div className="flex  justify-end gap-2 mt-2 ">
  <Link href="/admin/manage-user">
    <button className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm">
      ➕ Add User
    </button>
  </Link>
  <Link href="/admin/user-history">
    <button className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm">
      📜 User History
    </button>
  </Link>
</div>
       </header>
      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-6 mb-6">
          <StatCard 
            title="Total Employee"
            count={dashboardStats.totalEmployees.count}
            percentage={dashboardStats.totalEmployees.change}
            trend={dashboardStats.totalEmployees.trend}
            details="Employee Count grew the last 7 days, from 22 to 26"
            icon={Users}
          />
 
          <StatCard 
            title="Today Presents"
            count={`0${dashboardStats.todayPresents.count}`}
            percentage={dashboardStats.todayPresents.percentage}
            trend={dashboardStats.todayPresents.trend}
            details="16% of employees are present today (10 out of 26)"
            icon={CheckCircle}
          />
          <StatCard 
            title="Today Absents"
            count={dashboardStats.todayAbsents.count}
            percentage={dashboardStats.todayAbsents.percentage}
            trend={dashboardStats.todayAbsents.trend}
            details="50% of employees are absents, leaving 13 absent"
            icon={XCircle}
          />
          <StatCard 
            title="Today Leave"
            count={`0${dashboardStats.todayLeave.count}`}
            percentage={dashboardStats.todayLeave.percentage}
            trend={dashboardStats.todayLeave.trend}
            details="36% of employees are leaves today (9 out of 26)"
            icon={Calendar}
          />
        </div>

        {/* Charts and Applications */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="col-span-2">
            <AttendanceChart />
          </div>
          
          {/* Leave Applications */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Leave Application</h3>
              <button className="text-sm text-blue-600 hover:text-blue-700">See Details</button>
            </div>
            <div className="space-y-4">
              {leaveApplications.map((application) => (
                <div key={application.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm">{application.name}</h4>
                    <p className="text-xs text-gray-500">{application.reason} • {application.type}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    application.status === 'Approved' 
                      ? 'bg-green-100 text-green-800' 
                      : application.status === 'Pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {application.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-2 gap-6">
          {/* Notice */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Notice</h3>
              <button className="text-sm text-blue-600 hover:text-blue-700">See Details</button>
            </div>
            <div className="space-y-4">
              {notices.map((notice) => (
                <div key={notice.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    notice.priority === 'high' ? 'bg-red-400' : 
                    notice.priority === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 text-sm">{notice.title}</h4>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{notice.type}</span>
                      <span className="ml-2">{notice.date}</span>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <Star className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Employee Performance List */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Employee Performance List</h3>
             
            </div>
            
            <div className="overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                    <th className="pb-3">Name</th>
                    <th className="pb-3">Designation</th>
                    <th className="pb-3">Performance</th>
                    <th className="pb-3">Action</th>
                  
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {employees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50">
                   
                     {/* Name Column */}
                    <td className="py-5 px-6">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <img
                            src={employee.avatar}
                            alt={employee.name}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm"
                          />
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">
                            {employee.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {employee.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Designation Column */}
                    <td className="py-5 px-6">
                      <span className="text-sm font-medium text-gray-700">
                        {employee.designation}
                      </span>
                    </td>

                    {/* Performance Column */}
                    <td className="py-5 px-6">
                      <span className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full border ${getPerformanceStyle(employee.performance)}`}>
                        {employee.performance}
                      </span>
                    </td>

                    {/* Action Column */}
                    <td className="py-5 ">
                      <div className="flex items-center space-x-2">
                        <button className="inline-flex items-center py-1.5 text-sm font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors">
                          <Edit3 className="w-3.5 h-3.5 mr-1.5" />
                          Edit
                        </button>
                        <button className=" text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
 
                      
             
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;
