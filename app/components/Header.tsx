"use client"
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  Bell,
  X,
  Camera,
  Save,
  Upload,
  User,
  Mail,
  Phone,
  Briefcase,
  CheckCircle,
  Edit3
} from 'lucide-react';

// Define interfaces for type safety
interface UserData {
  name: string;
  email: string;
  phone: string;
  position: string;
  profileImage: string;
  joinDate: string;
  employeeId: string;
  department: string;
  team: string;
  manager: string;
  supervisor: string;
  location: string;
  status: string;
  lastLogin?: string;
}

interface FormData {
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  position?: string;
  department?: string;
  team?: string;
  manager?: string;
  location?: string;
}

interface TabButtonProps {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
}

const EnhancedHeaderWithProfile = () => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<FormData>({});
  const [notifications] = useState<number>(0);

  const userData: UserData = React.useMemo<UserData>(() => ({
      name: "Saxena",
      email: "saxena@company.com",
      phone: "1234567890",
      position: "Web Developer",
      profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
      joinDate: "May 1, 2022",
      // employeeId: "EMP-2022-001",
      department: "Engineering",
      team: "Mobile Development",
      manager: "Kris Middleton",
      supervisor: "Eugene Hummel",
      location: "San Francisco, CA",
      status: "Active",
      lastLogin: "2 hours ago",
      employeeId: ''
  }), []);

  // Calculate overall progress (example calculation)

  useEffect(() => {
    setFormData(userData);
  }, [userData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // Save logic here
    setIsEditing(false);
    console.log('Saving data:', formData);
  };

  const TabButton: React.FC<TabButtonProps> = ({ id, label, icon: Icon, active }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all ${
        active 
          ? 'bg-blue-100 text-blue-700 shadow-sm' 
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
      }`}
    >
      <Icon className="w-4 h-4 mr-2" />
      {label}
    </button>
  );

  return (
    <div className=" bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Enhanced Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
               <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center">
<Image
    src="/m.jpg" // <- Replace with the correct image path
    alt="MT Logo"
    className="w-full h-full object-cover"
  />
</div>

                <div>
                  <h1 className="text-xl font-bold text-gray-900">Welcome,To The Minimalistic Technology</h1>
                  {/* <p className="text-sm text-gray-500">Manage your profile and onboarding</p> */}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <Bell className="w-6 h-6 text-gray-600 hover:text-gray-900 cursor-pointer transition-colors" />
                {notifications > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                    {notifications}
                  </span>
                )}
              </div>
              
              <div className="w-px h-6 bg-gray-300"></div>
              
              {/* Enhanced Profile Avatar */}
              <div 
                className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 rounded-xl p-3 transition-all duration-200 border border-transparent hover:border-gray-200 hover:shadow-sm"
                onClick={() => setShowProfileModal(true)}
              >
                <div className="relative">
                  <Image
                    src={userData.profileImage}
                    alt={userData.name}
                    width={10}
                    height={10}
                    className="rounded-full object-cover ring-2 ring-blue-100"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-semibold text-gray-900">{userData.name}</p>
                  <p className="text-xs text-gray-500">{userData.position}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[95vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            {/* Enhanced Modal Header */}
            <div className="relative bg-gradient-to-r from-green-600 to-blue-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Image
                      src={userData.profileImage}
                      alt={userData.name}
                      className="w-16 h-16 rounded-full object-cover ring-4 ring-white/20"
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 border-2 border-white rounded-full"></div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{userData.name}</h2>
                    <p className="text-blue-100 flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {userData.position}
                    </p>
                    <p className="text-blue-100 text-sm mt-1">
                      Member since {userData.joinDate} 
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => setIsEditing(!isEditing)}
                    className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-medium flex items-center transition-all"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    {isEditing ? 'View Mode' : 'Edit Profile'}
                  </button>
                  <button
                    onClick={() => setShowProfileModal(false)}
                    className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg p-2 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* Status Indicators */}
              <div className="flex items-center space-x-6 mt-4">
                <div className="flex items-center text-green-200">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  <span className="text-sm">Active Employee</span>
                </div>
               
              </div>
            </div>

            <div className="p-6">
              {/* Enhanced Tab Navigation */}
              <div className="flex space-x-2 mb-6 bg-gray-100 p-1 rounded-xl">
                <TabButton id="details" label="Profile Details" icon={User} active={activeTab === 'details'} />
              </div>

              <div className="overflow-y-auto max-h-[60vh]">
                {/* Profile Details Tab */}
                {activeTab === 'details' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div className="space-y-6">
                      {/* Profile Image Section */}
                      <div className="bg-gray-50 rounded-2xl p-6">
                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4 flex items-center">
                          <Camera className="w-4 h-4 mr-2" />
                          Profile Image
                        </h3>
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <Image
                              src={userData.profileImage}
                              alt={userData.name}
                              className="w-24 h-24 rounded-2xl object-cover"
                            />
                            {isEditing && (
                              <button className="absolute inset-0 bg-black bg-opacity-50 rounded-2xl flex items-center justify-center text-white hover:bg-opacity-60 transition-all">
                                <Upload className="w-6 h-6" />
                              </button>
                            )}
                          </div>
                          {isEditing && (
                            <div className="flex-1">
                              <button className="text-blue-600 hover:text-blue-700 font-medium text-sm mb-2">
                                Upload New Image
                              </button>
                              <p className="text-xs text-gray-500">
                                JPG, PNG or GIF. Max size 5MB. Recommended 400x400px.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Personal Information */}
                      <div className="bg-white border border-gray-200 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                            <input
                              type="text"
                              value={formData.name?.split(' ')[0] || ''}
                              onChange={(e) => handleInputChange('firstName', e.target.value)}
                              disabled={!isEditing}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                            <input
                              type="text"
                              value={formData.name?.split(' ')[1] || ''}
                              onChange={(e) => handleInputChange('lastName', e.target.value)}
                              disabled={!isEditing}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                              <Mail className="w-4 h-4 mr-2" />
                              Email Address
                            </label>
                            <input
                              type="email"
                              value={formData.email || ''}
                              onChange={(e) => handleInputChange('email', e.target.value)}
                              disabled={!isEditing}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                              <Phone className="w-4 h-4 mr-2" />
                              Phone Number
                            </label>
                            <input
                              type="tel"
                              value={formData.phone || ''}
                              onChange={(e) => handleInputChange('phone', e.target.value)}
                              disabled={!isEditing}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                      {/* Work Information */}
                      <div className="bg-white border border-gray-200 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                          <Briefcase className="w-5 h-5 mr-2" />
                          Work Information
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                            <input
                              type="text"
                              value={formData.position || ''}
                              onChange={(e) => handleInputChange('position', e.target.value)}
                              disabled={!isEditing}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                            <select 
                              value={formData.department || ''}
                              onChange={(e) => handleInputChange('department', e.target.value)}
                              disabled={!isEditing}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                            >
                              <option>Engineering</option>
                              <option>Design</option>
                              <option>Marketing</option>
                              <option>Sales</option>
                              <option>HR</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Team</label>
                            <select 
                              value={formData.team || ''}
                              onChange={(e) => handleInputChange('team', e.target.value)}
                              disabled={!isEditing}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                            >
                              <option>Mobile Development</option>
                              <option>Web Development</option>
                              <option>DevOps</option>
                              <option>QA</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Manager</label>
                            <select 
                              value={formData.manager || ''}
                              onChange={(e) => handleInputChange('manager', e.target.value)}
                              disabled={!isEditing}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                            >
                              <option>Kris Middleton</option>
                              <option>Sarah Johnson</option>
                              <option>Mike Chen</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                            <input
                              type="text"
                              value={formData.location || ''}
                              onChange={(e) => handleInputChange('location', e.target.value)}
                              disabled={!isEditing}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Enhanced Action Buttons */}
              {isEditing && (
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 mt-8">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg font-medium transition-all flex items-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedHeaderWithProfile;