// "use client";

// import { useState, useEffect } from "react";
// import {
//   auth,
//   googleProvider,
//   githubProvider,
//   twitterProvider,
//   facebookProvider,
// } from "../../firebase/firebase";
// import {
//   createUserWithEmailAndPassword,
//   signInWithEmailAndPassword,
//   signOut,
//   signInWithPopup,
//   RecaptchaVerifier,
//   PhoneAuthProvider,
//   multiFactor,
//   PhoneMultiFactorGenerator,
//   onAuthStateChanged,
//   sendEmailVerification,
//   User,
// } from "firebase/auth";
// import axios from "axios";

// declare global {
//   interface Window {
//     recaptchaVerifier: RecaptchaVerifier;
//   }
// }

// export default function AuthPage() {
//   const [isLogin, setIsLogin] = useState(true);
//   const [formData, setFormData] = useState({
//     name: "",
//     role: "default",
//     contact: "",
//     address: "",
//     dateOfJoin: "",
//     email: "",
//     password: "",
//   });
//   const [message, setMessage] = useState("");
//   const [currentUser, setCurrentUser] = useState<User | null>(null);

//   // auth state firebase
//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       setCurrentUser(user);
//     });
//     return () => unsubscribe();
//   }, []);

// // re-captch
//   const setupRecaptcha = () => {
//     if (!window.recaptchaVerifier) {
//       window.recaptchaVerifier = new RecaptchaVerifier(
//         auth,
//         "recaptcha-container",
//         {
//           size: "invisible",
//           callback: (response: any) => console.log("Recaptcha verified"),
//         }
//       );
//     }
//   };

//   //mfa
//   const enrollMFA = async (phoneNumber: string) => {
//     if (!currentUser) {
//       alert("Please login first to enable MFA");
//       return;
//     }

//     if (!currentUser.emailVerified) {
//       alert("Please verify your email first to enable MFA");
//       return;
//     }

//     setupRecaptcha();
//     const appVerifier = window.recaptchaVerifier;

//     try {
//       const session = await multiFactor(currentUser).getSession();
//       const phoneAuthProvider = new PhoneAuthProvider(auth);
//       const verificationId = await phoneAuthProvider.verifyPhoneNumber(
//         { phoneNumber, session },
//         appVerifier
//       );

//       const code = prompt("Enter the verification code sent to your phone");
//       if (!code) return;

//       const cred = PhoneAuthProvider.credential(verificationId, code);
//       const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);

//       await multiFactor(currentUser).enroll(
//         multiFactorAssertion,
//         "My Phone"
//       );
//       alert("MFA enabled successfully!");
//     } catch (error: any) {
//       console.error(error);
//       alert(error.message);
//     }
//   };

//   // email verification 
//   const sendVerificationEmailHandler = async () => {
//     if (!currentUser) return;
//     try {
//       await sendEmailVerification(currentUser);
//       alert("Verification email sent! Please check your inbox.");
//     } catch (error: any) {
//       console.error(error);
//       alert(error.message);
//     }
//   };

//   const handleChange = (e: any) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   // auth handler 
//   const handleAuth = async (e: any) => {
//     e.preventDefault();
//     setMessage("");

//     try {
//       if (isLogin) {
//   const userCredential = await signInWithEmailAndPassword(
//     auth,
//     formData.email,
//     formData.password
//   );

//   const firebaseUser = userCredential.user;
//   console.log(firebaseUser);

//   // ✅ Fetch user role from Mongo using UID
//   const response = await axios.get(
//     `http://localhost:5000/api/hrm/getByUid/${firebaseUser.uid}`
//   );

//   console.log(response);

//   const mongoUser = response.data; 

//   if (!mongoUser) {
//     setMessage("User record not found in MongoDB.");
//     return;
//   }

//   if (mongoUser.role === "User") {
//     window.location.href = "/home";
//   } else if(mongoUser.role === "Admin"){
//     window.location.href = "/dashboard";
//   }else{
//     window.location.href = "/home";   /// change later
//   }


//       } else {
//         const userCredential = await createUserWithEmailAndPassword(
//           auth,
//           formData.email,
//           formData.password
//         );

//         const user = userCredential.user;
//         await axios.post("http://localhost:5000/api/hrm/users", {
//           uid: user.uid,
//           ...formData,
//         });


//         setMessage(
//           `Account created for ${formData.name}. Please verify your email to enable MFA.`
//         );
//       }
//     } catch (error: any) {
//       if (error.code === "auth/multi-factor-auth-required") {
//         const resolver = error.resolver;
//         setupRecaptcha();
//         const appVerifier = window.recaptchaVerifier;
//         const phoneInfoOptions = {
//           multiFactorHint: resolver.hints[0],
//           session: resolver.session,
//         };

//         const phoneAuthProvider = new PhoneAuthProvider(auth);
//         const verificationId = await phoneAuthProvider.verifyPhoneNumber(
//           phoneInfoOptions,
//           appVerifier
//         );

//         const code = prompt("Enter the verification code sent to your phone:");
//         if (!code) return;

//         const cred = PhoneAuthProvider.credential(verificationId, code);
//         const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);

//         const userCredential = await resolver.resolveSignIn(multiFactorAssertion);
//         setMessage(`MFA login successful! Welcome ${userCredential.user.email}`);
//       } else {
//         setMessage(error.message);
//       }
//     }
//   };
// const handleSocialLogin = async (provider: any) => {
//   try {
//     const result = await signInWithPopup(auth, provider);
//     const user = result.user;

//     const userData = {
//       uid: user.uid,
//       name: user.displayName || null,
//       email: user.email || null,
//       role: "default"
//     };

//     await axios.post("http://localhost:5000/api/hrm/users", userData).catch((err) => {
//       if (err.response?.status === 400) {
//         console.log("User already exists in MongoDB");
//       } else {
//         throw err;
//       }
//     });

//     const { data: mongoUser } = await axios.get(
//       `http://localhost:5000/api/hrm/getByUid/${user.uid}`
//     );

//     if (!mongoUser) {
//       setMessage("User record not found in MongoDB.");
//       return;
//     }

//     if (mongoUser.role === "User") {
//       window.location.href = "/user";
//     } else if (mongoUser.role === "Admin") {
//       window.location.href = "/dashboard";
//     } else {
//       window.location.href = "/home";
//     }

//   } catch (error: any) {
//     setMessage(error.message);
//   }
// };

  
//   const handleLogout = async () => {
//     await signOut(auth);
//     setMessage("Logged out successfully.");
//   };

//   return (
//     <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
//       <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
//         {currentUser ? (
//           <>
//             <p className="text-center mb-4">Logged in as {currentUser.email}</p>

//             {!currentUser.emailVerified && (
//               <button
//                 onClick={sendVerificationEmailHandler}
//                 className="w-full bg-yellow-500 text-white rounded-lg py-2 mb-4"
//               >
//                 Verify Email
//               </button>
//             )}

//             {currentUser.emailVerified && (
//               <button
//                 onClick={() =>
//                   enrollMFA(
//                     prompt(
//                       "Enter your phone number with country code, e.g. +919876543210"
//                     ) || ""
//                   )
//                 }
//                 className="w-full bg-green-500 text-white rounded-lg py-2 mb-4"
//               >
//                 Enable MFA (Phone)
//               </button>
//             )}

//             <button
//               onClick={handleLogout}
//               className="w-full bg-gray-200 text-gray-700 rounded-lg py-2 mt-2"
//             >
//               Logout
//             </button>
//           </>
//         ) : (
//           <>
//             <h2 className="text-2xl font-semibold text-center mb-6">
//               {isLogin ? "Login" : "Sign Up"}
//             </h2>

//             <form onSubmit={handleAuth} className="space-y-4">
//               {!isLogin && (
//                 <>
//                   <input
//                     type="text"
//                     name="name"
//                     placeholder="Full Name"
//                     value={formData.name}
//                     onChange={handleChange}
//                     required
//                     className="w-full border rounded-lg px-4 py-2"
//                   />
//                   <input
//                     type="text"
//                     name="contact"
//                     placeholder="Contact"
//                     value={formData.contact}
//                     onChange={handleChange}
//                     required
//                     className="w-full border rounded-lg px-4 py-2"
//                   />
//                   <input
//                     type="text"
//                     name="address"
//                     placeholder="Address"
//                     value={formData.address}
//                     onChange={handleChange}
//                     required
//                     className="w-full border rounded-lg px-4 py-2"
//                   />
//                   <input
//                     type="date"
//                     name="dateOfJoin"
//                     value={formData.dateOfJoin}
//                     onChange={handleChange}
//                     required
//                     className="w-full border rounded-lg px-4 py-2"
//                   />
//                 </>
//               )}

