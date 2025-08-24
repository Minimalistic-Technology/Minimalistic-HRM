


"use client"
import React, { useState, useEffect } from 'react';
import { User, Plus, Edit2, Trash2, Mail, Shield, Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

// Define interfaces for type safety
interface UserType {
  _id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  username: string;
  email: string;
  password: string;
  role: string;
}

interface Role {
  value: string;
  label: string;
  color: string;
}

interface ValidationErrors {
  username?: string;
  email?: string;
  password?: string;
  role?: string;
}

const UserManager: React.FC = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchingUsers, setFetchingUsers] = useState<boolean>(true);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    role: 'User'
  });

  const roles: Role[] = [
    { value: 'Admin', label: 'Administrator', color: 'bg-red-100 text-red-800' },
    { value: 'User', label: 'User', color: 'bg-green-100 text-green-800' }
  ];

  // API Base URL - adjust this to match your backend
  const API_BASE_URL = 'http://localhost:5000/api/hrm';

  // Get auth token from localStorage or cookies
  const getAuthToken = (): string | null => {
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    if (token) return token;
    
    const cookies = document.cookie.split(';');
    const accessTokenCookie = cookies.find(cookie => cookie.trim().startsWith('access_token='));
    if (accessTokenCookie) {
      return accessTokenCookie.split('=')[1];
    }
    
    return null;
  };

  // Enhanced email validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email.toLowerCase());
  };

  // Enhanced password validation
  const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('At least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('At least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('At least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('At least one number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('At least one special character (!@#$%^&*(),.?":{}|<>)');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  // Username validation
  const validateUsername = (username: string): boolean => {
    return username.trim().length >= 3 && /^[a-zA-Z0-9_-]+$/.test(username);
  };

  // Check if email already exists
  const checkEmailExists = (email: string, excludeUserId?: string): boolean => {
    return users.some(user => 
      user.email.toLowerCase() === email.toLowerCase() && 
      user._id !== excludeUserId
    );
  };

  // Comprehensive form validation
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    let isValid = true;

    // Username validation
    if (!formData.username.trim()) {
      errors.username = 'Username is required';
      isValid = false;
    } else if (!validateUsername(formData.username)) {
      errors.username = 'Username must be at least 3 characters and contain only letters, numbers, hyphens, and underscores';
      isValid = false;
    }

    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address (e.g., user@example.com)';
      isValid = false;
    } else if (checkEmailExists(formData.email, editingUser?._id)) {
      errors.email = 'This email address is already registered';
      isValid = false;
    }

    // Password validation
    if (!editingUser && !formData.password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (formData.password) {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        errors.password = `Password must contain: ${passwordValidation.errors.join(', ')}`;
        isValid = false;
      }
    }

    // Role validation
    if (!formData.role) {
      errors.role = 'Please select a role';
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  // Format email to lowercase
  const formatEmail = (email: string): string => {
    return email.toLowerCase().trim();
  };

  // Fetch all users from API
  const fetchUsers = async (): Promise<void> => {
    try {
      setFetchingUsers(true);
      const token = getAuthToken();

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/access-control/users`, {
        method: 'GET',
        headers,
        credentials: 'include',
      });

      if (response.ok) {
        const fetchedUsers = await response.json();
        setUsers(fetchedUsers);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch users:', response.status, errorText);
        if (response.status === 404) {
          alert('Users endpoint not found. Please check if the backend API route exists.');
        } else if (response.status === 401 || response.status === 403) {
          alert('Unauthorized access. Please ensure you are logged in with the correct credentials.');
        } else {
          alert(`Failed to fetch users: ${response.status} ${response.statusText}`);
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Failed to fetch users. Please check your connection and backend server.');
    } finally {
      setFetchingUsers(false);
    }
  };

  // Add new user via API
  const addUser = async (userData: FormData): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/access-control/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...userData,
          email: formatEmail(userData.email)
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('User added successfully:', result);
        return true;
      } else {
        const error = await response.json();
        if (error.message && error.message.includes('Email already exists')) {
          setValidationErrors({ email: 'This email address is already registered' });
        }
        alert(error.message || 'Failed to add user');
        return false;
      }
    } catch (error) {
      console.error('Error adding user:', error);
      alert('Failed to add user. Please check your connection.');
      return false;
    }
  };

  // Update user via API
  const updateUser = async (userId: string, userData: Partial<FormData>): Promise<boolean> => {
    try {
      const token = getAuthToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const updateData = { ...userData };
      if (!updateData.password) {
        delete updateData.password;
      }
      
      if (updateData.email) {
        updateData.email = formatEmail(updateData.email);
      }

      const response = await fetch(`${API_BASE_URL}/access-control/user/${userId}`, {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('User updated successfully:', result);
        return true;
      } else {
        const error = await response.json().catch(() => ({ message: 'Failed to update user' }));
        if (error.message && error.message.includes('Email already exists')) {
          setValidationErrors({ email: 'This email address is already registered' });
        }
        alert(error.message || 'Failed to update user');
        return false;
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user. Please check your connection.');
      return false;
    }
  };

  // Delete user via API
  const deleteUserAPI = async (userId: string): Promise<boolean> => {
    try {
      const token = getAuthToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/access-control/user/${userId}`, {
        method: 'DELETE',
        headers,
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        console.log('User deleted successfully:', result);
        return true;
      } else {
        const error = await response.json().catch(() => ({ message: 'Failed to delete user' }));
        alert(error.message || 'Failed to delete user');
        return false;
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user. Please check your connection.');
      return false;
    }
  };

  // Load users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const resetForm = (): void => {
    setFormData({
      username: '',
      email: '',
      password: '',
      role: 'User'
    });
    setEditingUser(null);
    setShowForm(false);
    setShowPassword(false);
    setValidationErrors({});
  };

  const handleInputChange = (field: keyof FormData, value: string): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error for this field when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (editingUser) {
        const success = await updateUser(editingUser._id, formData);
        if (success) {
          await fetchUsers();
          alert('User updated successfully!');
          resetForm();
        }
      } else {
        const success = await addUser(formData);
        if (success) {
          await fetchUsers();
          alert('User added successfully!');
          resetForm();
        }
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: UserType): void => {
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      role: user.role
    });
    setEditingUser(user);
    setShowForm(true);
    setValidationErrors({});
  };

  const handleDelete = async (userId: string, username: string): Promise<void> => {
    if (window.confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
      setLoading(true);
      try {
        const success = await deleteUserAPI(userId);
        if (success) {
          await fetchUsers();
          alert('User deleted successfully!');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const getRoleInfo = (roleValue: string): Role => {
    return roles.find((role: Role) => role.value === roleValue) || roles[1];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  const getPasswordStrength = (password: string): { strength: string; color: string } => {
    if (!password) return { strength: '', color: '' };
    
    const validation = validatePassword(password);
    const score = 5 - validation.errors.length;
    
    if (score === 5) return { strength: 'Very Strong', color: 'text-green-600' };
    if (score === 4) return { strength: 'Strong', color: 'text-blue-600' };
    if (score === 3) return { strength: 'Medium', color: 'text-yellow-600' };
    if (score === 2) return { strength: 'Weak', color: 'text-orange-600' };
    return { strength: 'Very Weak', color: 'text-red-600' };
  };

  if (fetchingUsers) {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow-sm p-12">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-3" />
            <span className="text-lg text-gray-600">Loading users...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                <p className="text-gray-600">Manage users, roles, and permissions</p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              disabled={loading}
            >
              <Plus className="w-4 h-4" />
              Add User
            </button>
          </div>
        </div>

        {showForm && (
          <div className="p-6 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    validationErrors.username ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter username (min 3 characters, letters, numbers, _, -)"
                  disabled={loading}
                />
                {validationErrors.username && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {validationErrors.username}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    validationErrors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter email address (e.g., user@example.com)"
                  disabled={loading}
                />
                {validationErrors.email && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {validationErrors.email}
                  </p>
                )}
                {formData.email && validateEmail(formData.email) && !validationErrors.email && (
                  <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Valid email format
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password {editingUser ? <span className="text-xs text-gray-500">(leave blank to keep current)</span> : '*'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      validationErrors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={editingUser ? "Enter new password" : "Enter password (min 8 chars, uppercase, lowercase, number, special char)"}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                
                {formData.password && (
                  <div className="mt-2">
                    <div className={`text-sm ${getPasswordStrength(formData.password).color}`}>
                      Password Strength: {getPasswordStrength(formData.password).strength}
                    </div>
                  </div>
                )}
                
                {validationErrors.password && (
                  <p className="mt-1 text-sm text-red-600 flex items-start gap-1">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{validationErrors.password}</span>
                  </p>
                )}
                
                {!editingUser && (
                  <div className="mt-2 text-xs text-gray-600">
                   
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    validationErrors.role ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={loading}
                >
                  {roles.map((role: Role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
                {validationErrors.role && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {validationErrors.role}
                  </p>
                )}
              </div>

              <div className="md:col-span-2 flex gap-3 pt-4">
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingUser ? 'Update User' : 'Add User'}
                </button>
                <button
                  onClick={resetForm}
                  disabled={loading}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="p-6">
          <div className="mb-4 p-4 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-600">Users count: {users.length}</p>
          </div>
          
          {users.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users yet</h3>
              <p className="text-gray-600">Get started by adding your first user.</p>
              <button 
                onClick={fetchUsers}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Retry Fetch Users
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">User</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Role</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Created</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user: UserType) => {
                    const roleInfo: Role = getRoleInfo(user.role);
                    return (
                      <tr key={user._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{user.username}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Mail className="w-4 h-4" />
                            {user.email}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${roleInfo.color}`}>
                            <Shield className="w-3 h-3" />
                            {roleInfo.label}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-gray-600">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(user)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit user"
                              disabled={loading}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(user._id, user.username)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete user"
                              disabled={loading}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {users.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Total users: <span className="font-medium">{users.length}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManager;