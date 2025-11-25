// /* eslint-disable prefer-const */
// /* eslint-disable @typescript-eslint/no-explicit-any */

// "use client";
// import React, { useState, useEffect } from "react";
// import { Clock, LogIn, LogOut, MapPin, Navigation } from "lucide-react";
// import axios, { AxiosError } from "axios";
// import { useRouter } from "next/navigation";
// import { getUserLocationDetails } from "../functions/helperFunctions";
// import { useSelector, useDispatch } from "react-redux";
// import { RootState } from "../store/store";
// import { setLocation, setUser } from "../store/authSlice";
// import Header from "../components/Header";

// interface ApiError {
//   error: string;
  
// }

// const DashboardPage: React.FC = () => {
//   const [isCheckedIn, setIsCheckedIn] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);

//   const { location, token, user } = useSelector((store: RootState) => store.auth);
//   const dispatch = useDispatch();
//   const router = useRouter();

//   const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/hrm";

//   useEffect(() => {
//     if (!user) router.replace("/login");
//   }, [user, router]);

//   useEffect(() => {
//     const userString = localStorage.getItem("user");
//     const token = localStorage.getItem("token");
//     const locationString = localStorage.getItem("location");

//     const user = userString ? JSON.parse(userString) : null;
//     const location = locationString ? JSON.parse(locationString) : null;

//     if (user && token && location) {
//       dispatch(setUser({ user, token }));
//       dispatch(setLocation(location));
//     }
//     setLoading(false);
//   }, [dispatch]);

//   const handleCheckIn = async (): Promise<void> => {
//     if (!location) {
//       setError("Please set your location before checking in.");
//       return;
//     }

//     try {
//       setLoading(true);
//       setError(null);
//       if (!token) {
//         setError("Authentication token not found. Please log in.");
//         return;
//       }

//       const history = {
//         checkIn: {
//           city: location.city,
//           state: location.state ? location.state : "",
//           country: location.country,
//           ip: location.ip ? location.ip : "",
//           lat: location.lat,
//           long: location.lon,
//         },
//         checkOut: null,
//       };

//       await axios.post(
//         `${API_BASE_URL}/checkin`,
//         { history },
//         {
//           headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
//           withCredentials: true,
//         }
//       );

//       setIsCheckedIn(true);
//       setError(null);
//     } catch (err) {
//       const error = err as AxiosError<ApiError>;
//       setError(`Check-in failed: ${error.response?.data?.error || "Unknown error"}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCheckOut = async (): Promise<void> => {
//     try {
//       setLoading(true);
//       setError(null);

//       if (!token) {
//         setError("Authentication token not found. Please log in.");
//         return;
//       }

//       const checkOut = await getUserLocationDetails();

//       await axios.put(
//         `${API_BASE_URL}/checkout`,
//         { checkOut },
//         {
//           headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
//           withCredentials: true,
//         }
//       );

//       setIsCheckedIn(false);
//       setError(null);
//     } catch (err) {
//       const error = err as AxiosError<ApiError>;
//       setError(`Check-out failed: ${error.response?.data?.error || "Unknown error"}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-blue-50">
//         <p>Loading dashboard...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
//       <Header />

//       {/* Page Heading */}
//       <div className="max-w-6xl mx-auto px-4 py-6">
//         <h1 className="text-3xl font-bold text-gray-800 mb-2"></h1>
//         <p className="text-gray-600">Manage your daily attendance and view your dashboard overview.</p>
//       </div>

//       {/* Main Content Grid */}
//       <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
//         {/* Image Section */}
//         <div>
//           <img
//             src="https://static.vecteezy.com/system/resources/previews/027/177/615/non_2x/remote-management-pipeline-composition-vector.jpg"
//             alt="Remote Management Pipeline"
//             className="w-full h-auto rounded-lg shadow-lg"
//             style={{ maxHeight: '400px' }}
//           />
//         </div>

//         {/* Check-in/Check-out Card */}
//         <div className="bg-white rounded-xl shadow-lg p-8">
//           {error && (
//             <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
//               {error}
//             </div>
//           )}

//           {/* Status */}
//           <div className="text-center mb-6">
//             <div
//               className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
//                 isCheckedIn ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
//               }`}
//             >
//               <div className={`w-2 h-2 rounded-full mr-2 ${isCheckedIn ? "bg-green-500" : "bg-gray-500"}`} />
//               {isCheckedIn ? "Checked In" : "Checked Out"}
//             </div>
//           </div>

//           {/* Location */}
//           <div className="mb-6">
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               <MapPin className="w-4 h-4 inline-block mr-1" /> Current Location
//             </label>
//             {!location?.lat ? (
//               <button
//                 onClick={getUserLocationDetails}
//                 disabled={isCheckedIn || loading}
//                 className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
//               >
//                 Get Current Location
//               </button>
//             ) : (
//               <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
//                 <Navigation className="w-4 h-4 mr-2 text-blue-500" />
//                 {location?.lat}, {location?.lon}
//               </div>
//             )}
//           </div>

//           {/* Action Buttons */}
//           <div className="flex justify-center space-x-4">
//             {!isCheckedIn ? (
//               <button
//                 onClick={handleCheckIn}
//                 disabled={loading || !location?.lat}
//                 className="px-8 py-4 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700"
//               >
//                 {loading ? "Checking In..." : <><LogIn className="w-5 h-5 inline mr-2" /> Check In</>}
//               </button>
//             ) : (
//               <button
//                 onClick={handleCheckOut}
//                 disabled={loading}
//                 className="px-8 py-4 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700"
//               >
//                 {loading ? "Checking Out..." : <><LogOut className="w-5 h-5 inline mr-2" /> Check Out</>}
//               </button>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DashboardPage;




"use client"

import React, { useState } from 'react';
import { 
  User, 
  Calendar, 
  Clock, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Star,
  Edit,
  Bell,
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Award,
  Users,
  FileText,
  Download,
  Eye,
  Camera,
  Save,
  X,
  Plus,
  Shield,
  Globe,
  Trash2
} from 'lucide-react';

interface LeaveRequest {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  status: 'approved' | 'pending' | 'rejected';
  reason: string;
}

interface AttendanceRecord {
  date: string;
  checkIn: string;
  checkOut: string;
  hours: string;
  status: 'present' | 'absent' | 'late' | 'half-day';
}

const UserDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'attendance' | 'leave' | 'documents'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [newSkill, setNewSkill] = useState('');
  const [editedProfile, setEditedProfile] = useState({
    name: 'Emily Madison',
    email: 'emily.madison1983@gmail.com',
    phone: '+35 930 292 1102',
    address: '123 Business Street, City, State 12345',
    bio: 'Experienced HR Manager with 8+ years in talent management and organizational development.',
    skills: ['HR Management', 'Talent Acquisition', 'Employee Relations', 'Training & Development'],
    emergencyContact: {
      name: 'Michael Madison',
      relationship: 'Spouse',
      phone: '+35 930 292 1103'
    }
  });

  // Mock user data
  const userProfile = {
    name: 'Emily Madison',
    employeeId: 'EMP001',
    role: 'Senior Human Resource Manager',
    department: 'Human Resources',
    email: 'emily.madison1983@gmail.com',
    phone: '+35 930 292 1102',
    address: '123 Business Street, City, State 12345',
    joinDate: '2023-01-15',
    manager: 'John Smith',
    rating: 4.8,
    completionPercentage: 85,
    lastLogin: '2024-09-27',
    timezone: 'GMT+5:30'
  };

  // Calculate completion percentage based on filled fields
  const calculateCompletion = () => {
    let completed = 0;
    const total = 12;
    
    if (editedProfile.name) completed++;
    if (editedProfile.email) completed++;
    if (editedProfile.phone) completed++;
    if (editedProfile.address) completed++;
    if (editedProfile.bio) completed++;
    if (editedProfile.skills.length > 0) completed++;
    if (editedProfile.emergencyContact.name) completed++;
    if (editedProfile.emergencyContact.phone) completed++;
    if (profileImage) completed++;
    completed += 3; // Fixed fields: role, department, employee ID
    
    return Math.round((completed / total) * 100);
  };

  const handleSaveProfile = () => {
    // In a real app, this would make an API call to save the profile
    setIsEditing(false);
    console.log('Profile saved:', editedProfile);
  };

  const handleCancelEdit = () => {
    // Reset to original values
    setEditedProfile({
      name: 'Emily Madison',
      email: 'emily.madison1983@gmail.com',
      phone: '+35 930 292 1102',
      address: '123 Business Street, City, State 12345',
      bio: 'Experienced HR Manager with 8+ years in talent management and organizational development.',
      skills: ['HR Management', 'Talent Acquisition', 'Employee Relations', 'Training & Development'],
      emergencyContact: {
        name: 'Michael Madison',
        relationship: 'Spouse',
        phone: '+35 930 292 1103'
      }
    });
    setIsEditing(false);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
        setShowPhotoUpload(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !editedProfile.skills.includes(newSkill.trim())) {
      setEditedProfile({
        ...editedProfile,
        skills: [...editedProfile.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setEditedProfile({
      ...editedProfile,
      skills: editedProfile.skills.filter(skill => skill !== skillToRemove)
    });
  };

  const leaveRequests: LeaveRequest[] = [
    {
      id: '1',
      type: 'Annual Leave',
      startDate: '2024-10-15',
      endDate: '2024-10-17',
      days: 3,
      status: 'approved',
      reason: 'Family vacation'
    },
    {
      id: '2',
      type: 'Sick Leave',
      startDate: '2024-09-28',
      endDate: '2024-09-28',
      days: 1,
      status: 'approved',
      reason: 'Medical appointment'
    },
    {
      id: '3',
      type: 'Personal Leave',
      startDate: '2024-10-25',
      endDate: '2024-10-26',
      days: 2,
      status: 'pending',
      reason: 'Personal matters'
    }
  ];

  const attendanceRecords: AttendanceRecord[] = [
    { date: '2024-09-23', checkIn: '09:00', checkOut: '18:00', hours: '8h 30m', status: 'present' },
    { date: '2024-09-24', checkIn: '09:15', checkOut: '18:00', hours: '8h 15m', status: 'late' },
    { date: '2024-09-25', checkIn: '09:00', checkOut: '18:00', hours: '8h 30m', status: 'present' },
    { date: '2024-09-26', checkIn: '09:00', checkOut: '13:00', hours: '4h 00m', status: 'half-day' },
    { date: '2024-09-27', checkIn: '-', checkOut: '-', hours: '0h 00m', status: 'absent' }
  ];

  const leaveBalance = {
    annual: { used: 8, total: 25 },
    sick: { used: 2, total: 12 },
    personal: { used: 3, total: 7 }
  };

  const renderHeader = () => (
    <div className="bg-white shadow-sm border-b px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-6 h-6 text-blue-600" />
              )}
            </div>
            {isEditing && (
              <button
                onClick={() => setShowPhotoUpload(true)}
                className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full p-1 hover:bg-blue-700"
              >
                <Camera className="w-3 h-3" />
              </button>
            )}
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Welcome back, {userProfile.name}!</h1>
            <p className="text-sm text-gray-600">{userProfile.role} • {userProfile.department}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <Bell className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Photo Upload Modal */}
      {showPhotoUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Update Profile Photo</h3>
              <button
                onClick={() => setShowPhotoUpload(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600 mb-4">Choose a photo to upload</p>
                <label className="bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700">
                  Select Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderTabs = () => (
    <div className="bg-white border-b px-6">
      <div className="flex space-x-8">
        {[
          { id: 'profile', label: 'Profile', icon: User },
          { id: 'attendance', label: 'Attendance', icon: Clock },
          { id: 'leave', label: 'Leave Management', icon: Calendar },
          { id: 'documents', label: 'Documents', icon: FileText }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            // <button
            //   key={tab.id}
            //   onClick={() => setActiveTab(tab.id as any)}
            //   className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
            //     activeTab === tab.id
            //       ? 'border-blue-500 text-blue-600'
            //       : 'border-transparent text-gray-500 hover:text-gray-700'
            //   }`}
            // >
            //   <Icon className="w-4 h-4" />
            //   <span>{tab.label}</span>
            // </button>
            <></>
          );
        })}
      </div>
    </div>
  );

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const renderProfile = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Completion */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Profile Completion</h3>
            <p className="text-sm text-gray-600">Complete your profile to unlock all features</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-200"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-blue-600"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray={`${calculateCompletion()}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-semibold text-blue-600">{calculateCompletion()}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancelEdit}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-700 px-3 py-1 rounded-lg border"
                >
                  <X className="w-4 h-4" />
                  <span className="text-sm">Cancel</span>
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="flex items-center space-x-2 text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-lg"
                >
                  <Save className="w-4 h-4" />
                  <span className="text-sm">Save Changes</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
              >
                <Edit className="w-4 h-4" />
                <span className="text-sm">Edit Profile</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedProfile.name}
                  onChange={(e) => setEditedProfile({...editedProfile, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{editedProfile.name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
              <p className="text-gray-900">{userProfile.employeeId}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-400" />
                {isEditing ? (
                  <input
                    type="email"
                    value={editedProfile.email}
                    onChange={(e) => setEditedProfile({...editedProfile, email: e.target.value})}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-blue-600">{editedProfile.email}</p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gray-400" />
                {isEditing ? (
                  <input
                    type="tel"
                    value={editedProfile.phone}
                    onChange={(e) => setEditedProfile({...editedProfile, phone: e.target.value})}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{editedProfile.phone}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <div className="flex items-center space-x-2">
                <Briefcase className="w-4 h-4 text-gray-400" />
                <p className="text-gray-900">{userProfile.department}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
              <p className="text-gray-900">{userProfile.role}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Join Date</label>
              <p className="text-gray-900">{new Date(userProfile.joinDate).toLocaleDateString()}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reporting Manager</label>
              <p className="text-gray-900">{userProfile.manager}</p>
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <div className="mt-6 pt-6 border-t">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            {isEditing ? (
              <textarea
                value={editedProfile.bio}
                onChange={(e) => setEditedProfile({...editedProfile, bio: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tell us about yourself..."
              />
            ) : (
              <p className="text-gray-900">{editedProfile.bio}</p>
            )}
          </div>
        </div>

        {/* Skills Section */}
        <div className="mt-6 pt-6 border-t">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {editedProfile.skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >
                  {skill}
                  {isEditing && (
                    <button
                      onClick={() => removeSkill(skill)}
                      className="ml-2 hover:text-blue-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </span>
              ))}
            </div>
            {isEditing && (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                  placeholder="Add a skill..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={addSkill}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="mt-6 pt-6 border-t">
          <h4 className="text-md font-semibold text-gray-900 mb-4">Emergency Contact</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedProfile.emergencyContact.name}
                  onChange={(e) => setEditedProfile({
                    ...editedProfile,
                    emergencyContact: {...editedProfile.emergencyContact, name: e.target.value}
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{editedProfile.emergencyContact.name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedProfile.emergencyContact.relationship}
                  onChange={(e) => setEditedProfile({
                    ...editedProfile,
                    emergencyContact: {...editedProfile.emergencyContact, relationship: e.target.value}
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{editedProfile.emergencyContact.relationship}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={editedProfile.emergencyContact.phone}
                  onChange={(e) => setEditedProfile({
                    ...editedProfile,
                    emergencyContact: {...editedProfile.emergencyContact, phone: e.target.value}
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{editedProfile.emergencyContact.phone}</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Performance Rating</label>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  {renderStars(Math.floor(userProfile.rating))}
                </div>
                <span className="text-sm text-gray-600">({userProfile.rating}/5.0)</span>
              </div>
            </div>
            <div className="text-right">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.address}
                    onChange={(e) => setEditedProfile({...editedProfile, address: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900 text-sm">{editedProfile.address}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="mt-6 pt-6 border-t">
          <h4 className="text-md font-semibold text-gray-900 mb-4">Account Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Last Login</span>
              <span className="text-gray-900">{userProfile.lastLogin}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Timezone</span>
              <span className="text-gray-900">{userProfile.timezone}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Account Status</span>
              <span className="flex items-center text-green-600">
                <CheckCircle className="w-4 h-4 mr-1" />
                Active
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Two-Factor Auth</span>
              <span className="flex items-center text-green-600">
                <Shield className="w-4 h-4 mr-1" />
                Enabled
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAttendance = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Attendance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-green-600">22</p>
              <p className="text-xs text-gray-500">Present Days</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Absences</p>
              <p className="text-2xl font-bold text-red-600">2</p>
              <p className="text-xs text-gray-500">This Month</p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Late Arrivals</p>
              <p className="text-2xl font-bold text-orange-600">3</p>
              <p className="text-xs text-gray-500">This Month</p>
            </div>
            <AlertCircle className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Hours</p>
              <p className="text-2xl font-bold text-blue-600">8.2</p>
              <p className="text-xs text-gray-500">Per Day</p>
            </div>
            <Clock className="w-8 h-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Recent Attendance */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Recent Attendance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {attendanceRecords.map((record, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(record.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.checkIn}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.checkOut}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.hours}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      record.status === 'present' ? 'bg-green-100 text-green-800' :
                      record.status === 'late' ? 'bg-orange-100 text-orange-800' :
                      record.status === 'half-day' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderLeave = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Leave Balance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h4 className="font-medium text-gray-900 mb-3">Annual Leave</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Used</span>
              <span className="text-gray-900">{leaveBalance.annual.used}/{leaveBalance.annual.total}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${(leaveBalance.annual.used / leaveBalance.annual.total) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-500">{leaveBalance.annual.total - leaveBalance.annual.used} days remaining</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h4 className="font-medium text-gray-900 mb-3">Sick Leave</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Used</span>
              <span className="text-gray-900">{leaveBalance.sick.used}/{leaveBalance.sick.total}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-red-600 h-2 rounded-full" 
                style={{ width: `${(leaveBalance.sick.used / leaveBalance.sick.total) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-500">{leaveBalance.sick.total - leaveBalance.sick.used} days remaining</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h4 className="font-medium text-gray-900 mb-3">Personal Leave</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Used</span>
              <span className="text-gray-900">{leaveBalance.personal.used}/{leaveBalance.personal.total}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full" 
                style={{ width: `${(leaveBalance.personal.used / leaveBalance.personal.total) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-500">{leaveBalance.personal.total - leaveBalance.personal.used} days remaining</p>
          </div>
        </div>
      </div>

      {/* Leave Requests */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Leave Requests</h3>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Request Leave
          </button>
        </div>
        <div className="divide-y divide-gray-200">
          {leaveRequests.map((request) => (
            <div key={request.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h4 className="font-medium text-gray-900">{request.type}</h4>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      request.status === 'approved' ? 'bg-green-100 text-green-800' :
                      request.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {request.status}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center space-x-6 text-sm text-gray-600">
                    <span>{new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}</span>
                    <span>{request.days} day{request.days > 1 ? 's' : ''}</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{request.reason}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDocuments = () => (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">My Documents</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { name: 'Employment Contract', date: '2023-01-15', type: 'PDF' },
              { name: 'Job Description', date: '2023-01-15', type: 'PDF' },
              { name: 'Salary Certificate', date: '2024-01-01', type: 'PDF' },
              { name: 'Performance Review 2024', date: '2024-06-15', type: 'PDF' },
              { name: 'Training Certificate', date: '2024-03-20', type: 'PDF' },
              { name: 'Policy Handbook', date: '2023-01-15', type: 'PDF' }
            ].map((doc, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="w-8 h-8 text-blue-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">{doc.name}</h4>
                    <p className="text-sm text-gray-600">{doc.type} • {doc.date}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-600 hover:bg-white rounded">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-600 hover:bg-white rounded">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {renderHeader()}
      {renderTabs()}
      
      <div className="p-6">
        {activeTab === 'profile' && renderProfile()}
        {activeTab === 'attendance' && renderAttendance()}
        {activeTab === 'leave' && renderLeave()}
        {activeTab === 'documents' && renderDocuments()}
      </div>
    </div>
  );
};

export default UserDashboard;