//               <input
//                 type="email"
//                 name="email"
//                 placeholder="Email"
//                 value={formData.email}
//                 onChange={handleChange}
//                 required
//                 className="w-full border rounded-lg px-4 py-2"
//               />
//               <input
//                 type="password"
//                 name="password"
//                 placeholder="Password"
//                 value={formData.password}
//                 onChange={handleChange}
//                 required
//                 className="w-full border rounded-lg px-4 py-2"
//               />

//               <button
//                 type="submit"
//                 className="w-full bg-blue-600 text-white rounded-lg py-2"
//               >
//                 {isLogin ? "Login" : "Sign Up"}
//               </button>
//             </form>

//             <div className="flex justify-between mt-4">
//               <button
//                 onClick={() => handleSocialLogin(googleProvider)}
//                 className="bg-red-500 text-white px-3 py-2 rounded"
//               >
//                 Google
//               </button>
//               {/* <button
//                 onClick={() => handleSocialLogin(facebookProvider)}
//                 className="bg-blue-500 text-white px-3 py-2 rounded"
//               >
//                 FaceBook
//               </button>
//               <button
//                 onClick={() => handleSocialLogin(githubProvider)}
//                 className="bg-gray-800 text-white px-3 py-2 rounded"
//               >
//                 GitHub
//               </button>
//               <button
//                 onClick={() => handleSocialLogin(twitterProvider)}
//                 className="bg-blue-400 text-white px-3 py-2 rounded"
//               >
//                 Twitter
//               </button> */}
//             </div>

//             <p className="text-sm text-center mt-4">
//               {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
//               <button
//                 onClick={() => setIsLogin(!isLogin)}
//                 className="text-blue-600 hover:underline"
//               >
//                 {isLogin ? "Sign up" : "Login"}
//               </button>
//             </p>
//           </>
//         )}

//         {message && <p className="text-center mt-4 text-gray-700">{message}</p>}

//         {/* Recaptcha container */}
//         <div id="recaptcha-container"></div>
//       </div>
//     </div>
//   );
// }


// "use client";

// import { useState, useEffect } from "react";
// import {
//   auth,
//   googleProvider,
//   githubProvider,
//   twitterProvider,
//   facebookProvider,
// } from "../../firebase/firebase";
// import {
//   createUserWithEmailAndPassword,
//   signInWithEmailAndPassword,
//   signOut,
//   signInWithPopup,
//   RecaptchaVerifier,
//   PhoneAuthProvider,
//   multiFactor,
//   PhoneMultiFactorGenerator,
//   onAuthStateChanged,
//   sendEmailVerification,
//   User,
// } from "firebase/auth";
// import axios from "axios";

// declare global {
//   interface Window {
//     recaptchaVerifier: RecaptchaVerifier;
//   }
// }

// export default function AuthPage() {
//   const [isLogin, setIsLogin] = useState(true);
//   const [formData, setFormData] = useState({
//     name: "",
//     role: "default",
//     contact: "",
//     address: "",
//     dateOfJoin: "",
//     email: "",
//     password: "",
//   });
//   const [message, setMessage] = useState("");
//   const [currentUser, setCurrentUser] = useState<User | null>(null);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (user) => setCurrentUser(user));
//     return () => unsubscribe();
//   }, []);

//   const setupRecaptcha = () => {
//     if (!window.recaptchaVerifier) {
//       window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
//         size: "invisible",
//         callback: () => console.log("Recaptcha verified"),
//       });
//     }
//   };

//   const enrollMFA = async (phoneNumber: string) => {
//     if (!currentUser) return alert("Please login first to enable MFA");
//     if (!currentUser.emailVerified) return alert("Please verify your email first");

//     setupRecaptcha();
//     const appVerifier = window.recaptchaVerifier;

//     try {
//       const session = await multiFactor(currentUser).getSession();
//       const phoneAuthProvider = new PhoneAuthProvider(auth);
//       const verificationId = await phoneAuthProvider.verifyPhoneNumber(
//         { phoneNumber, session },
//         appVerifier
//       );

//       const code = prompt("Enter the verification code sent to your phone");
//       if (!code) return;

//       const cred = PhoneAuthProvider.credential(verificationId, code);
//       const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);
//       await multiFactor(currentUser).enroll(multiFactorAssertion, "My Phone");
//       alert("MFA enabled successfully!");
//     } catch (error: any) {
//       alert(error.message);
//     }
//   };

//   const sendVerificationEmailHandler = async () => {
//     if (!currentUser) return;
//     try {
//       await sendEmailVerification(currentUser);
//       alert("Verification email sent! Please check your inbox.");
//     } catch (error: any) {
//       alert(error.message);
//     }
//   };

//   const handleChange = (e: any) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleAuth = async (e: any) => {
//     e.preventDefault();
//     setMessage("");

//     try {
//       if (isLogin) {
//         const userCredential = await signInWithEmailAndPassword(
//           auth,
//           formData.email,
//           formData.password
//         );
//         const firebaseUser = userCredential.user;

//         const response = await axios.get(
//           `http://localhost:5000/api/hrm/getByUid/${firebaseUser.uid}`
//         );
//         const mongoUser = response.data;

//         if (!mongoUser) return setMessage("User record not found in MongoDB.");

//         if (mongoUser.role === "User") window.location.href = "/home";
//         else if (mongoUser.role === "Admin") window.location.href = "/dashboard";
//         else window.location.href = "/home";
//       } else {
//         const userCredential = await createUserWithEmailAndPassword(
//           auth,
//           formData.email,
//           formData.password
//         );
//         const user = userCredential.user;
//         await axios.post("http://localhost:5000/api/hrm/users", {
//           uid: user.uid,
//           ...formData,
//         });

//         setMessage(
//           `Account created for ${formData.name}. Please verify your email to enable MFA.`
//         );
//       }
//     } catch (error: any) {
//       if (error.code === "auth/multi-factor-auth-required") {
//         const resolver = error.resolver;
//         setupRecaptcha();
//         const appVerifier = window.recaptchaVerifier;
//         const phoneInfoOptions = {
//           multiFactorHint: resolver.hints[0],
//           session: resolver.session,
//         };
//         const phoneAuthProvider = new PhoneAuthProvider(auth);
//         const verificationId = await phoneAuthProvider.verifyPhoneNumber(
//           phoneInfoOptions,
//           appVerifier
//         );
//         const code = prompt("Enter the verification code sent to your phone:");
//         if (!code) return;
//         const cred = PhoneAuthProvider.credential(verificationId, code);
//         const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);
//         const userCredential = await resolver.resolveSignIn(multiFactorAssertion);
//         setMessage(`MFA login successful! Welcome ${userCredential.user.email}`);
//       } else {
//         setMessage(error.message);
//       }
//     }
//   };

//   const handleSocialLogin = async (provider: any) => {
//     try {
//       const result = await signInWithPopup(auth, provider);
//       const user = result.user;

//       const userData = {
//         uid: user.uid,
//         name: user.displayName || null,
//         email: user.email || null,
//         role: "default",
//       };

//       await axios.post("http://localhost:5000/api/hrm/users", userData).catch((err) => {
//         if (err.response?.status !== 400) throw err;
//       });

//       const { data: mongoUser } = await axios.get(
//         `http://localhost:5000/api/hrm/getByUid/${user.uid}`
//       );

//       if (!mongoUser) return setMessage("User record not found in MongoDB.");

//       if (mongoUser.role === "User") window.location.href = "/user";
//       else if (mongoUser.role === "Admin") window.location.href = "/dashboard";
//       else window.location.href = "/home";
//     } catch (error: any) {
//       setMessage(error.message);
//     }
//   };

//   const handleLogout = async () => {
//     await signOut(auth);
//     setMessage("Logged out successfully.");
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
//       <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 border border-gray-200">
//         {currentUser ? (
//           <>
//             <h2 className="text-2xl font-semibold text-gray-800 text-center mb-4">
//               Welcome, {currentUser.email}
//             </h2>

//             {!currentUser.emailVerified && (
//               <button
//                 onClick={sendVerificationEmailHandler}
//                 className="w-full bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg py-2 mb-4 transition"
//               >
//                 Verify Email
//               </button>
//             )}

//             {currentUser.emailVerified && (
//               <button
//                 onClick={() =>
//                   enrollMFA(
//                     prompt(
//                       "Enter your phone number with country code, e.g. +919876543210"
//                     ) || ""
//                   )
//                 }
//                 className="w-full bg-green-500 hover:bg-green-600 text-white rounded-lg py-2 mb-4 transition"
//               >
//                 Enable MFA (Phone)
//               </button>
//             )}

//             <button
//               onClick={handleLogout}
//               className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg py-2 mt-2 transition"
//             >
//               Logout
//             </button>
//           </>
//         ) : (
//           <>
//             <h2 className="text-3xl font-semibold text-gray-800 text-center mb-6">
//               {isLogin ? "Welcome Back" : "Create an Account"}
//             </h2>

//             <form onSubmit={handleAuth} className="space-y-4">
//               {!isLogin && (
//                 <>
//                   <input
//                     type="text"
//                     name="name"
//                     placeholder="Full Name"
//                     value={formData.name}
//                     onChange={handleChange}
//                     className="w-full border border-gray-300 focus:border-blue-500 rounded-lg px-4 py-2 outline-none"
//                     required
//                   />
//                   <input
//                     type="text"
//                     name="contact"
//                     placeholder="Contact"
//                     value={formData.contact}
//                     onChange={handleChange}
//                     className="w-full border border-gray-300 focus:border-blue-500 rounded-lg px-4 py-2 outline-none"
//                     required
//                   />
//                   <input
//                     type="text"
//                     name="address"
//                     placeholder="Address"
//                     value={formData.address}
//                     onChange={handleChange}
//                     className="w-full border border-gray-300 focus:border-blue-500 rounded-lg px-4 py-2 outline-none"
//                     required
//                   />
//                   <input
//                     type="date"
//                     name="dateOfJoin"
//                     value={formData.dateOfJoin}
//                     onChange={handleChange}
//                     className="w-full border border-gray-300 focus:border-blue-500 rounded-lg px-4 py-2 outline-none"
//                     required
//                   />
//                 </>
//               )}

//               <input
//                 type="email"
//                 name="email"
//                 placeholder="Email Address"
//                 value={formData.email}
//                 onChange={handleChange}
//                 className="w-full border border-gray-300 focus:border-blue-500 rounded-lg px-4 py-2 outline-none"
//                 required
//               />
//               <input
//                 type="password"
//                 name="password"
//                 placeholder="Password"
//                 value={formData.password}
//                 onChange={handleChange}
//                 className="w-full border border-gray-300 focus:border-blue-500 rounded-lg px-4 py-2 outline-none"
//                 required
//               />

//               <button
//                 type="submit"
//                 className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 mt-2 transition"
//               >
//                 {isLogin ? "Login" : "Sign Up"}
//               </button>
//             </form>

//             <div className="flex justify-center gap-3 mt-6">
//               <button
//                 onClick={() => handleSocialLogin(googleProvider)}
//                 className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg px-4 py-2 shadow-sm transition"
//               >
//                 <img
//                   src="https://www.svgrepo.com/show/475656/google-color.svg"
//                   alt="Google"
//                   className="w-5 h-5"
//                 />
//                 Google
//               </button>
//             </div>

//             <p className="text-sm text-center mt-5 text-gray-600">
//               {isLogin ? "Don’t have an account?" : "Already have an account?"}{" "}
//               <button
//                 onClick={() => setIsLogin(!isLogin)}
//                 className="text-blue-600 hover:underline font-medium"
//               >
//                 {isLogin ? "Sign up" : "Login"}
//               </button>
//             </p>
//           </>
//         )}

//         {message && (
//           <p className="text-center mt-5 text-sm text-gray-700 bg-gray-50 py-2 rounded-lg border border-gray-200">
//             {message}
//           </p>
//         )}

//         <div id="recaptcha-container"></div>
//       </div>
//     </div>
//   );
// }