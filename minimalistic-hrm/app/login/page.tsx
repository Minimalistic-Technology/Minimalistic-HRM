// // "use client"
// // import { useState } from 'react';

// // interface LoginForm {
// //   email: string;
// //   password: string;
// //   role: string;
// // }

// // const LoginPage = () => {
// //   const [formData, setFormData] = useState<LoginForm>({
// //     email: '',
// //     password: '',
// //     role: ''
// //   });
  
// //   const [errors, setErrors] = useState<Partial<LoginForm>>({});
// //   const [isLoading, setIsLoading] = useState<boolean>(false);

// //   const roles = [
// //     { value: 'admin', label: 'Administrator' },
// //     { value: 'user', label: 'User' }
// //   ];

// //   const validateForm = (): boolean => {
// //     const newErrors: Partial<LoginForm> = {};

// //     if (!formData.email) {
// //       newErrors.email = 'Email is required';
// //     } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
// //       newErrors.email = 'Email is invalid';
// //     }

// //     if (!formData.password) {
// //       newErrors.password = 'Password is required';
// //     } else if (formData.password.length < 6) {
// //       newErrors.password = 'Password must be at least 6 characters';
// //     }

// //     if (!formData.role) {
// //       newErrors.role = 'Please select a role';
// //     }

// //     setErrors(newErrors);
// //     return Object.keys(newErrors).length === 0;
// //   };

// //   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
// //     const { name, value } = e.target;
// //     setFormData(prev => ({
// //       ...prev,
// //       [name]: value
// //     }));
    
// //     // Clear error when user starts typing
// //     if (errors[name as keyof LoginForm]) {
// //       setErrors(prev => ({
// //         ...prev,
// //         [name]: undefined
// //       }));
// //     }
// //   };

// //   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
// //     e.preventDefault();
    
// //     if (!validateForm()) return;

// //     setIsLoading(true);
    
// //     try {
// //       // Simulate API call
// //       await new Promise(resolve => setTimeout(resolve, 2000));
      
// //       // Here you would typically make an API call to your authentication endpoint
// //       console.log('Login attempt:', formData);
// //       alert(`Login successful! Welcome ${formData.role}!`);
      
// //     } catch (error) {
// //       console.error('Login failed:', error);
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };

// //   return (
// //     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
// //       <div className="max-w-md w-full space-y-8">
// //         <div className="bg-white rounded-2xl shadow-xl p-8">
// //           {/* Header */}
// //           <div className="text-center mb-8">
// //             <div className="mx-auto h-12 w-12 bg-indigo-600 rounded-full flex items-center justify-center mb-4">
// //               <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// //                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
// //               </svg>
// //             </div>
// //             <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
// //             <p className="mt-2 text-gray-600">Please sign in to your account</p>
// //           </div>

// //           {/* Form */}
// //           <div className="space-y-6">
// //             {/* Email Field */}
// //             <div>
// //               <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
// //                 Email Address
// //               </label>
// //               <input
// //                 id="email"
// //                 name="email"
// //                 type="email"
// //                 value={formData.email}
// //                 onChange={handleInputChange}
// //                 className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
// //                   errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
// //                 }`}
// //                 placeholder="Enter your email"
// //               />
// //               {errors.email && (
// //                 <p className="mt-1 text-sm text-red-600 flex items-center">
// //                   <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
// //                     <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
// //                   </svg>
// //                   {errors.email}
// //                 </p>
// //               )}
// //             </div>

// //             {/* Password Field */}
// //             <div>
// //               <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
// //                 Password
// //               </label>
// //               <input
// //                 id="password"
// //                 name="password"
// //                 type="password"
// //                 value={formData.password}
// //                 onChange={handleInputChange}
// //                 className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
// //                   errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'
// //                 }`}
// //                 placeholder="Enter your password"
// //               />
// //               {errors.password && (
// //                 <p className="mt-1 text-sm text-red-600 flex items-center">
// //                   <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
// //                     <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
// //                   </svg>
// //                   {errors.password}
// //                 </p>
// //               )}
// //             </div>

