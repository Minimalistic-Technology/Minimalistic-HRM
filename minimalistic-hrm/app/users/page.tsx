

// "use client";
// import React, { useState, useEffect } from "react";
// import { Clock, LogIn, LogOut, History, User as UserIcon, Calendar, MapPin } from "lucide-react";
// import axios, { AxiosError } from "axios";

// // Define interfaces
// interface AttendanceRecord {
//   id: string;
//   date: string;
//   checkIn: string;
//   checkOut: string;
//   duration: string;
//   location: string;
// }

// interface CurrentSession {
//   id: string;
//   checkInTime: Date;
//   date: string;
//   location: string;
// }

// interface ApiSession {
//   _id: string;
//   userId: string;
//   checkIn: string;
//   checkOut?: string;
//   location?: string;
// }

// interface HistoryEntry {
//   checkIn: string;
//   checkOut?: string;
//   location?: string;
// }

// interface ApiHistory {
//   userId: string;
//   history: HistoryEntry[];
// }

// interface Location {
//   _id: string;
//   city: string;
//   state: string;
//   country: string;
//   ip: string;
// }

// interface UserDetails {
//   username: string;
//   email?: string;
// }

// // Define API error response type
// interface ApiError {
//   error: string;
// }

// const CheckInOutApp: React.FC = () => {
//   const [isCheckedIn, setIsCheckedIn] = useState<boolean>(false);
//   const [currentSession, setCurrentSession] = useState<CurrentSession | null>(null);
//   const [history, setHistory] = useState<AttendanceRecord[]>([]);
//   const [userName, setUserName] = useState<string>("");
//   const [location, setLocation] = useState<string>("");
//   const [locations, setLocations] = useState<Location[]>([]);
//   const [activeTab, setActiveTab] = useState<"dashboard" | "history">("dashboard");
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState<boolean>(false);

//   const userId = "user123"; // Replace with actual user ID from auth
//   const API_BASE_URL = "http://localhost:5000/api/checksession";

//   // Get auth token from localStorage or cookies
//   const getAuthToken = (): string | null => {
//     const token = localStorage.getItem('access_token');
//     console.log('Token from localStorage:', token);
//     if (token) return token;

//     const cookies = document.cookie.split(';');
//     const accessTokenCookie = cookies.find(cookie => cookie.trim().startsWith('access_token='));
//     console.log('Cookies:', cookies);
//     if (accessTokenCookie) {
//       const cookieToken = accessTokenCookie.split('=')[1];
//       console.log('Token from cookie:', cookieToken);
//       return cookieToken;
//     }

//     console.log('No token found in localStorage or cookies');
//     return null;
//   };

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         console.log("Fetching data started");

//         // Fetch user details
//         const token = getAuthToken();
//         let userDetails: UserDetails = { username: "Guest User" }; // Fallback username
//         try {
//           const response = await axios.get(`${API_BASE_URL}/checksession/users/${userId}`, {
//             headers: {
//               Authorization: token ? `Bearer ${token}` : undefined,
//               'Content-Type': 'application/json',
//             },
//           });
//           userDetails = response.data;
//           console.log("Fetched user details response:", response.data);
//         } catch (userError) {
//           const error = userError as AxiosError<ApiError>;
//           console.warn("Failed to fetch user details:", error.message, "Response:", error.response?.data);
//           // Fallback to email if available, otherwise keep "Guest User"
//           if (localStorage.getItem('email')) {
//             userDetails.username = localStorage.getItem('email') || "Guest User";
//           }
//         }
//         setUserName(userDetails.username);

//         // Fetch location data from backend
//         try {
//           const locationResponse = await axios.get(`${API_BASE_URL}/location`, {
//             headers: {
//               Authorization: token ? `Bearer ${token}` : undefined,
//               'Content-Type': 'application/json',
//             },
//           });
//           const fetchedLocations: Location[] = locationResponse.data;
//           setLocations(fetchedLocations);
//           if (fetchedLocations.length > 0) {
//             setLocation(`${fetchedLocations[0].city}, ${fetchedLocations[0].state}, ${fetchedLocations[0].country}`);
//           }
//           console.log("Fetched location data:", fetchedLocations);
//         } catch (locationError) {
//           const error = locationError as AxiosError<ApiError>;
//           console.error("Failed to fetch locations:", error.message, "Response:", error.response?.data);
//           setError(error.response?.data?.error || "Failed to fetch locations");
//         }

//         // Mock session and history data (unchanged since backend only provides location API)
//         const mockSessionResponse: ApiSession[] = [];
//         const activeSession = mockSessionResponse.find((session) => !session.checkOut);
//         if (activeSession) {
//           setCurrentSession({
//             id: activeSession._id,
//             checkInTime: new Date(activeSession.checkIn),
//             date: formatDate(new Date(activeSession.checkIn)),
//             location: activeSession.location || location,
//           });
//           setIsCheckedIn(true);
//         }

//         const mockHistoryResponse: ApiHistory = { userId, history: [] };
//         const historyData = mockHistoryResponse.history.map((entry, index) => ({
//           id: `${index + 1}`,
//           date: formatDate(new Date(entry.checkIn)),
//           checkIn: formatTime(new Date(entry.checkIn)),
//           checkOut: entry.checkOut ? formatTime(new Date(entry.checkOut)) : "-",
//           duration: entry.checkOut
//             ? calculateDuration(new Date(entry.checkIn), new Date(entry.checkOut))
//             : "-",
//           location: entry.location || "Unknown",
//         }));
//         setHistory(historyData);
//       } catch (err) {
//         const error = err as AxiosError<ApiError>;
//         setError(error.response?.data?.error || "Failed to fetch data");
//         console.error("Fetch error:", error.message, "Response:", error.response?.data);
//       } finally {
//         setLoading(false);
//         console.log("Loading stopped", "location:", location, "loading:", loading);
//       }
//     };
//     fetchData();
//   }, [userId, location]);

//   const formatTime = (date: Date): string => {
//     return date.toLocaleTimeString("en-IN", {
//       hour: "2-digit",
//       minute: "2-digit",
//       hour12: true,
//       timeZone: "Asia/Kolkata",
//     });
//   };

//   const formatDate = (date: Date): string => {
//     return date.toLocaleDateString("en-IN", {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//       timeZone: "Asia/Kolkata",
//     });
//   };

//   const calculateDuration = (start: Date, end: Date): string => {
//     const diff = end.getTime() - start.getTime();
//     const hours = Math.floor(diff / (1000 * 60 * 60));
//     const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
//     return `${hours}h ${minutes}m`;
//   };

//   const handleCheckIn = async (): Promise<void> => {
//     if (loading || !location) return;
//     setLoading(true);
//     console.log("Check-in started", "location:", location);
//     try {
//       const now = new Date();
//       // Mock check-in response (unchanged)
//       const mockResponse: ApiSession = {
//         _id: `session${Date.now()}`,
//         userId,
//         checkIn: now.toISOString(),
//         location,
//       };
//       const session: CurrentSession = {
//         id: mockResponse._id,
//         checkInTime: now,
//         date: formatDate(now),
//         location,
//       };
//       setCurrentSession(session);
//       setIsCheckedIn(true);
//       setError(null);
//       console.log("Mock check-in successful, session:", session);
//     } catch (err) {
//       const error = err as AxiosError<ApiError>;
//       setError(error.response?.data?.error || "Check-in failed");
//       console.error("Check-in error:", error.message, "Response:", error.response?.data);
//     } finally {
//       setLoading(false);
//       console.log("Check-in finished", "loading:", loading);
//     }
//   };

//   const handleCheckOut = async (): Promise<void> => {
//     if (loading || !currentSession) return;
//     setLoading(true);
//     try {
//       const now = new Date();
//       const newHistoryEntry: AttendanceRecord = {
//         id: `${history.length + 1}`,
//         date: currentSession.date,
//         checkIn: formatTime(currentSession.checkInTime),
//         checkOut: formatTime(now),
//         duration: calculateDuration(currentSession.checkInTime, now),
//         location: currentSession.location,
//       };
//       setHistory((prevHistory) => [newHistoryEntry, ...prevHistory]);
//       setCurrentSession(null);
//       setIsCheckedIn(false);
//       setError(null);
//     } catch (err) {
//       const error = err as AxiosError<ApiError>;
//       setError(error.response?.data?.error || "Check-out failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
//     setLocation(e.target.value);
//     console.log("Location changed to:", e.target.value);
//   };

//   const handleTabChange = (tab: "dashboard" | "history"): void => {
//     setActiveTab(tab);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
//       <div className="container mx-auto px-4 py-8 max-w-4xl">
//         {(error || loading) && (
//           <div
//             className={`px-4 py-3 rounded-lg mb-4 ${
//               error ? "bg-red-100 border border-red-400 text-red-700" : "bg-blue-100 border border-blue-400 text-blue-700"
//             }`}
//           >
//             {error || "Loading..."}
//           </div>
//         )}
//         <div className="bg-white rounded-2xl shadow-xl mb-8 p-6">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-4">
//               <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center">
//                 <UserIcon className="w-6 h-6 text-white" />
//               </div>
//               <div>
//                 <h1 className="text-2xl font-bold text-gray-900">{userName || "Loading User..."}</h1>
//                 <p className="text-gray-600">{location || "Select a location"}</p>
//               </div>
//             </div>
//             <div className="text-right">
//               <p className="text-sm text-gray-500">Today</p>
//               <p className="text-lg font-semibold text-gray-900">
//                 {formatDate(new Date())}
//               </p>
//             </div>
//           </div>
//         </div>
//         <div className="bg-white rounded-2xl shadow-xl mb-8">
//           <div className="flex border-b border-gray-200">
//             <button
//               onClick={() => handleTabChange("dashboard")}
//               className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
//                 activeTab === "dashboard"
//                   ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50"
//                   : "text-gray-500 hover:text-gray-700"
//               }`}
//             >
//               <Clock className="w-5 h-5 inline-block mr-2" />
//               Dashboard
//             </button>
//             <button
//               onClick={() => handleTabChange("history")}
//               className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
//                 activeTab === "history"
//                   ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50"
//                   : "text-gray-500 hover:text-gray-700"
//               }`}
//             >
//               <History className="w-5 h-5 inline-block mr-2" />
//               History
//             </button>
//           </div>
//           {activeTab === "dashboard" && (
//             <div className="p-8">
//               <div className="text-center mb-8">
//                 <div
//                   className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-4 ${
//                     isCheckedIn ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
//                   }`}
//                 >
//                   <div
//                     className={`w-2 h-2 rounded-full mr-2 ${
//                       isCheckedIn ? "bg-green-500" : "bg-gray-500"
//                     }`}
//                   ></div>
//                   {isCheckedIn ? "Checked In" : "Checked Out"}
//                 </div>
//                 <p className="text-gray-600">
//                   {isCheckedIn && currentSession
//                     ? `Since ${formatTime(currentSession.checkInTime)}`
//                     : "Ready to check in"}
//                 </p>
//               </div>
//               {isCheckedIn && currentSession && (
//                 <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-8 border border-green-200">
//                   <h3 className="text-lg font-semibold text-green-800 mb-4">Current Session</h3>
//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                     <div className="text-center">
//                       <p className="text-sm text-green-600 mb-1">Check-in Time</p>
//                       <p className="text-lg font-semibold text-green-800">
//                         {formatTime(currentSession.checkInTime)}
//                       </p>
//                     </div>
//                     <div className="text-center">
//                       <p className="text-sm text-green-600 mb-1">Duration</p>
//                       <p className="text-lg font-semibold text-green-800">
//                         {calculateDuration(currentSession.checkInTime, new Date())}
//                       </p>
//                     </div>
//                     <div className="text-center">
//                       <p className="text-sm text-green-600 mb-1">Location</p>
//                       <p className="text-lg font-semibold text-green-800">{currentSession.location}</p>
//                     </div>
//                   </div>
//                 </div>
//               )}
//               <div className="mb-8">
//                 <label className="block text-sm font-medium text-gray-700 mb-3">
//                   <MapPin className="w-4 h-4 inline-block mr-1" />
//                   Current Location
//                 </label>
//                 <select
//                   value={location}
//                   onChange={handleLocationChange}
//                   disabled={isCheckedIn}
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
//                 >
//                   <option value="">Select a location</option>
//                   {locations.map((loc) => (
//                     <option
//                       key={loc._id}
//                       value={`${loc.city}, ${loc.state}, ${loc.country}`}
//                     >
//                       {`${loc.city}, ${loc.state}, ${loc.country}`}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <div className="flex justify-center space-x-4">
//                 {!isCheckedIn ? (
//                   <button
//                     onClick={handleCheckIn}
//                     disabled={loading || !location}
//                     className="flex items-center px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
//                   >
//                     <LogIn className="w-5 h-5 mr-2" />
//                     Check In
//                   </button>
//                 ) : (
//                   <button
//                     onClick={handleCheckOut}
//                     disabled={loading}
//                     className="flex items-center px-8 py-4 bg-gradient-to-r from-red-500 to-pink-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-pink-700 transform hover:scale-105 transition-all duration-200 shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
//                   >
//                     <LogOut className="w-5 h-5 mr-2" />
//                     Check Out
//                   </button>
//                 )}
//               </div>
//             </div>
//           )}
//           {activeTab === "history" && (
//             <div className="p-8">
//               <div className="flex items-center justify-between mb-6">
//                 <h2 className="text-xl font-semibold text-gray-900">Attendance History</h2>
//                 <div className="text-sm text-gray-500">Last {history.length} records</div>
//               </div>
//               {history.length === 0 ? (
//                 <div className="text-center py-12">
//                   <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//                   <p className="text-gray-500">No attendance history yet</p>
//                 </div>
//               ) : (
//                 <div className="space-y-4">
//                   {history.map((record) => (
//                     <div
//                       key={record.id}
//                       className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors"
//                     >
//                       <div className="flex items-center justify-between mb-3">
//                         <div className="flex items-center space-x-3">
//                           <Calendar className="w-5 h-5 text-indigo-600" />
//                           <span className="font-semibold text-gray-900">{record.date}</span>
//                         </div>
//                         <div className="flex items-center space-x-2">
//                           <MapPin className="w-4 h-4 text-gray-500" />
//                           <span className="text-sm text-gray-600">{record.location}</span>
//                         </div>
//                       </div>
//                       <div className="grid grid-cols-3 gap-4 text-center">
//                         <div>
//                           <p className="text-sm text-gray-500 mb-1">Check In</p>
//                           <p className="font-semibold text-green-600">{record.checkIn}</p>
//                         </div>
//                         <div>
//                           <p className="text-sm text-gray-500 mb-1">Check Out</p>
//                           <p className="font-semibold text-red-600">{record.checkOut}</p>
//                         </div>
//                         <div>
//                           <p className="text-sm text-gray-500 mb-1">Duration</p>
//                           <p className="font-semibold text-indigo-600">{record.duration}</p>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CheckInOutApp;



"use client";
import React, { useState, useEffect } from "react";
import { Clock, LogIn, LogOut, History, User as UserIcon, Calendar, MapPin } from "lucide-react";
import axios, { AxiosError } from "axios";

// Define interfaces
interface AttendanceRecord {
  id: string;
  date: string;
  checkIn: string;
  checkOut: string;
  duration: string;
  location: string;
}

interface CurrentSession {
  id: string;
  checkInTime: Date;
  date: string;
  location: string;
}

interface HistoryEntry {
  checkIn: string;
  checkOut?: string;
}

interface ApiHistory {
  userId: string;
  history: HistoryEntry[];
}

interface Location {
  _id: string;
  city: string;
  state: string;
  country: string;
  ip: string;
}

interface UserDetails {
  username: string;
  email?: string;
}

// Define API error response type
interface ApiError {
  error: string;
}

const CheckInOutApp: React.FC = () => {
  const [isCheckedIn, setIsCheckedIn] = useState<boolean>(false);
  const [currentSession, setCurrentSession] = useState<CurrentSession | null>(null);
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [userName, setUserName] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [locations, setLocations] = useState<Location[]>([]);
  const [activeTab, setActiveTab] = useState<"dashboard" | "history">("dashboard");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Replace with actual user ID from auth context
  const userId = localStorage.getItem("userId") || "user123"; // Fallback for testing
  const API_BASE_URL = "http://localhost:5000/api/checksession";

  // Get auth token from localStorage or cookies
  const getAuthToken = (): string | null => {
    const token = localStorage.getItem("access_token");
    if (token) return token;

    const cookies = document.cookie.split(";");
    const accessTokenCookie = cookies.find((cookie) =>
      cookie.trim().startsWith("access_token=")
    );
    if (accessTokenCookie) {
      return accessTokenCookie.split("=")[1];
    }

    return null;
  };

  // Fetch data (user details, locations, and history)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = getAuthToken();
        if (!token) {
          setError("Authentication token not found");
          return;
        }

        // Fetch user details
        let userDetails: UserDetails = { username: "Guest User" };
        try {
          const response = await axios.get(
            `${API_BASE_URL}/checksession/users/${userId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          userDetails = response.data;
        } catch (userError) {
          const error = userError as AxiosError<ApiError>;
          console.warn(
            "Failed to fetch user details:",
            error.response?.data?.error || error.message
          );
          if (localStorage.getItem("email")) {
            userDetails.username = localStorage.getItem("email") || "Guest User";
          }
        }
        setUserName(userDetails.username);

        // Fetch location data
        try {
          const locationResponse = await axios.get(`${API_BASE_URL}/location`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
          const fetchedLocations: Location[] = locationResponse.data;
          setLocations(fetchedLocations);
          if (fetchedLocations.length > 0) {
            setLocation(
              `${fetchedLocations[0].city}, ${fetchedLocations[0].state}, ${fetchedLocations[0].country}`
            );
          }
        } catch (locationError) {
          const error = locationError as AxiosError<ApiError>;
          setError(error.response?.data?.error || "Failed to fetch locations");
        }

        // Fetch user history
        try {
          const historyResponse = await axios.get(
            `${API_BASE_URL}/history/${userId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          const historyData: ApiHistory = historyResponse.data;
          const formattedHistory = historyData.history
            .map((entry, index) => ({
              id: `${index + 1}`,
              date: formatDate(new Date(entry.checkIn)),
              checkIn: formatTime(new Date(entry.checkIn)),
              checkOut: entry.checkOut
                ? formatTime(new Date(entry.checkOut))
                : "-",
              duration: entry.checkOut
                ? calculateDuration(
                    new Date(entry.checkIn),
                    new Date(entry.checkOut)
                  )
                : "-",
              location: location || "Unknown",
            }))
            .filter((record) => record.checkIn !== "-"); // Filter out incomplete records
          setHistory(formattedHistory);

          // Check for active session (last entry without checkOut)
          const activeEntry = historyData.history.find(
            (entry) => !entry.checkOut
          );
          if (activeEntry) {
            setCurrentSession({
              id: `${historyData.history.length}`,
              checkInTime: new Date(activeEntry.checkIn),
              date: formatDate(new Date(activeEntry.checkIn)),
              location: location || "Unknown",
            });
            setIsCheckedIn(true);
          }
        } catch (historyError) {
          const error = historyError as AxiosError<ApiError>;
          setError(error.response?.data?.error || "Failed to fetch history");
        }
      } catch (err) {
        const error = err as AxiosError<ApiError>;
        setError(error.response?.data?.error || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId, location]);

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "Asia/Kolkata",
    });
  };

  const calculateDuration = (start: Date, end: Date): string => {
    const diff = end.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const handleCheckIn = async (): Promise<void> => {
    if (loading || !location) return;
    setLoading(true);
    try {
      const now = new Date();
      const token = getAuthToken();
      if (!token) {
        setError("Authentication token not found");
        return;
      }

      // Create new history entry
      const newEntry: HistoryEntry = { checkIn: now.toISOString() };
      await axios.post(
        `${API_BASE_URL}/history`,
        { userId, history: [newEntry] },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Update local state
      const session: CurrentSession = {
        id: `${Date.now()}`,
        checkInTime: now,
        date: formatDate(now),
        location,
      };
      setCurrentSession(session);
      setIsCheckedIn(true);
      setError(null);

      // Refresh history
      const historyResponse = await axios.get(
        `${API_BASE_URL}/history/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const historyData: ApiHistory = historyResponse.data;
      const formattedHistory = historyData.history.map((entry, index) => ({
        id: `${index + 1}`,
        date: formatDate(new Date(entry.checkIn)),
        checkIn: formatTime(new Date(entry.checkIn)),
        checkOut: entry.checkOut ? formatTime(new Date(entry.checkOut)) : "-",
        duration: entry.checkOut
          ? calculateDuration(new Date(entry.checkIn), new Date(entry.checkOut))
          : "-",
        location: location || "Unknown",
      }));
      setHistory(formattedHistory);
    } catch (err) {
      const error = err as AxiosError<ApiError>;
      setError(error.response?.data?.error || "Check-in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async (): Promise<void> => {
    if (loading || !currentSession) return;
    setLoading(true);
    try {
      const now = new Date();
      const token = getAuthToken();
      if (!token) {
        setError("Authentication token not found");
        return;
      }

      // Fetch current history
      const historyResponse = await axios.get(
        `${API_BASE_URL}/history/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const historyData: ApiHistory = historyResponse.data;

      // Update the latest entry with checkOut time
      const updatedHistory = historyData.history.map((entry) =>
        !entry.checkOut ? { ...entry, checkOut: now.toISOString() } : entry
      );

      // Update history in backend
      await axios.put(
        `${API_BASE_URL}/history/${userId}`,
        { userId, history: updatedHistory },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Update local state
      const newHistoryEntry: AttendanceRecord = {
        id: `${history.length + 1}`,
        date: currentSession.date,
        checkIn: formatTime(currentSession.checkInTime),
        checkOut: formatTime(now),
        duration: calculateDuration(currentSession.checkInTime, now),
        location: currentSession.location,
      };
      setHistory((prevHistory) => [newHistoryEntry, ...prevHistory]);
      setCurrentSession(null);
      setIsCheckedIn(false);
      setError(null);
    } catch (err) {
      const error = err as AxiosError<ApiError>;
      setError(error.response?.data?.error || "Check-out failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setLocation(e.target.value);
  };

  const handleTabChange = (tab: "dashboard" | "history"): void => {
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {(error || loading) && (
          <div
            className={`px-4 py-3 rounded-lg mb-4 ${
              error
                ? "bg-red-100 border border-red-400 text-red-700"
                : "bg-blue-100 border border-blue-400 text-blue-700"
            }`}
          >
            {error || "Loading..."}
          </div>
        )}
        <div className="bg-white rounded-2xl shadow-xl mb-8 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {userName || "Loading User..."}
                </h1>
                <p className="text-gray-600">{location || "Select a location"}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Today</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatDate(new Date())}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-xl mb-8">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => handleTabChange("dashboard")}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === "dashboard"
                  ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Clock className="w-5 h-5 inline-block mr-2" />
              Dashboard
            </button>
            <button
              onClick={() => handleTabChange("history")}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === "history"
                  ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <History className="w-5 h-5 inline-block mr-2" />
              History
            </button>
          </div>
          {activeTab === "dashboard" && (
            <div className="p-8">
              <div className="text-center mb-8">
                <div
                  className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-4 ${
                    isCheckedIn
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full mr-2 ${
                      isCheckedIn ? "bg-green-500" : "bg-gray-500"
                    }`}
                  ></div>
                  {isCheckedIn ? "Checked In" : "Checked Out"}
                </div>
                <p className="text-gray-600">
                  {isCheckedIn && currentSession
                    ? `Since ${formatTime(currentSession.checkInTime)}`
                    : "Ready to check in"}
                </p>
              </div>
              {isCheckedIn && currentSession && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-8 border border-green-200">
                  <h3 className="text-lg font-semibold text-green-800 mb-4">
                    Current Session
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-green-600 mb-1">Check-in Time</p>
                      <p className="text-lg font-semibold text-green-800">
                        {formatTime(currentSession.checkInTime)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-green-600 mb-1">Duration</p>
                      <p className="text-lg font-semibold text-green-800">
                        {calculateDuration(currentSession.checkInTime, new Date())}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-green-600 mb-1">Location</p>
                      <p className="text-lg font-semibold text-green-800">
                        {currentSession.location}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <MapPin className="w-4 h-4 inline-block mr-1" />
                  Current Location
                </label>
                <select
                  value={location}
                  onChange={handleLocationChange}
                  disabled={isCheckedIn}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Select a location</option>
                  {locations.map((loc) => (
                    <option
                      key={loc._id}
                      value={`${loc.city}, ${loc.state}, ${loc.country}`}
                    >
                      {`${loc.city}, ${loc.state}, ${loc.country}`}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-center space-x-4">
                {!isCheckedIn ? (
                  <button
                    onClick={handleCheckIn}
                    disabled={loading || !location}
                    className="flex items-center px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    <LogIn className="w-5 h-5 mr-2" />
                    Check In
                  </button>
                ) : (
                  <button
                    onClick={handleCheckOut}
                    disabled={loading}
                    className="flex items-center px-8 py-4 bg-gradient-to-r from-red-500 to-pink-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-pink-700 transform hover:scale-105 transition-all duration-200 shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    <LogOut className="w-5 h-5 mr-2" />
                    Check Out
                  </button>
                )}
              </div>
            </div>
          )}
          {activeTab === "history" && (
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Attendance History
                </h2>
                <div className="text-sm text-gray-500">
                  Last {history.length} records
                </div>
              </div>
              {history.length === 0 ? (
                <div className="text-center py-12">
                  <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No attendance history yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((record) => (
                    <div
                      key={record.id}
                      className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Calendar className="w-5 h-5 text-indigo-600" />
                          <span className="font-semibold text-gray-900">
                            {record.date}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {record.location}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Check In</p>
                          <p className="font-semibold text-green-600">
                            {record.checkIn}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Check Out</p>
                          <p className="font-semibold text-red-600">
                            {record.checkOut}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Duration</p>
                          <p className="font-semibold text-indigo-600">
                            {record.duration}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckInOutApp;