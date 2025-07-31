// "use client"
// import React, { useState } from 'react';
// import { User, Plus, Edit2, Trash2, Mail, Shield, Eye, EyeOff } from 'lucide-react';

// // Define interfaces for type safety
// interface UserType {
//   id: number;
//   fullName: string;
//   email: string;
//   password: string;
//   role: string;
//   createdAt: string;
// }

// interface FormData {
//   fullName: string;
//   email: string;
//   password: string;
//   role: string;
// }

// interface Role {
//   value: string;
//   label: string;
//   color: string;
// }

// const UserManager: React.FC = () => {
//   const [users, setUsers] = useState<UserType[]>([]);
//   const [showForm, setShowForm] = useState<boolean>(false);
//   const [editingUser, setEditingUser] = useState<UserType | null>(null);
//   const [showPassword, setShowPassword] = useState<boolean>(false);
  
//   const [formData, setFormData] = useState<FormData>({
//     fullName: '',
//     email: '',
//     password: '',
//     role: 'user'
//   });

//   const roles: Role[] = [
//     { value: 'admin', label: 'Administrator', color: 'bg-red-100 text-red-800' },
//     { value: 'user', label: 'User', color: 'bg-green-100 text-green-800' }
//   ];

//   const resetForm = (): void => {
//     setFormData({
//       fullName: '',
//       email: '',
//       password: '',
//       role: 'user'
//     });
//     setEditingUser(null);
//     setShowForm(false);
//     setShowPassword(false);
//   };

//   const handleSubmit = (): void => {
//     if (!formData.fullName || !formData.email || !formData.password) {
//       alert('Please fill in all required fields');
//       return;
//     }

//     if (editingUser) {
//       setUsers(users.map((user: UserType) => 
//         user.id === editingUser.id 
//           ? { 
//               id: editingUser.id,
//               fullName: formData.fullName,
//               email: formData.email,
//               password: formData.password,
//               role: formData.role,
//               createdAt: user.createdAt 
//             }
//           : user
//       ));
//     } else {
//       const newUser: UserType = {
//         id: Date.now(),
//         fullName: formData.fullName,
//         email: formData.email,
//         password: formData.password,
//         role: formData.role,
//         createdAt: new Date().toLocaleDateString()
//       };
//       setUsers([...users, newUser]);
//     }
    
//     resetForm();
//   };

//   const handleEdit = (user: UserType): void => {
//     setFormData({
//       fullName: user.fullName,
//       email: user.email,
//       password: user.password,
//       role: user.role
//     });
//     setEditingUser(user);
//     setShowForm(true);
//   };

//   const handleDelete = (userId: number): void => {
//     if (window.confirm('Are you sure you want to delete this user?')) {
//       setUsers(users.filter((user: UserType) => user.id !== userId));
//     }
//   };

//   const getRoleInfo = (roleValue: string): Role => {
//     return roles.find((role: Role) => role.value === roleValue) || roles[1];
//   };

//   return (
//     <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
//       <div className="bg-white rounded-lg shadow-sm">
//         <div className="p-6 border-b border-gray-200">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <div className="p-2 bg-blue-100 rounded-lg">
//                 <User className="w-6 h-6 text-blue-600" />
//               </div>
//               <div>
//                 <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
//                 <p className="text-gray-600">Manage users, roles, and permissions</p>
//               </div>
//             </div>
//             <button
//               onClick={() => setShowForm(true)}
//               className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//             >
//               <Plus className="w-4 h-4" />
//               Add User
//             </button>
//           </div>
//         </div>

//         {showForm && (
//           <div className="p-6 bg-gray-50 border-b border-gray-200">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Full Name *
//                 </label>
//                 <input
//                   type="text"
//                   value={formData.fullName}
//                   onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, fullName: e.target.value})}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   placeholder="Enter full name"
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Email Address *
//                 </label>
//                 <input
//                   type="email"
//                   value={formData.email}
//                   onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, email: e.target.value})}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   placeholder="Enter email address"
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Password *
//                 </label>
//                 <div className="relative">
//                   <input
//                     type={showPassword ? "text" : "password"}
//                     value={formData.password}
//                     onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, password: e.target.value})}
//                     className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     placeholder="Enter password"
//                     required
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                   >
//                     {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//                   </button>
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Role *
//                 </label>
//                 <select
//                   value={formData.role}
//                   onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({...formData, role: e.target.value})}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 >
//                   {roles.map((role: Role) => (
//                     <option key={role.value} value={role.value}>
//                       {role.label}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div className="md:col-span-2 flex gap-3 pt-4">
//                 <button
//                   onClick={handleSubmit}
//                   className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//                 >
//                   {editingUser ? 'Update User' : 'Add User'}
//                 </button>
//                 <button
//                   onClick={resetForm}
//                   className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         <div className="p-6">
//           {users.length === 0 ? (
//             <div className="text-center py-12">
//               <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//               <h3 className="text-lg font-medium text-gray-900 mb-2">No users yet</h3>
//               <p className="text-gray-600">Get started by adding your first user.</p>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead>
//                   <tr className="border-b border-gray-200">
//                     <th className="text-left py-3 px-4 font-medium text-gray-700">User</th>
//                     <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
//                     <th className="text-left py-3 px-4 font-medium text-gray-700">Role</th>
//                     <th className="text-left py-3 px-4 font-medium text-gray-700">Created</th>
//                     <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {users.map((user: UserType) => {
//                     const roleInfo: Role = getRoleInfo(user.role);
//                     return (
//                       <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
//                         <td className="py-4 px-4">
//                           <div className="flex items-center gap-3">
//                             <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
//                               <User className="w-5 h-5 text-blue-600" />
//                             </div>
//                             <div>
//                               <div className="font-medium text-gray-900">{user.fullName}</div>
//                             </div>
//                           </div>
//                         </td>
//                         <td className="py-4 px-4">
//                           <div className="flex items-center gap-2 text-gray-600">
//                             <Mail className="w-4 h-4" />
//                             {user.email}
//                           </div>
//                         </td>
//                         <td className="py-4 px-4">
//                           <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${roleInfo.color}`}>
//                             <Shield className="w-3 h-3" />
//                             {roleInfo.label}
//                           </span>
//                         </td>
//                         <td className="py-4 px-4 text-gray-600">
//                           {user.createdAt}
//                         </td>
//                         <td className="py-4 px-4">
//                           <div className="flex gap-2">
//                             <button
//                               onClick={() => handleEdit(user)}
//                               className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
//                               title="Edit user"
//                             >
//                               <Edit2 className="w-4 h-4" />
//                             </button>
//                             <button
//                               onClick={() => handleDelete(user.id)}
//                               className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
//                               title="Delete user"
//                             >
//                               <Trash2 className="w-4 h-4" />
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>

//         {users.length > 0 && (
//           <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
//             <p className="text-sm text-gray-600">
//               Total users: <span className="font-medium">{users.length}</span>
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default UserManager;











// "use client"
// import React, { useState, useEffect } from 'react';
// import { User, Plus, Edit2, Trash2, Mail, Shield, Eye, EyeOff, Loader2 } from 'lucide-react';

// // Define interfaces for type safety
// interface UserType {
//   _id: string;
//   username: string;
//   email: string;
//   role: string;
//   createdAt: string;
//   updatedAt: string;
// }

// interface FormData {
//   username: string;
//   email: string;
//   password: string;
//   role: string;
// }

// interface Role {
//   value: string;
//   label: string;
//   color: string;
// }

// const UserManager: React.FC = () => {
//   const [users, setUsers] = useState<UserType[]>([]);
//   const [showForm, setShowForm] = useState<boolean>(false);
//   const [editingUser, setEditingUser] = useState<UserType | null>(null);
//   const [showPassword, setShowPassword] = useState<boolean>(false);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [fetchingUsers, setFetchingUsers] = useState<boolean>(true);
  
//   const [formData, setFormData] = useState<FormData>({
//     username: '',
//     email: '',
//     password: '',
//     role: 'User'
//   });

//   const roles: Role[] = [
//     { value: 'Admin', label: 'Administrator', color: 'bg-red-100 text-red-800' },
//     { value: 'User', label: 'User', color: 'bg-green-100 text-green-800' }
//   ];

//   // API Base URL - adjust this to match your backend
//   const API_BASE_URL = 'http://localhost:5000/api'; // Update with your actual backend URL

//   // Get auth token from localStorage or cookies
//   const getAuthToken = (): string | null => {
//     // Try to get from localStorage first (if stored there)
//     const token = localStorage.getItem('access_token');
//     console.log('Token from localStorage:', token);
//     if (token) return token;
    
//     // Try to get from cookies
//     const cookies = document.cookie.split(';');
//     const accessTokenCookie = cookies.find(cookie => cookie.trim().startsWith('access_token='));
//     if (accessTokenCookie) {
//       const cookieToken = accessTokenCookie.split('=')[1];
//       console.log('Token from cookie:', cookieToken);
//       return cookieToken;
//     }
    
//     console.log('No token found in localStorage or cookies');
//     return null;
//   };

//   // Fetch all users from API
//   const fetchUsers = async (): Promise<void> => {
//     try {
//       console.log('Starting to fetch users...');
//       setFetchingUsers(true);
//       const token = getAuthToken();
      
//       if (!token) {
//         console.error('No auth token found - user needs to login first');
//         alert('Please login first to view users. You need admin access.');
//         setFetchingUsers(false);
//         return;
//       }

//       console.log('Making API request to:', `${API_BASE_URL}/access-control/users`);
//       const response = await fetch(`${API_BASE_URL}/access-control/users`, {
//         method: 'GET',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//         credentials: 'include',
//       });

//       console.log('API Response status:', response.status);
//       console.log('API Response ok:', response.ok);

//       if (response.ok) {
//         const fetchedUsers = await response.json();
//         console.log('Fetched users from API:', fetchedUsers);
//         setUsers(fetchedUsers);
//       } else {
//         const errorText = await response.text();
//         console.error('Failed to fetch users:', response.status, errorText);
//         if (response.status === 401 || response.status === 403) {
//           alert('Unauthorized access. Please login as admin.');
//         } else {
//           alert(`Failed to fetch users: ${response.status} ${response.statusText}`);
//         }
//       }
//     } catch (error) {
//       console.error('Error fetching users:', error);
//       alert('Failed to fetch users. Please check your connection and backend server.');
//     } finally {
//       setFetchingUsers(false);
//     }
//   };

//   // Add new user via API
//   const addUser = async (userData: FormData): Promise<boolean> => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/access-control/signup`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         credentials: 'include',
//         body: JSON.stringify(userData),
//       });

//       if (response.ok) {
//         const result = await response.json();
//         console.log('User added successfully:', result);
//         return true;
//       } else {
//         const error = await response.json();
//         alert(error.message || 'Failed to add user');
//         return false;
//       }
//     } catch (error) {
//       console.error('Error adding user:', error);
//       alert('Failed to add user. Please check your connection.');
//       return false;
//     }
//   };

//   // Load users on component mount
//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   const resetForm = (): void => {
//     setFormData({
//       username: '',
//       email: '',
//       password: '',
//       role: 'User'
//     });
//     setEditingUser(null);
//     setShowForm(false);
//     setShowPassword(false);
//   };

//   const handleSubmit = async (): Promise<void> => {
//     if (!formData.username || !formData.email || !formData.password) {
//       alert('Please fill in all required fields');
//       return;
//     }

//     // Basic email validation
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(formData.email)) {
//       alert('Please enter a valid email address');
//       return;
//     }

//     // Password validation
//     if (formData.password.length < 6) {
//       alert('Password must be at least 6 characters long');
//       return;
//     }

//     setLoading(true);

//     try {
//       if (editingUser) {
//         // For editing, you might need to implement an update API endpoint
//         // For now, just update locally
//         setUsers(users.map((user: UserType) => 
//           user._id === editingUser._id 
//             ? { 
//                 ...user,
//                 username: formData.username,
//                 email: formData.email,
//                 role: formData.role,
//                 updatedAt: new Date().toISOString()
//               }
//             : user
//         ));
//         alert('User updated successfully (local update)');
//       } else {
//         // Add new user
//         const success = await addUser(formData);
//         if (success) {
//           // Refresh the users list after successful addition
//           await fetchUsers();
//           alert('User added successfully!');
//         }
//       }
      
//       resetForm();
//     } catch (error) {
//       console.error('Error in handleSubmit:', error);
//       alert('An error occurred. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleEdit = (user: UserType): void => {
//     setFormData({
//       username: user.username,
//       email: user.email,
//       password: '', // Don't populate password for security
//       role: user.role
//     });
//     setEditingUser(user);
//     setShowForm(true);
//   };

//   const handleDelete = (userId: string): void => {
//     if (window.confirm('Are you sure you want to delete this user?')) {
//       // For now, delete locally. You can implement a delete API endpoint later
//       setUsers(users.filter((user: UserType) => user._id !== userId));
//       alert('User deleted (local delete)');
//     }
//   };

//   const getRoleInfo = (roleValue: string): Role => {
//     return roles.find((role: Role) => role.value === roleValue) || roles[1];
//   };

//   const formatDate = (dateString: string): string => {
//     return new Date(dateString).toLocaleDateString();
//   };

//   if (fetchingUsers) {
//     return (
//       <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
//         <div className="bg-white rounded-lg shadow-sm p-12">
//           <div className="flex items-center justify-center">
//             <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-3" />
//             <span className="text-lg text-gray-600">Loading users...</span>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
//       <div className="bg-white rounded-lg shadow-sm">
//         <div className="p-6 border-b border-gray-200">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <div className="p-2 bg-blue-100 rounded-lg">
//                 <User className="w-6 h-6 text-blue-600" />
//               </div>
//               <div>
//                 <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
//                 <p className="text-gray-600">Manage users, roles, and permissions</p>
//               </div>
//             </div>
//             <button
//               onClick={() => setShowForm(true)}
//               className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//               disabled={loading}
//             >
//               <Plus className="w-4 h-4" />
//               Add User
//             </button>
//           </div>
//         </div>

//         {showForm && (
//           <div className="p-6 bg-gray-50 border-b border-gray-200">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Username *
//                 </label>
//                 <input
//                   type="text"
//                   value={formData.username}
//                   onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, username: e.target.value})}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   placeholder="Enter username"
//                   required
//                   disabled={loading}
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Email Address *
//                 </label>
//                 <input
//                   type="email"
//                   value={formData.email}
//                   onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, email: e.target.value})}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   placeholder="Enter email address"
//                   required
//                   disabled={loading}
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Password * {editingUser && <span className="text-xs text-gray-500">(leave blank to keep current)</span>}
//                 </label>
//                 <div className="relative">
//                   <input
//                     type={showPassword ? "text" : "password"}
//                     value={formData.password}
//                     onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, password: e.target.value})}
//                     className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     placeholder={editingUser ? "Enter new password" : "Enter password"}
//                     required={!editingUser}
//                     disabled={loading}
//                     minLength={6}
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                     disabled={loading}
//                   >
//                     {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//                   </button>
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Role *
//                 </label>
//                 <select
//                   value={formData.role}
//                   onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({...formData, role: e.target.value})}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   disabled={loading}
//                 >
//                   {roles.map((role: Role) => (
//                     <option key={role.value} value={role.value}>
//                       {role.label}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div className="md:col-span-2 flex gap-3 pt-4">
//                 <button
//                   onClick={handleSubmit}
//                   disabled={loading}
//                   className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   {loading && <Loader2 className="w-4 h-4 animate-spin" />}
//                   {editingUser ? 'Update User' : 'Add User'}
//                 </button>
//                 <button
//                   onClick={resetForm}
//                   disabled={loading}
//                   className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         <div className="p-6">
//           <div className="mb-4 p-4 bg-gray-100 rounded-lg">
//             <h3 className="font-semibold text-gray-700 mb-2">Debug Info:</h3>
//             <p className="text-sm text-gray-600">Users count: {users.length}</p>
//             <p className="text-sm text-gray-600">Fetching: {fetchingUsers ? 'Yes' : 'No'}</p>
//             <p className="text-sm text-gray-600">API URL: {API_BASE_URL}</p>
//             <p className="text-sm text-gray-600">Has Token: {getAuthToken() ? 'Yes' : 'No'}</p>
//           </div>
          
//           {users.length === 0 ? (
//             <div className="text-center py-12">
//               <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//               <h3 className="text-lg font-medium text-gray-900 mb-2">No users yet</h3>
//               <p className="text-gray-600">Get started by adding your first user.</p>
//               <button 
//                 onClick={fetchUsers}
//                 className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//               >
//                 Retry Fetch Users
//               </button>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead>
//                   <tr className="border-b border-gray-200">
//                     <th className="text-left py-3 px-4 font-medium text-gray-700">User</th>
//                     <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
//                     <th className="text-left py-3 px-4 font-medium text-gray-700">Role</th>
//                     <th className="text-left py-3 px-4 font-medium text-gray-700">Created</th>
//                     <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {users.map((user: UserType) => {
//                     const roleInfo: Role = getRoleInfo(user.role);
//                     return (
//                       <tr key={user._id} className="border-b border-gray-100 hover:bg-gray-50">
//                         <td className="py-4 px-4">
//                           <div className="flex items-center gap-3">
//                             <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
//                               <User className="w-5 h-5 text-blue-600" />
//                             </div>
//                             <div>
//                               <div className="font-medium text-gray-900">{user.username}</div>
//                             </div>
//                           </div>
//                         </td>
//                         <td className="py-4 px-4">
//                           <div className="flex items-center gap-2 text-gray-600">
//                             <Mail className="w-4 h-4" />
//                             {user.email}
//                           </div>
//                         </td>
//                         <td className="py-4 px-4">
//                           <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${roleInfo.color}`}>
//                             <Shield className="w-3 h-3" />
//                             {roleInfo.label}
//                           </span>
//                         </td>
//                         <td className="py-4 px-4 text-gray-600">
//                           {formatDate(user.createdAt)}
//                         </td>
//                         <td className="py-4 px-4">
//                           <div className="flex gap-2">
//                             <button
//                               onClick={() => handleEdit(user)}
//                               className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
//                               title="Edit user"
//                               disabled={loading}
//                             >
//                               <Edit2 className="w-4 h-4" />
//                             </button>
//                             <button
//                               onClick={() => handleDelete(user._id)}
//                               className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
//                               title="Delete user"
//                               disabled={loading}
//                             >
//                               <Trash2 className="w-4 h-4" />
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>

//         {users.length > 0 && (
//           <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
//             <p className="text-sm text-gray-600">
//               Total users: <span className="font-medium">{users.length}</span>
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default UserManager;









"use client"
import React, { useState, useEffect } from 'react';
import { User, Plus, Edit2, Trash2, Mail, Shield, Eye, EyeOff, Loader2 } from 'lucide-react';

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

const UserManager: React.FC = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchingUsers, setFetchingUsers] = useState<boolean>(true);
  
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
  const API_BASE_URL = 'http://localhost:5000/api/checksession'; // Update with your actual backend URL

  // Get auth token from localStorage or cookies
  const getAuthToken = (): string | null => {
    // Try to get from localStorage first (if stored there)
    const token = localStorage.getItem('access_token');
    console.log('Token from localStorage:', token);
    if (token) return token;
    
    // Try to get from cookies
    const cookies = document.cookie.split(';');
    const accessTokenCookie = cookies.find(cookie => cookie.trim().startsWith('access_token='));
    console.log('Cookies:', cookies); // Debug cookies
    if (accessTokenCookie) {
      const cookieToken = accessTokenCookie.split('=')[1];
      console.log('Token from cookie:', cookieToken);
      return cookieToken;
    }
    
    console.log('No token found in localStorage or cookies');
    return null;
  };

  // Fetch all users from API
  const fetchUsers = async (): Promise<void> => {
    try {
      console.log('Starting to fetch users...');
      setFetchingUsers(true);
      const token = getAuthToken();

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Only add Authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        console.warn('No auth token found. Attempting request without authentication.');
      }

      console.log('Making API request to:', `${API_BASE_URL}/access-control/users`);
      const response = await fetch(`${API_BASE_URL}/access-control/users`, {
        method: 'GET',
        headers,
        credentials: 'include',
      });

      console.log('API Response status:', response.status);
      console.log('API Response ok:', response.ok);

      if (response.ok) {
        const fetchedUsers = await response.json();
        console.log('Fetched users from API:', fetchedUsers);
        setUsers(fetchedUsers);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch users:', response.status, errorText);
        if (response.status === 404) {
          alert('Users endpoint not found. Please check if the backend API route exists at /api/access-control/users.');
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
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('User added successfully:', result);
        return true;
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to add user');
        return false;
      }
    } catch (error) {
      console.error('Error adding user:', error);
      alert('Failed to add user. Please check your connection.');
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
  };

  const handleSubmit = async (): Promise<void> => {
    if (!formData.username || !formData.email || !formData.password) {
      alert('Please fill in all required fields');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('Please enter a valid email address');
      return;
    }

    // Password validation
    if (formData.password.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      if (editingUser) {
        // For editing, you might need to implement an update API endpoint
        // For now, just update locally
        setUsers(users.map((user: UserType) => 
          user._id === editingUser._id 
            ? { 
                ...user,
                username: formData.username,
                email: formData.email,
                role: formData.role,
                updatedAt: new Date().toISOString()
              }
            : user
        ));
        alert('User updated successfully (local update)');
      } else {
        // Add new user
        const success = await addUser(formData);
        if (success) {
          // Refresh the users list after successful addition
          await fetchUsers();
          alert('User added successfully!');
        }
      }
      
      resetForm();
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
      password: '', // Don't populate password for security
      role: user.role
    });
    setEditingUser(user);
    setShowForm(true);
  };

  const handleDelete = (userId: string): void => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      // For now, delete locally. You can implement a delete API endpoint later
      setUsers(users.filter((user: UserType) => user._id !== userId));
      alert('User deleted (local delete)');
    }
  };

  const getRoleInfo = (roleValue: string): Role => {
    return roles.find((role: Role) => role.value === roleValue) || roles[1];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, username: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter username"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter email address"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password * {editingUser && <span className="text-xs text-gray-500">(leave blank to keep current)</span>}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={editingUser ? "Enter new password" : "Enter password"}
                    required={!editingUser}
                    disabled={loading}
                    minLength={6}
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role *
                </label>
                <select
                  value={formData.role}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({...formData, role: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                >
                  {roles.map((role: Role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
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
                              onClick={() => handleDelete(user._id)}
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