// //             {/* Role Field */}
// //             <div>
// //               <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
// //                 Role
// //               </label>
// //               <select
// //                 id="role"
// //                 name="role"
// //                 value={formData.role}
// //                 onChange={handleInputChange}
// //                 className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors bg-white ${
// //                   errors.role ? 'border-red-500 bg-red-50' : 'border-gray-300'
// //                 }`}
// //               >
// //                 <option value="">Select the role</option>
// //                 {roles.map((role) => (
// //                   <option key={role.value} value={role.value}>
// //                     {role.label}
// //                   </option>
// //                 ))}
// //               </select>
// //               {errors.role && (
// //                 <p className="mt-1 text-sm text-red-600 flex items-center">
// //                   <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
// //                     <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
// //                   </svg>
// //                   {errors.role}
// //                 </p>
// //               )}
// //             </div>

// //             {/* Submit Button */}
// //             <button
// //               type="button"
// //               onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent<HTMLFormElement>)}
// //               disabled={isLoading}
// //               className="w-full bg-indigo-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
// //             >
// //               {isLoading ? (
// //                 <>
// //                   <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
// //                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
// //                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
// //                   </svg>
// //                   Signing In...
// //                 </>
// //               ) : (
// //                 'Sign In'
// //               )}
// //             </button>
// //           </div>


// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default LoginPage;








// "use client";
// import { useState } from 'react';
// import axios from 'axios';
// import { useRouter } from 'next/navigation';

// interface LoginForm {
//   email: string;
//   password: string;
//   role: string;
// }

// const LoginPage = () => {
//   const [formData, setFormData] = useState<LoginForm>({
//     email: '',
//     password: '',
//     role: ''
//   });

//   const [errors, setErrors] = useState<Partial<LoginForm>>({});
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const router = useRouter();

//   const roles = [
//     { value: 'Admin', label: 'Administrator' },
//     { value: 'User', label: 'User' }
//   ];

//   const validateForm = (): boolean => {
//     const newErrors: Partial<LoginForm> = {};

//     if (!formData.email) {
//       newErrors.email = 'Email is required';
//     } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
//       newErrors.email = 'Email is invalid';
//     }

//     if (!formData.password) {
//       newErrors.password = 'Password is required';
//     } else if (formData.password.length < 6) {
//       newErrors.password = 'Password must be at least 6 characters';
//     }

//     if (!formData.role) {
//       newErrors.role = 'Please select a role';
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));

//     if (errors[name as keyof LoginForm]) {
//       setErrors(prev => ({
//         ...prev,
//         [name]: undefined
//       }));
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();

//     console.log('Form Data:', formData); // Debug: Log form data being sent

//     if (!validateForm()) return;

//     setIsLoading(true);

//     try {
//       // Updated endpoint to match backend route
//       const response = await axios.post('http://localhost:5000/api/access-control/login', formData);

//       if (response.data.success) {
//         const token = response.data.token;
//         const user = response.data.user;

//         localStorage.setItem('token', token);
//         localStorage.setItem('userRole', user.role);
//         localStorage.setItem('userId', user._id);
//         localStorage.setItem('username', user.username);

//         // alert(`Login successful! Welcome ${user.username} (${user.role})`);

//         if (user.role === 'Admin') {
//           router.push('/admin');
//         } else {
//           router.push('/user/dashboard');
//         }
//       } else {
//         alert(response.data.message || 'Login failed');
//       }
//     } catch (error: any) {
//       console.error('Login error:', error.response?.data); // Debug: Log error details
//       alert(error.response?.data?.message || 'Login failed. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
//       <div className="max-w-md w-full space-y-8">
//         <div className="bg-white rounded-2xl shadow-xl p-8">
//           <div className="text-center mb-8">
//             <div className="mx-auto h-12 w-12 bg-indigo-600 rounded-full flex items-center justify-center mb-4">
//               <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//               </svg>
//             </div>
//             <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
//             <p className="mt-2 text-gray-600">Please sign in to your account</p>
//           </div>

//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div>
//               <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
//               <input
//                 id="email"
//                 name="email"
//                 type="email"
//                 value={formData.email}
//                 onChange={handleInputChange}
//                 className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
//                 placeholder="Enter your email"
//               />
//               {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
//             </div>

//             <div>
//               <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
//               <input
//                 id="password"
//                 name="password"
//                 type="password"
//                 value={formData.password}
//                 onChange={handleInputChange}
//                 className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
//                 placeholder="Enter your password"
//               />
//               {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
//             </div>

//             <div>
//               <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">Role</label>
//               <select
//                 id="role"
//                 name="role"
//                 value={formData.role}
//                 onChange={handleInputChange}
//                 className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white transition-colors ${errors.role ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
//               >
//                 <option value="">Select the role</option>
//                 {roles.map((role) => (
//                   <option key={role.value} value={role.value}>
//                     {role.label}
//                   </option>
//                 ))}
//               </select>
//               {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role}</p>}
//             </div>

//             <button
//               type="submit"
//               disabled={isLoading}
//               className="w-full bg-indigo-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
//             >
//               {isLoading ? (
//                 <>
//                   <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                   </svg>
//                   Signing In...
//                 </>
//               ) : (
//                 'Sign In'
//               )}
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LoginPage;








"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import {jwtDecode} from "jwt-decode"; // Import jwt-decode

interface LoginForm {
  email: string;
  password: string;
  role: string;
}

interface JwtPayload {
  role: string;
  // Add other properties that might be in your token if needed
}

const LoginPage = () => {
  const [formData, setFormData] = useState<LoginForm>({
    email: "",
    password: "",
    role: "",
  });

  const [errors, setErrors] = useState<Partial<LoginForm>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const router = useRouter();

  // Roles array - adjust 'value' if backend expects 'Administrator' instead of 'admin'
  const roles = [
    { value: "Admin", label: "Admin" },
    { value: "User", label: "User" },
  ];

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginForm> = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.role) {
      newErrors.role = "Please select a role";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof LoginForm]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
    setApiError(null); // Clear API error when user modifies input
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log("Form Data being sent:", JSON.stringify(formData, null, 2)); // Detailed log

    if (!validateForm()) return;

    setIsLoading(true);
    setApiError(null);

    try {
      const response = await axios.post(
        "http://localhost:5000/access-control/login",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("API Response:", JSON.stringify(response.data, null, 2)); // Detailed log

      if (response.data.success) {
        const { token, user } = response.data;
        console.log("User role received:", user.role);
        localStorage.setItem("token", token);
        localStorage.setItem("userRole", user.role);
        localStorage.setItem("userId", user._id);
        localStorage.setItem("username", user.username);

        // Decode the token to get the role
        const decodedToken: JwtPayload = jwtDecode(token);

        alert("Login successful!");

        // Redirect based on the role from the decoded token
        if (decodedToken.role === "Admin") {
          router.push("/admin/dashboard");
        } else {
          router.push("/");
        }
      }
    } catch (error: any) {
      console.error("Login error details:", JSON.stringify(error.response?.data, null, 2)); // Detailed log
      setApiError(
        error.response?.data?.message ||
          "Login failed. Please check your credentials and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="mx-auto h-12 w-12 bg-indigo-600 rounded-full flex items-center justify-center mb-4">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
            <p className="mt-2 text-gray-600">Please sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={isLoading}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                  errors.email ? "border-red-500 bg-red-50" : "border-gray-300"
                }`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                disabled={isLoading}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                  errors.password ? "border-red-500 bg-red-50" : "border-gray-300"
                }`}
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                disabled={isLoading}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white transition-colors ${
                  errors.role ? "border-red-500 bg-red-50" : "border-gray-300"
                }`}
              >
                <option value="">Select the role</option>
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">{errors.role}</p>
              )}
            </div>

            {apiError && (
              <p className="mt-2 text-sm text-red-600 text-center">{apiError}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

 