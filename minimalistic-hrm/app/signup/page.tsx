// "use client"
// import { useState } from 'react';

// interface SignupForm {
//   fullname: string;
//   email: string;
//   password: string;
//   role: string;
// }

// const SignupPage = () => {
//   const [formData, setFormData] = useState<SignupForm>({
//     fullname: '',
//     email: '',
//     password: '',
//     role: ''
//   });
  
//   const [errors, setErrors] = useState<Partial<SignupForm>>({});
//   const [isLoading, setIsLoading] = useState<boolean>(false);

//   const roles = [
//     { value: 'admin', label: 'Administrator' },
//     { value: 'user', label: 'User' }
//   ];

//   const validateForm = (): boolean => {
//     const newErrors: Partial<SignupForm> = {};

//     if (!formData.fullname) {
//       newErrors.fullname = 'Full name is required';
//     } else if (formData.fullname.trim().length < 2) {
//       newErrors.fullname = 'Full name must be at least 2 characters';
//     }

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
    
//     // Clear error when user starts typing
//     if (errors[name as keyof SignupForm]) {
//       setErrors(prev => ({
//         ...prev,
//         [name]: undefined
//       }));
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
    
//     if (!validateForm()) return;

//     setIsLoading(true);
    
//     try {
//       // Simulate API call
//       await new Promise(resolve => setTimeout(resolve, 2000));
      
//       // Here you would typically make an API call to your registration endpoint
//       console.log('Signup attempt:', formData);
//       alert(`Account created successfully! Welcome ${formData.fullname}!`);
      
//     } catch (error) {
//       console.error('Signup failed:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
//       <div className="max-w-md w-full space-y-8">
//         <div className="bg-white rounded-2xl shadow-xl p-8">
//           {/* Header */}
//           <div className="text-center mb-8">
//             <div className="mx-auto h-12 w-12 bg-indigo-600 rounded-full flex items-center justify-center mb-4">
//               <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
//               </svg>
//             </div>
//             <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
//             <p className="mt-2 text-gray-600">Join us today and get started</p>
//           </div>

//           {/* Form */}
//           <div className="space-y-6">
//             {/* Full Name Field */}
//             <div>
//               <label htmlFor="fullname" className="block text-sm font-medium text-gray-700 mb-2">
//                 Full Name
//               </label>
//               <input
//                 id="fullname"
//                 name="fullname"
//                 type="text"
//                 value={formData.fullname}
//                 onChange={handleInputChange}
//                 className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
//                   errors.fullname ? 'border-red-500 bg-red-50' : 'border-gray-300'
//                 }`}
//                 placeholder="Enter your full name"
//               />
//               {errors.fullname && (
//                 <p className="mt-1 text-sm text-red-600 flex items-center">
//                   <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
//                   </svg>
//                   {errors.fullname}
//                 </p>
//               )}
//             </div>

//             {/* Email Field */}
//             <div>
//               <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
//                 Email Address
//               </label>
//               <input
//                 id="email"
//                 name="email"
//                 type="email"
//                 value={formData.email}
//                 onChange={handleInputChange}
//                 className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
//                   errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
//                 }`}
//                 placeholder="Enter your email"
//               />
//               {errors.email && (
//                 <p className="mt-1 text-sm text-red-600 flex items-center">
//                   <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
//                   </svg>
//                   {errors.email}
//                 </p>
//               )}
//             </div>

//             {/* Password Field */}
//             <div>
//               <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
//                 Password
//               </label>
//               <input
//                 id="password"
//                 name="password"
//                 type="password"
//                 value={formData.password}
//                 onChange={handleInputChange}
//                 className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
//                   errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'
//                 }`}
//                 placeholder="Enter your password"
//               />
//               {errors.password && (
//                 <p className="mt-1 text-sm text-red-600 flex items-center">
//                   <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
//                   </svg>
//                   {errors.password}
//                 </p>
//               )}
//             </div>

//             {/* Role Field */}
//             <div>
//               <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
//                 Role
//               </label>
//               <select
//                 id="role"
//                 name="role"
//                 value={formData.role}
//                 onChange={handleInputChange}
//                 className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors bg-white ${
//                   errors.role ? 'border-red-500 bg-red-50' : 'border-gray-300'
//                 }`}
//               >
//                 <option value="">Select the role</option>
//                 {roles.map((role) => (
//                   <option key={role.value} value={role.value}>
//                     {role.label}
//                   </option>
//                 ))}
//               </select>
//               {errors.role && (
//                 <p className="mt-1 text-sm text-red-600 flex items-center">
//                   <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
//                   </svg>
//                   {errors.role}
//                 </p>
//               )}
//             </div>

//             {/* Submit Button */}
//             <button
//               type="button"
//               onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent<HTMLFormElement>)}
//               disabled={isLoading}
//               className="w-full bg-indigo-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
//             >
//               {isLoading ? (
//                 <>
//                   <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                   </svg>
//                   Creating Account...
//                 </>
//               ) : (
//                 'Create Account'
//               )}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SignupPage;









'use client';

import { useState } from 'react';
import axios from 'axios';

interface SignupForm {
  fullname: string;
  email: string;
  password: string;
  role: string;
}

const SignupPage = () => {
  const [formData, setFormData] = useState<SignupForm>({
    fullname: '',
    email: '',
    password: '',
    role: ''
  });

  const [errors, setErrors] = useState<Partial<SignupForm>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const roles = [
    { value: 'admin', label: 'Administrator' },
    { value: 'user', label: 'User' }
  ];

  const validateForm = (): boolean => {
    const newErrors: Partial<SignupForm> = {};

    if (!formData.fullname || formData.fullname.trim().length < 2) {
      newErrors.fullname = 'Full name must be at least 2 characters';
    }

    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.role) {
      newErrors.role = 'Please select a role';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof SignupForm]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/access-control/signup', {
        username: formData.fullname,
        email: formData.email,
        password: formData.password,
        role: formData.role.charAt(0).toUpperCase() + formData.role.slice(1),
      });

      if (response.status === 201) {
        alert(`✅ ${response.data.message}`);
        setFormData({
          fullname: '',
          email: '',
          password: '',
          role: ''
        });
      }
    } catch (error: any) {
      console.error('Signup failed:', error);
      const message = error.response?.data?.message || 'Signup failed';
      alert(`❌ ${message}`);
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
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
            <p className="mt-2 text-gray-600">Join us today and get started</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="fullname" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                id="fullname"
                name="fullname"
                type="text"
                value={formData.fullname}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                  errors.fullname ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Enter your full name"
              />
              {errors.fullname && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  {errors.fullname}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                  errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                  errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  {errors.password}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors bg-white ${
                  errors.role ? 'border-red-500 bg-red-50' : 'border-gray-300'
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
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  {errors.role}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
