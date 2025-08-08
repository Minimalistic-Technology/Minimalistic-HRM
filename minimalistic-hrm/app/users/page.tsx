
// "use client";
// import React, { useState, useEffect } from "react";
// import { Clock, LogIn, LogOut, History, User as UserIcon, Calendar, MapPin, Navigation, RefreshCw } from "lucide-react";
// import axios, { AxiosError } from "axios";
// import { useRouter } from "next/navigation";

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

// interface Session {
//   _id: string;
//   userId: string;
//   checkIn: string;
//   checkOut?: string;
//   location?: string;
//   createdAt: string;
//   updatedAt: string;
// }

// interface Location {
//   _id: string;
//   city: string;
//   state: string;
//   country: string;
//   ip: string;
//   coordinates?: {
//     latitude: number;
//     longitude: number;
//   };
//   address?: string;
// }

// interface GeolocationData {
//   latitude: number;
//   longitude: number;
//   city?: string;
//   state?: string;
//   country?: string;
//   address?: string;
//   timestamp?: number;
// }

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
//   const [currentGeolocation, setCurrentGeolocation] = useState<GeolocationData | null>(null);
//   const [locationLoading, setLocationLoading] = useState<boolean>(false);
//   const [locationError, setLocationError] = useState<string | null>(null);
//   const [useCurrentLocation, setUseCurrentLocation] = useState<boolean>(false);
//   const [activeTab, setActiveTab] = useState<"dashboard" | "history">("dashboard");
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [initialDataLoaded, setInitialDataLoaded] = useState<boolean>(false);
//   const [userId, setUserId] = useState<string>("");
//   const router = useRouter();

//   const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/checksession";

//   // Get auth token from localStorage
//   const getAuthToken = (): string | null => {
//     if (typeof window === "undefined") return null;
//     return localStorage.getItem("token");
//   };

//   // Fetch current location using browser geolocation API
//   const getCurrentLocation = (): Promise<GeolocationData> => {
//     return new Promise((resolve, reject) => {
//       if (!navigator.geolocation) {
//         reject(new Error("Geolocation is not supported by this browser"));
//         return;
//       }

//       const options = {
//         enableHighAccuracy: true,
//         timeout: 15000,
//         maximumAge: 60000 // 1 minute cache
//       };

//       navigator.geolocation.getCurrentPosition(
//         async (position) => {
//           const { latitude, longitude } = position.coords;
          
//           try {
//             // Try multiple free geocoding services
//             let geoData: GeolocationData | null = null;

//             // First try: Nominatim (OpenStreetMap) - Free and reliable
//             try {
//               const nominatimResponse = await fetch(
//                 `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=en`,
//                 {
//                   headers: {
//                     'User-Agent': 'CheckInApp/1.0'
//                   }
//                 }
//               );
              
//               if (nominatimResponse.ok) {
//                 const nominatimData = await nominatimResponse.json();
//                 const address = nominatimData.address || {};
                
//                 geoData = {
//                   latitude,
//                   longitude,
//                   city: address.city || address.town || address.village || address.suburb || "Current Location",
//                   state: address.state || address.region || address.province || "Unknown State",
//                   country: address.country || "Unknown Country",
//                   address: nominatimData.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
//                   timestamp: Date.now()
//                 };
//               }
//             } catch (nominatimError) {
//               console.warn("Nominatim geocoding failed:", nominatimError);
//             }

//             // Second try: BigDataCloud (Free tier available)
//             if (!geoData) {
//               try {
//                 const bigDataResponse = await fetch(
//                   `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
//                 );
                
//                 if (bigDataResponse.ok) {
//                   const bigDataData = await bigDataResponse.json();
                  
//                   geoData = {
//                     latitude,
//                     longitude,
//                     city: bigDataData.city || bigDataData.locality || "Current Location",
//                     state: bigDataData.principalSubdivision || "Unknown State",
//                     country: bigDataData.countryName || "Unknown Country",
//                     address: `${bigDataData.city || 'Current Location'}, ${bigDataData.principalSubdivision || 'Unknown State'}, ${bigDataData.countryName || 'Unknown Country'}`,
//                     timestamp: Date.now()
//                   };
//                 }
//               } catch (bigDataError) {
//                 console.warn("BigDataCloud geocoding failed:", bigDataError);
//               }
//             }

//             // If all geocoding fails, use coordinates
//             if (!geoData) {
//               geoData = {
//                 latitude,
//                 longitude,
//                 city: "Current Location",
//                 state: "Unknown State",
//                 country: "Unknown Country",
//                 address: `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`,
//                 timestamp: Date.now()
//               };
//             }

//             resolve(geoData);
            
//           } catch (geocodingError) {
//             console.warn("All geocoding services failed:", geocodingError);
//             // Final fallback: just coordinates
//             resolve({
//               latitude,
//               longitude,
//               city: "Current Location",
//               state: "Unknown State",
//               country: "Unknown Country",
//               address: `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`,
//               timestamp: Date.now()
//             });
//           }
//         },
//         (error) => {
//           let errorMessage = "Unable to retrieve location";
//           switch (error.code) {
//             case error.PERMISSION_DENIED:
//               errorMessage = "Location access denied. Please allow location access and try again.";
//               break;
//             case error.POSITION_UNAVAILABLE:
//               errorMessage = "Location information is unavailable. Please check your GPS/location services.";
//               break;
//             case error.TIMEOUT:
//               errorMessage = "Location request timed out. Please try again.";
//               break;
//           }
//           reject(new Error(errorMessage));
//         },
//         options
//       );
//     });
//   };

//   // Save location to database
//   const saveLocationToDatabase = async (geoData: GeolocationData, locationString: string) => {
//     try {
//       const token = getAuthToken();
//       if (!token) {
//         console.warn("No auth token found, skipping location save to database");
//         return;
//       }

//       // Prepare location data for API
//       const locationData = {
//         city: geoData.city || "Current Location",
//         state: geoData.state || "Unknown State", 
//         country: geoData.country || "Unknown Country",
//         ip: "127.0.0.1", // You might want to get actual IP or use a default
//         coordinates: {
//           latitude: geoData.latitude,
//           longitude: geoData.longitude
//         },
//         address: geoData.address,
//         userId: userId // Include userId if your API needs it
//       };

//       console.log("Saving location to database:", locationData);

//       // Call your location API endpoint to save location
//       const response = await axios.post(
//         `${API_BASE_URL}/location`,
//         locationData,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//           withCredentials: true,
//         }
//       );

//       console.log("Location saved to database successfully:", response.data);
      
//       // Update locations state with the new location
//       const newLocation: Location = response.data;
//       setLocations(prevLocations => {
//         // Check if location already exists to avoid duplicates
//         const exists = prevLocations.some(loc => 
//           loc.city === newLocation.city && 
//           loc.state === newLocation.state && 
//           loc.country === newLocation.country
//         );
        
//         if (!exists) {
//           console.log("Adding new location to state:", newLocation);
//           return [newLocation, ...prevLocations];
//         } else {
//           console.log("Location already exists, not adding duplicate");
//           return prevLocations;
//         }
//       });
      
//     } catch (error) {
//       console.error("Failed to save location to database:", error);
//       const axiosError = error as AxiosError<ApiError>;
//       if (axiosError.response?.data?.error) {
//         console.error("API Error:", axiosError.response.data.error);
//       }
//       // Don't show error to user as location detection was successful
//       // The location save is a background operation
//     }
//   };

//   // Handle getting current location
//   const handleGetCurrentLocation = async () => {
//     if (isCheckedIn) return; // Don't allow location change while checked in
    
//     setLocationLoading(true);
//     setLocationError(null);
    
//     // Check if geolocation is supported
//     if (!navigator.geolocation) {
//       setLocationError("Geolocation is not supported by this browser. Please use a modern browser like Chrome, Firefox, or Safari.");
//       setLocationLoading(false);
//       return;
//     }

//     // Check current permission state if available
//     if (navigator.permissions) {
//       try {
//         const permission = await navigator.permissions.query({name: 'geolocation'});
//         if (permission.state === 'denied') {
//           setLocationError("Location access has been permanently denied. Please enable it in your browser settings and refresh the page.");
//           setLocationLoading(false);
//           return;
//         }
//       } catch (permissionError) {
//         // Permissions API not supported, continue with regular geolocation
//         console.log("Permissions API not supported, continuing...");
//       }
//     }
    
//     try {
//       const geoData = await getCurrentLocation();
//       setCurrentGeolocation(geoData);
      
//       // Save current location to localStorage for persistence
//       if (typeof window !== "undefined") {
//         localStorage.setItem("currentGeolocation", JSON.stringify(geoData));
//         localStorage.setItem("useCurrentLocation", "true");
//       }
      
//       // Set location string based on geolocation data
//       const locationString = geoData.city && geoData.state && geoData.country 
//         ? `${geoData.city}, ${geoData.state}, ${geoData.country}`
//         : geoData.address || "Current Location";
      
//       setLocation(locationString);
//       setUseCurrentLocation(true);
      
//       // Save location to database
//       await saveLocationToDatabase(geoData, locationString);
      
//     } catch (error) {
//       const errorMessage = error instanceof Error ? error.message : "Failed to get location";
//       setLocationError(errorMessage);
//       console.error("Geolocation error:", error);
//     } finally {
//       setLocationLoading(false);
//     }
//   };

//   // Fetch initial data
//   useEffect(() => {
//     // Set userId and username from localStorage after mount
//     if (typeof window !== "undefined") {
//       const storedUserId = localStorage.getItem("userId") || "user123";
//       const storedUsername = localStorage.getItem("username") || "Guest User";
//       setUserId(storedUserId);
//       setUserName(storedUsername);
      
//       // Restore saved current location if exists
//       const savedCurrentLocation = localStorage.getItem("currentGeolocation");
//       const savedUseCurrentLocation = localStorage.getItem("useCurrentLocation");
      
//       if (savedCurrentLocation && savedUseCurrentLocation === "true") {
//         try {
//           const geoData = JSON.parse(savedCurrentLocation);
//           setCurrentGeolocation(geoData);
//           setUseCurrentLocation(true);
          
//           // Set location string from saved data
//           const locationString = geoData.city && geoData.state && geoData.country 
//             ? `${geoData.city}, ${geoData.state}, ${geoData.country}`
//             : geoData.address || "Current Location";
//           setLocation(locationString);
//         } catch (error) {
//           console.error("Error parsing saved location:", error);
//           // Clear invalid saved data
//           localStorage.removeItem("currentGeolocation");
//           localStorage.removeItem("useCurrentLocation");
//         }
//       }
//     }
//   }, []);

//   // Separate useEffect for fetching data when userId changes
//   useEffect(() => {
//     if (!userId) return; // Don't fetch if userId is not set yet

//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         setError(null);
//         const token = getAuthToken();
//         if (!token) {
//           setError("Authentication token not found. Please log in.");
//           router.push("/login");
//           return;
//         }

//         // First, fetch user sessions to check for active session
//         let activeSession: Session | null = null;
//         let allSessions: Session[] = [];
        
//         try {
//           const sessionsResponse = await axios.get(`${API_BASE_URL}/session/user/${userId}`, {
//             headers: {
//               Authorization: `Bearer ${token}`,
//               "Content-Type": "application/json",
//             },
//             withCredentials: true,
//           });
//           allSessions = sessionsResponse.data;
          
//           // Check if user has an active session (checked in but not checked out)
//           activeSession = allSessions.find(session => !session.checkOut) || null;
//         } catch (historyError) {
//           const error = historyError as AxiosError<ApiError>;
//           console.warn("Failed to fetch sessions:", error.response?.data?.error || "Unknown error");
//           // Continue with location fetch even if sessions fail
//         }

//         // Fetch location data
//         let fetchedLocations: Location[] = [];
//         try {
//           const locationResponse = await axios.get(`${API_BASE_URL}/location`, {
//             headers: {
//               Authorization: `Bearer ${token}`,
//               "Content-Type": "application/json",
//             },
//             withCredentials: true,
//           });
//           fetchedLocations = locationResponse.data;
          
//           // Remove duplicate locations based on city, state, country combination
//           const uniqueLocations = fetchedLocations.filter((location, index, self) => 
//             index === self.findIndex((l) => 
//               l.city === location.city && 
//               l.state === location.state && 
//               l.country === location.country
//             )
//           );
          
//           setLocations(uniqueLocations);
          
//           // Set location based on active session or default to first location
//           if (activeSession) {
//             // If there's an active session, try to find the matching location
//             const sessionLocation = uniqueLocations.find(loc => 
//               `${loc.city}, ${loc.state}, ${loc.country}` === activeSession.location
//             );
//             if (sessionLocation) {
//               setLocation(`${sessionLocation.city}, ${sessionLocation.state}, ${sessionLocation.country}`);
//             } else if (uniqueLocations.length > 0) {
//               // Fallback to first available location
//               setLocation(`${uniqueLocations[0].city}, ${uniqueLocations[0].state}, ${uniqueLocations[0].country}`);
//             }
//           } else if (uniqueLocations.length > 0 && !location) {
//             // No active session, set default location if no current location set
//             setLocation(`${uniqueLocations[0].city}, ${uniqueLocations[0].state}, ${uniqueLocations[0].country}`);
//           }
//         } catch (locationError) {
//           const error = locationError as AxiosError<ApiError>;
//           setError(error.response?.data?.error || "Failed to fetch locations");
//           return; // Don't continue if locations can't be fetched
//         }

//         // Handle active sessions - PRESERVE THE SESSION STATE
//         if (activeSession) {
//           // Set the current session state to reflect the active session
//           const sessionLocation = activeSession.location || 
//             (fetchedLocations.length > 0 ? `${fetchedLocations[0].city}, ${fetchedLocations[0].state}, ${fetchedLocations[0].country}` : location);
          
//           const currentSessionData: CurrentSession = {
//             id: activeSession._id,
//             checkInTime: new Date(activeSession.checkIn),
//             date: formatDate(new Date(activeSession.checkIn)),
//             location: sessionLocation,
//           };
          
//           setCurrentSession(currentSessionData);
//           setIsCheckedIn(true);
          
//           // Update location to match the active session
//           if (sessionLocation) {
//             setLocation(sessionLocation);
//           }
//         } else {
//           // No active session - user is checked out
//           setCurrentSession(null);
//           setIsCheckedIn(false);
//         }

//         // Format history with proper location handling
//         const formattedHistory = allSessions.map((session) => {
//           // Try to get location from session, fallback to current location or first available location
//           let sessionLocation = session.location;
//           if (!sessionLocation && fetchedLocations.length > 0) {
//             sessionLocation = `${fetchedLocations[0].city}, ${fetchedLocations[0].state}, ${fetchedLocations[0].country}`;
//           }
//           if (!sessionLocation) {
//             sessionLocation = location || "Unknown";
//           }
          
//           return {
//             id: session._id,
//             date: formatDate(new Date(session.checkIn)),
//             checkIn: formatTime(new Date(session.checkIn)),
//             checkOut: session.checkOut ? formatTime(new Date(session.checkOut)) : "-",
//             duration: session.checkOut
//               ? calculateDuration(new Date(session.checkIn), new Date(session.checkOut))
//               : "-",
//             location: sessionLocation,
//           };
//         });
//         setHistory(formattedHistory);

//         setInitialDataLoaded(true);

//       } catch (err) {
//         const error = err as AxiosError<ApiError>;
//         setError(error.response?.data?.error || "Failed to fetch data");
//         console.error("Data fetch error:", error);
//       } finally {
//         setLoading(false);
//       }
//     };
    
//     fetchData();
//   }, [userId, router]);

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
//     if (loading || !location || isCheckedIn) return;
//     setLoading(true);
//     setError(null);
    
//     try {
//       const token = getAuthToken();
//       if (!token) {
//         setError("Authentication token not found. Please log in.");
//         router.push("/login");
//         return;
//       }

//       // Include coordinates if using current location
//       const checkInData: any = { userId, location };
//       if (useCurrentLocation && currentGeolocation) {
//         checkInData.coordinates = {
//           latitude: currentGeolocation.latitude,
//           longitude: currentGeolocation.longitude
//         };
//       }

//       const response = await axios.post(
//         `${API_BASE_URL}/session/checkin`,
//         checkInData,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//           withCredentials: true,
//         }
//       );

//       const session: Session = response.data;
//       const newSession: CurrentSession = {
//         id: session._id,
//         checkInTime: new Date(session.checkIn),
//         date: formatDate(new Date(session.checkIn)),
//         location,
//       };
//       setCurrentSession(newSession);
//       setIsCheckedIn(true);

//       // Add new session to history immediately
//       const newHistoryEntry: AttendanceRecord = {
//         id: session._id,
//         date: formatDate(new Date(session.checkIn)),
//         checkIn: formatTime(new Date(session.checkIn)),
//         checkOut: "-",
//         duration: "-",
//         location: location,
//       };
//       setHistory((prevHistory) => [newHistoryEntry, ...prevHistory]);

//     } catch (err) {
//       const error = err as AxiosError<ApiError>;
//       setError(error.response?.data?.error || "Check-in failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCheckOut = async (): Promise<void> => {
//     if (loading || !currentSession || !isCheckedIn) return;
//     setLoading(true);
//     setError(null);
    
//     try {
//       const token = getAuthToken();
//       if (!token) {
//         setError("Authentication token not found. Please log in.");
//         router.push("/login");
//         return;
//       }

//       const response = await axios.put(
//         `${API_BASE_URL}/session/checkout/${currentSession.id}`,
//         {},
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//           withCredentials: true,
//         }
//       );

//       const session: Session = response.data;
//       const checkOutTime = new Date(session.checkOut!);
      
//       // Update the existing history entry
//       setHistory((prevHistory) => 
//         prevHistory.map((record) => 
//           record.id === session._id 
//             ? {
//                 ...record,
//                 checkOut: formatTime(checkOutTime),
//                 duration: calculateDuration(currentSession.checkInTime, checkOutTime),
//               }
//             : record
//         )
//       );
      
//       setCurrentSession(null);
//       setIsCheckedIn(false);
//       // Don't clear current location on checkout - keep it for future use
//       // setUseCurrentLocation(false);
//       // setCurrentGeolocation(null);
//     } catch (err) {
//       const error = err as AxiosError<ApiError>;
//       setError(error.response?.data?.error || "Check-out failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
//     // This function is no longer needed since we removed the dropdown
//     // Keep it for backward compatibility but it won't be used
//     if (!isCheckedIn) {
//       setLocation(e.target.value);
//       setUseCurrentLocation(false);
//       setCurrentGeolocation(null);
//     }
//   };

//   const handleTabChange = (tab: "dashboard" | "history"): void => {
//     setActiveTab(tab);
//   };

//   const handleLogout = async (): Promise<void> => {
//     try {
//       setLoading(true);
//       const token = getAuthToken();
      
//       // Clear localStorage first
//       if (typeof window !== "undefined") {
//         localStorage.clear();
//       }

//       // Try to call logout API if token exists, but don't block logout if it fails
//       if (token) {
//         try {
//           await axios.post(
//             `${API_BASE_URL}/auth/logout`,
//             {},
//             {
//               headers: {
//                 Authorization: `Bearer ${token}`,
//                 "Content-Type": "application/json",
//               },
//               withCredentials: true,
//             }
//           );
//         } catch (apiError) {
//           // Log API error but don't prevent logout
//           console.warn("Logout API call failed:", apiError);
//         }
//       }

//       // Always redirect to login regardless of API success/failure
//       setError(null);
//       router.push("/login");
//     } catch (err) {
//       // Even if everything fails, clear data and redirect
//       if (typeof window !== "undefined") {
//         localStorage.clear();
//       }
//       setError(null);
//       router.push("/login");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Show loading state while initial data is being fetched
//   if (!initialDataLoaded && loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
//         <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading your attendance data...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
//       <div className="container mx-auto px-4 py-8 max-w-4xl">
//         {error && (
//           <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
//             {error}
//           </div>
//         )}
        
//         <div className="bg-white rounded-2xl shadow-xl mb-8 p-6">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-4">
//               <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center">
//                 <UserIcon className="w-6 h-6 text-white" />
//               </div>
//               <div>
//                 <h1 className="text-2xl font-bold text-gray-900">
//                   {userName || "Loading User..."}
//                 </h1>
//                 <p className="text-gray-600">
//                   {useCurrentLocation && currentGeolocation ? (
//                     <span className="flex items-center">
//                       <Navigation className="w-4 h-4 mr-1 text-blue-500" />
//                       {location}
//                     </span>
//                   ) : (
//                     location 
//                   )}
//                 </p>
//               </div>
//             </div>
//             <div className="text-right space-y-2">
//               <p className="text-sm text-gray-500">Today</p>
//               <p className="text-lg font-semibold text-gray-900">
//                 {formatDate(new Date())}
//               </p>
//               <button
//                 onClick={handleLogout}
//                 disabled={loading}
//                 className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:bg-gray-400"
//               >
//                 <LogOut className="w-4 h-4 mr-2" />
//                 Logout
//               </button>
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
//                     isCheckedIn
//                       ? "bg-green-100 text-green-800"
//                       : "bg-gray-100 text-gray-800"
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
//                   <h3 className="text-lg font-semibold text-green-800 mb-4">
//                     Current Session
//                   </h3>
//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                     <div className="text-center">
//                       <p className="text-sm text-green-600 mb-1">Check-in Time</p>
//                       <p className="text-lg font-semibold text-green-800">
//                         {formatTime(currentSession.checkInTime)}
//                       </p>
//                     </div>
//                     <div className="text-center">
//                               <p className="text-sm text-green-600 mb-1">Duration</p>
//                       <p className="text-lg font-semibold text-green-800">
//                         {calculateDuration(currentSession.checkInTime, new Date())}
//                        </p>
//                      </div>
//                      <div className="text-center">
//                        <p className="text-sm text-green-600 mb-1">Location</p>
//                       <p className="text-lg font-semibold text-green-800 flex items-center justify-center">
//                         {useCurrentLocation && (
//                           <Navigation className="w-4 h-4 mr-1 text-blue-500" />
//                         )}
//                         {currentSession.location}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               )}
              
//               <div className="mb-8">
//                 <label className="block text-sm font-medium text-gray-700 mb-3">
//                   <MapPin className="w-4 h-4 inline-block mr-1" />
//                   Current Location
//                 </label>
                
//                 {/* Current Location Section */}
//                 <div className="space-y-4">
//                   {!useCurrentLocation ? (
//                     <div>
//                       <button
//                         onClick={handleGetCurrentLocation}
//                         disabled={isCheckedIn || locationLoading || loading}
//                         className="flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed w-full justify-center"
//                       >
//                         {locationLoading ? (
//                           <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
//                         ) : (
//                           <Navigation className="w-5 h-5 mr-2" />
//                         )}
//                         {locationLoading ? "Detecting Location..." : "Get My Current Location"}
//                       </button>
                      
//                       {/* Location Permission Instructions */}
//                       <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
//                         <p className="text-sm text-blue-800 font-medium mb-2">📍 How to enable location access:</p>
//                         <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
//                           <li>Click "Get My Current Location" button above</li>
//                           <li>Allow location access when browser asks</li>
//                           <li>If blocked, click the lock icon in address bar</li>
//                           <li>Set Location permission to "Allow"</li>
//                           <li>Refresh the page and try again</li>
//                         </ol>
//                       </div>
                      
//                       {locationError && (
//                         <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-3">
//                           <div className="flex items-start">
//                             <div className="flex-shrink-0">
//                               <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
//                                 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
//                               </svg>
//                             </div>
//                             <div className="ml-3 flex-1">
//                               <h3 className="text-sm font-medium text-red-800">Location Error</h3>
//                               <p className="text-sm text-red-700 mt-1">{locationError}</p>
                              
//                               {locationError.includes("denied") && (
//                                 <div className="mt-3 bg-white border border-red-200 rounded p-3">
//                                   <p className="text-xs font-medium text-red-800 mb-2">To fix this:</p>
//                                   <div className="text-xs text-red-700 space-y-1">
//                                     <p><strong>Chrome/Edge:</strong> Click the 🔒 icon → Site settings → Location → Allow</p>
//                                     <p><strong>Firefox:</strong> Click the 🛡️ icon → Permissions → Location → Allow</p>
//                                     <p><strong>Safari:</strong> Safari → Preferences → Websites → Location</p>
//                                   </div>
//                                   <button
//                                     onClick={() => {
//                                       setLocationError(null);
//                                       window.location.reload();
//                                     }}
//                                     className="mt-2 text-xs bg-red-100 hover:bg-red-200 text-red-800 px-2 py-1 rounded"
//                                   >
//                                     Refresh Page
//                                   </button>
//                                 </div>
//                               )}
                              
//                               {locationError.includes("unavailable") && (
//                                 <div className="mt-3 bg-white border border-red-200 rounded p-3">
//                                   <p className="text-xs text-red-700">
//                                     Please check that:
//                                     <br />• GPS/Location services are enabled on your device
//                                     <br />• You have an internet connection
//                                     <br />• Try moving to an area with better signal
//                                   </p>
//                                 </div>
//                               )}
                              
//                               {locationError.includes("timeout") && (
//                                 <div className="mt-3 bg-white border border-red-200 rounded p-3">
//                                   <p className="text-xs text-red-700">
//                                     Location detection timed out. This might happen if:
//                                     <br />• GPS signal is weak
//                                     <br />• You're indoors or in a covered area
//                                     <br />• Network connection is slow
//                                   </p>
//                                   <button
//                                     onClick={handleGetCurrentLocation}
//                                     disabled={locationLoading}
//                                     className="mt-2 text-xs bg-red-100 hover:bg-red-200 text-red-800 px-2 py-1 rounded"
//                                   >
//                                     Try Again
//                                   </button>
//                                 </div>
//                               )}
//                             </div>
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   ) : (
//                     <div className="bg-green-50 border border-green-200 rounded-lg p-4">
//                       <div className="flex items-start justify-between">
//                         <div className="flex-1">
//                           <p className="text-sm text-green-800 font-medium flex items-center mb-2">
//                             <Navigation className="w-4 h-4 mr-1" />
//                             Location Detected Successfully
//                           </p>
//                           <div className="space-y-1">
//                             <p className="text-sm text-green-700">
//                               <span className="font-medium">Address:</span> {currentGeolocation?.address}
//                             </p>
//                             <p className="text-xs text-green-600">
//                               <span className="font-medium">Coordinates:</span> {currentGeolocation?.latitude.toFixed(6)}, {currentGeolocation?.longitude.toFixed(6)}
//                             </p>
//                             {currentGeolocation?.timestamp && (
//                               <p className="text-xs text-green-500">
//                                 <span className="font-medium">Detected:</span> {new Date(currentGeolocation.timestamp).toLocaleString('en-IN', {
//                                   timeZone: 'Asia/Kolkata',
//                                   day: 'numeric',
//                                   month: 'short',
//                                   hour: '2-digit',
//                                   minute: '2-digit'
//                                 })}
//                               </p>
//                             )}
//                           </div>
//                         </div>
                        
//                         {!isCheckedIn && (
//                           <div className="flex flex-col space-y-1 ml-2">
//                             <button
//                               onClick={handleGetCurrentLocation}
//                               disabled={locationLoading}
//                               className="text-green-600 hover:text-green-800 p-1"
//                               title="Update location"
//                             >
//                               {locationLoading ? (
//                                 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
//                               ) : (
//                                 <RefreshCw className="w-4 h-4" />
//                               )}
//                             </button>
//                             <button
//                               onClick={() => {
//                                 setUseCurrentLocation(false);
//                                 setCurrentGeolocation(null);
//                                 setLocation("");
//                                 // Clear saved location data
//                                 if (typeof window !== "undefined") {
//                                   localStorage.removeItem("currentGeolocation");
//                                   localStorage.removeItem("useCurrentLocation");
//                                 }
//                               }}
//                               className="text-red-500 hover:text-red-700 p-1"
//                               title="Clear location"
//                             >
//                               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                               </svg>
//                             </button>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   )}
                  
//                   {!location && !useCurrentLocation && (
//                     <p className="text-sm text-gray-500 text-center py-4">
//                       Please get your current location before checking in
//                     </p>
//                   )}
                  
                  
//                 </div>
//               </div>
              
//               <div className="flex justify-center space-x-4">
//                 {!isCheckedIn ? (
//                   <button
//                     onClick={handleCheckIn}
//                     disabled={loading || !location}
//                     className="flex items-center px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none"
//                   >
//                     {loading ? (
//                       <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
//                     ) : (
//                       <LogIn className="w-5 h-5 mr-2" />
//                     )}
//                     {loading ? "Checking In..." : "Check In"}
//                   </button>
//                 ) : (
//                   <button
//                     onClick={handleCheckOut}
//                     disabled={loading}
//                     className="flex items-center px-8 py-4 bg-gradient-to-r from-red-500 to-pink-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-pink-700 transform hover:scale-105 transition-all duration-200 shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none"
//                   >
      
//                     {loading ? (
//                       <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
//                     ) : (
//                       <LogOut className="w-5 h-5 mr-2" />
//                     )}
//                     {loading ? "Checking Out..." : "Check Out"}
//                   </button>
//                 )}
//               </div>
//             </div>
//           )}
          
//           {activeTab === "history" && (
//             <div className="p-8">
//               <div className="flex items-center justify-between mb-6">
//                 <h2 className="text-xl font-semibold text-gray-900">
//                   Attendance History
//                 </h2>
//                 <div className="text-sm text-gray-500">
//                   Last {history.length} records
//                 </div>
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
//                           <span className="font-semibold text-gray-900">
//                             {record.date}
//                           </span>
//                         </div>
//                         <div className="flex items-center space-x-2">
//                           <MapPin className="w-4 h-4 text-gray-500" />
//                           <span className="text-sm text-gray-600">
//                             {record.location}
//                           </span>
//                         </div>
//                       </div>
//                       <div className="grid grid-cols-3 gap-4 text-center">
//                         <div>
//                           <p className="text-sm text-gray-500 mb-1">Check In</p>
//                           <p className="font-semibold text-green-600">
//                             {record.checkIn}
//                           </p>
//                         </div>
//                         <div>
//                           <p className="text-sm text-gray-500 mb-1">Check Out</p>
//                           <p className="font-semibold text-red-600">
//                             {record.checkOut}
//                           </p>
//                         </div>
//                         <div>
//                           <p className="text-sm text-gray-500 mb-1">Duration</p>
//                           <p className="font-semibold text-indigo-600">
//                             {record.duration}
//                           </p>
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
import React, { useState, useEffect, useRef } from "react";
import { Clock, LogIn, LogOut, History, User as UserIcon, Calendar, MapPin, Navigation, RefreshCw } from "lucide-react";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";

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

interface Session {
  _id: string;
  userId: string;
  checkIn: string;
  checkOut?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

interface Location {
  _id: string;
  city: string;
  state: string;
  country: string;
  ip: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  address?: string;
}

interface GeolocationData {
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
  country?: string;
  address?: string;
  timestamp?: number;
}

interface ApiError {
  error: string;
}

interface User {
  _id: string;
  username: string;
  email: string;
}

const CheckInOutApp: React.FC = () => {
  const [isCheckedIn, setIsCheckedIn] = useState<boolean>(false);
  const [currentSession, setCurrentSession] = useState<CurrentSession | null>(null);
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [userName, setUserName] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [locations, setLocations] = useState<Location[]>([]);
  const [currentGeolocation, setCurrentGeolocation] = useState<GeolocationData | null>(null);
  const [locationLoading, setLocationLoading] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [useCurrentLocation, setUseCurrentLocation] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "history">("dashboard");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [initialDataLoaded, setInitialDataLoaded] = useState<boolean>(false);
  const [userId, setUserId] = useState<string>("");
  const [autoCheckoutEnabled, setAutoCheckoutEnabled] = useState<boolean>(true);
  const [timeToMidnight, setTimeToMidnight] = useState<string>("");
  
  // Refs for intervals
  const midnightCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const router = useRouter();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/checksession";

  // Get auth token from localStorage
  const getAuthToken = (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  };

  // Calculate time until midnight
  const calculateTimeToMidnight = (): string => {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0); // Next midnight
    
    const diff = midnight.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Auto checkout function
  const performAutoCheckout = async (): Promise<void> => {
    if (!currentSession || !isCheckedIn) return;
    
    try {
      const token = getAuthToken();
      if (!token) {
        console.warn("No auth token found for auto checkout");
        return;
      }

      console.log("Performing automatic checkout at midnight for session:", currentSession.id);
      
      const response = await axios.put(
        `${API_BASE_URL}/session/checkout/${currentSession.id}`,
        { 
          time: new Date().toISOString(),
          autoCheckout: true 
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      const sessionData = response.data.session || response.data;
      const checkOutTime = new Date(sessionData.checkOut!);
      
      // Update the existing history entry
      setHistory((prevHistory) => 
        prevHistory.map((record) => 
          record.id === sessionData._id 
            ? {
                ...record,
                checkOut: formatTime(checkOutTime),
                duration: calculateDuration(currentSession.checkInTime, checkOutTime),
              }
            : record
        )
      );
      
      setCurrentSession(null);
      setIsCheckedIn(false);
      
      // Show notification to user
      setError("You were automatically checked out at midnight. Don't forget to check in for the new day!");
      
      // Clear the error after 10 seconds
      setTimeout(() => setError(null), 10000);
      
    } catch (err) {
      console.error("Auto checkout failed:", err);
      const error = err as AxiosError<ApiError>;
      setError(`Auto checkout failed: ${error.response?.data?.error || "Unknown error"}`);
    }
  };

  // Check if it's midnight and perform auto checkout
  const checkForMidnight = (): void => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    
    // Check if it's exactly midnight (00:00:00) or within the first few seconds
    if (hours === 0 && minutes === 0 && seconds <= 5) {
      if (isCheckedIn && currentSession && autoCheckoutEnabled) {
        console.log("Midnight detected, performing auto checkout...");
        performAutoCheckout();
      }
    }
  };

  // Setup midnight check interval
  const setupMidnightCheck = (): void => {
    // Clear existing interval
    if (midnightCheckIntervalRef.current) {
      clearInterval(midnightCheckIntervalRef.current);
    }
    
    if (isCheckedIn && autoCheckoutEnabled) {
      // Check every second when user is checked in
      midnightCheckIntervalRef.current = setInterval(checkForMidnight, 1000);
    }
  };

  // Setup countdown timer
  const setupCountdown = (): void => {
    // Clear existing interval
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    
    if (isCheckedIn) {
      // Update countdown every second
      countdownIntervalRef.current = setInterval(() => {
        setTimeToMidnight(calculateTimeToMidnight());
      }, 1000);
      
      // Initial calculation
      setTimeToMidnight(calculateTimeToMidnight());
    } else {
      setTimeToMidnight("");
    }
  };

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (midnightCheckIntervalRef.current) {
        clearInterval(midnightCheckIntervalRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  // Setup/cleanup midnight check when check-in status changes
  useEffect(() => {
    setupMidnightCheck();
    setupCountdown();
    
    return () => {
      if (midnightCheckIntervalRef.current) {
        clearInterval(midnightCheckIntervalRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [isCheckedIn, currentSession, autoCheckoutEnabled]);

  // Load auto checkout preference from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedPreference = localStorage.getItem("autoCheckoutEnabled");
      if (savedPreference !== null) {
        setAutoCheckoutEnabled(savedPreference === "true");
      }
    }
  }, []);

  // Save auto checkout preference to localStorage
  const toggleAutoCheckout = (): void => {
    const newValue = !autoCheckoutEnabled;
    setAutoCheckoutEnabled(newValue);
    if (typeof window !== "undefined") {
      localStorage.setItem("autoCheckoutEnabled", newValue.toString());
    }
  };

  // Fetch current location using browser geolocation API
  const getCurrentLocation = (): Promise<GeolocationData> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser"));
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000 // 1 minute cache
      };

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            // Try multiple free geocoding services
            let geoData: GeolocationData | null = null;

            // First try: Nominatim (OpenStreetMap) - Free and reliable
            try {
              const nominatimResponse = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=en`,
                {
                  headers: {
                    'User-Agent': 'CheckInApp/1.0'
                  }
                }
              );
              
              if (nominatimResponse.ok) {
                const nominatimData = await nominatimResponse.json();
                const address = nominatimData.address || {};
                
                geoData = {
                  latitude,
                  longitude,
                  city: address.city || address.town || address.village || address.suburb || "Current Location",
                  state: address.state || address.region || address.province || "Unknown State",
                  country: address.country || "Unknown Country",
                  address: nominatimData.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
                  timestamp: Date.now()
                };
              }
            } catch (nominatimError) {
              console.warn("Nominatim geocoding failed:", nominatimError);
            }

            // Second try: BigDataCloud (Free tier available)
            if (!geoData) {
              try {
                const bigDataResponse = await fetch(
                  `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
                );
                
                if (bigDataResponse.ok) {
                  const bigDataData = await bigDataResponse.json();
                  
                  geoData = {
                    latitude,
                    longitude,
                    city: bigDataData.city || bigDataData.locality || "Current Location",
                    state: bigDataData.principalSubdivision || "Unknown State",
                    country: bigDataData.countryName || "Unknown Country",
                    address: `${bigDataData.city || 'Current Location'}, ${bigDataData.principalSubdivision || 'Unknown State'}, ${bigDataData.countryName || 'Unknown Country'}`,
                    timestamp: Date.now()
                  };
                }
              } catch (bigDataError) {
                console.warn("BigDataCloud geocoding failed:", bigDataError);
              }
            }

            // If all geocoding fails, use coordinates
            if (!geoData) {
              geoData = {
                latitude,
                longitude,
                city: "Current Location",
                state: "Unknown State",
                country: "Unknown Country",
                address: `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`,
                timestamp: Date.now()
              };
            }

            resolve(geoData);
            
          } catch (geocodingError) {
            console.warn("All geocoding services failed:", geocodingError);
            // Final fallback: just coordinates
            resolve({
              latitude,
              longitude,
              city: "Current Location",
              state: "Unknown State",
              country: "Unknown Country",
              address: `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`,
              timestamp: Date.now()
            });
          }
        },
        (error) => {
          let errorMessage = "Unable to retrieve location";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location access denied. Please allow location access and try again.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information is unavailable. Please check your GPS/location services.";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out. Please try again.";
              break;
          }
          reject(new Error(errorMessage));
        },
        options
      );
    });
  };

  // Save location to database - FIXED VERSION
  const saveLocationToDatabase = async (geoData: GeolocationData, locationString: string) => {
    try {
      const token = getAuthToken();
      if (!token) {
        console.warn("No auth token found, skipping location save to database");
        return null;
      }

      // Check if similar location already exists to avoid duplicates
      const existingLocation = locations.find(loc => 
        loc.city === (geoData.city || "Current Location") && 
        loc.state === (geoData.state || "Unknown State") && 
        loc.country === (geoData.country || "Unknown Country")
      );

      if (existingLocation) {
        console.log("Location already exists, using existing one:", existingLocation);
        return existingLocation;
      }

      // Prepare location data for API - match your backend schema
      const locationData = {
        city: geoData.city || "Current Location",
        state: geoData.state || "Unknown State", 
        country: geoData.country || "Unknown Country",
        ip: "127.0.0.1", // Default IP - you might want to get real IP from a service
        // Note: coordinates and address are not in your backend schema, so we're not sending them
        // If you need them, update your backend Location schema first
      };

      console.log("Saving location to database:", locationData);

      // Call your location API endpoint to save location
      const response = await axios.post(
        `${API_BASE_URL}/location`,
        locationData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      console.log("Location saved to database successfully:", response.data);
      
      // Update locations state with the new location
      const newLocation: Location = response.data;
      setLocations(prevLocations => {
        // Double-check to avoid duplicates
        const exists = prevLocations.some(loc => loc._id === newLocation._id);
        
        if (!exists) {
          console.log("Adding new location to state:", newLocation);
          return [newLocation, ...prevLocations];
        } else {
          console.log("Location already exists in state, not adding duplicate");
          return prevLocations;
        }
      });
      
      return newLocation;
      
    } catch (error) {
      console.error("Failed to save location to database:", error);
      const axiosError = error as AxiosError<ApiError>;
      if (axiosError.response?.data?.error) {
        console.error("API Error:", axiosError.response.data.error);
      }
      // Don't show error to user as location detection was successful
      // The location save is a background operation
      return null;
    }
  };

  // Handle getting current location - IMPROVED VERSION
  const handleGetCurrentLocation = async () => {
    if (isCheckedIn) return; // Don't allow location change while checked in
    
    setLocationLoading(true);
    setLocationError(null);
    
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser. Please use a modern browser like Chrome, Firefox, or Safari.");
      setLocationLoading(false);
      return;
    }

    // Check current permission state if available
    if (navigator.permissions) {
      try {
        const permission = await navigator.permissions.query({name: 'geolocation'});
        if (permission.state === 'denied') {
          setLocationError("Location access has been permanently denied. Please enable it in your browser settings and refresh the page.");
          setLocationLoading(false);
          return;
        }
      } catch (permissionError) {
        // Permissions API not supported, continue with regular geolocation
        console.log("Permissions API not supported, continuing...");
      }
    }
    
    try {
      const geoData = await getCurrentLocation();
      setCurrentGeolocation(geoData);
      
      // Save current location to localStorage for persistence
      if (typeof window !== "undefined") {
        localStorage.setItem("currentGeolocation", JSON.stringify(geoData));
        localStorage.setItem("useCurrentLocation", "true");
      }
      
      // Set location string based on geolocation data
      const locationString = geoData.city && geoData.state && geoData.country 
        ? `${geoData.city}, ${geoData.state}, ${geoData.country}`
        : geoData.address || "Current Location";
      
      setLocation(locationString);
      setUseCurrentLocation(true);
      
      // Save location to database (non-blocking)
      saveLocationToDatabase(geoData, locationString).then(savedLocation => {
        if (savedLocation) {
          console.log("Location successfully saved to database");
        }
      }).catch(error => {
        console.warn("Background location save failed:", error);
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to get location";
      setLocationError(errorMessage);
      console.error("Geolocation error:", error);
    } finally {
      setLocationLoading(false);
    }
  };

  // Fetch user details
  const fetchUserDetails = async (token: string): Promise<User | null> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/access-control/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      return response.data.user || response.data;
    } catch (error) {
      console.error("Failed to fetch user details:", error);
      return null;
    }
  };

  // Fetch initial data
  useEffect(() => {
    // Set userId and username from localStorage after mount
    if (typeof window !== "undefined") {
      const storedUserId = localStorage.getItem("userId") || "";
      const storedUsername = localStorage.getItem("username") || "Guest User";
      setUserId(storedUserId);
      setUserName(storedUsername);
      
      // Restore saved current location if exists
      const savedCurrentLocation = localStorage.getItem("currentGeolocation");
      const savedUseCurrentLocation = localStorage.getItem("useCurrentLocation");
      
      if (savedCurrentLocation && savedUseCurrentLocation === "true") {
        try {
          const geoData = JSON.parse(savedCurrentLocation);
          setCurrentGeolocation(geoData);
          setUseCurrentLocation(true);
          
          // Set location string from saved data
          const locationString = geoData.city && geoData.state && geoData.country 
            ? `${geoData.city}, ${geoData.state}, ${geoData.country}`
            : geoData.address || "Current Location";
          setLocation(locationString);
        } catch (error) {
          console.error("Error parsing saved location:", error);
          // Clear invalid saved data
          localStorage.removeItem("currentGeolocation");
          localStorage.removeItem("useCurrentLocation");
        }
      }
    }
  }, []);

  // Separate useEffect for fetching data when userId changes - IMPROVED VERSION
  useEffect(() => {
    if (!userId) return; // Don't fetch if userId is not set yet

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = getAuthToken();
        if (!token) {
          setError("Authentication token not found. Please log in.");
          router.push("/login");
          return;
        }

        // Fetch user details to get the correct username
        const user = await fetchUserDetails(token);
        if (user) {
          setUserName(user.username);
          // Update localStorage with correct username
          if (typeof window !== "undefined") {
            localStorage.setItem("username", user.username);
          }
        }

        // First, fetch user sessions to check for active session
        let activeSession: Session | null = null;
        let allSessions: Session[] = [];
        
        try {
          const sessionsResponse = await axios.get(`${API_BASE_URL}/session/user/${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            withCredentials: true,
          });
          allSessions = sessionsResponse.data;
          
          // Check if user has an active session (checked in but not checked out)
          activeSession = allSessions.find(session => !session.checkOut) || null;
        } catch (historyError) {
          const error = historyError as AxiosError<ApiError>;
          console.warn("Failed to fetch sessions:", error.response?.data?.error || "Unknown error");
          // Continue with location fetch even if sessions fail
        }

        // Fetch location data - IMPROVED ERROR HANDLING
        let fetchedLocations: Location[] = [];
        try {
          const locationResponse = await axios.get(`${API_BASE_URL}/location`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            withCredentials: true,
          });
          
          // Handle different response formats
          fetchedLocations = Array.isArray(locationResponse.data) 
            ? locationResponse.data 
            : (locationResponse.data.locations || []);
          
          // Remove duplicate locations based on city, state, country combination
          const uniqueLocations = fetchedLocations.filter((location, index, self) => 
            index === self.findIndex((l) => 
              l.city === location.city && 
              l.state === location.state && 
              l.country === location.country
            )
          );
          
          setLocations(uniqueLocations);
          
          // Set location based on active session or existing current location
          if (activeSession) {
            // If there's an active session, try to find the matching location
            const sessionLocation = uniqueLocations.find(loc => 
              `${loc.city}, ${loc.state}, ${loc.country}` === activeSession.location
            );
            if (sessionLocation) {
              setLocation(`${sessionLocation.city}, ${sessionLocation.state}, ${sessionLocation.country}`);
            } else if (uniqueLocations.length > 0 && !location) {
              // Fallback to first available location if no current location
              setLocation(`${uniqueLocations[0].city}, ${uniqueLocations[0].state}, ${uniqueLocations[0].country}`);
            }
          } else if (uniqueLocations.length > 0 && !location && !useCurrentLocation) {
            // No active session and no current location set, use first available location
            setLocation(`${uniqueLocations[0].city}, ${uniqueLocations[0].state}, ${uniqueLocations[0].country}`);
          }
        } catch (locationError) {
          const error = locationError as AxiosError<ApiError>;
          console.warn("Failed to fetch locations:", error.response?.data?.error || "Unknown error");
          // Continue without locations
        }

        // Handle active sessions - PRESERVE THE SESSION STATE
        if (activeSession) {
          // Set the current session state to reflect the active session
          const sessionLocation = activeSession.location || 
            (fetchedLocations.length > 0 ? `${fetchedLocations[0].city}, ${fetchedLocations[0].state}, ${fetchedLocations[0].country}` : location) ||
            "Unknown Location";
          
          const currentSessionData: CurrentSession = {
            id: activeSession._id,
            checkInTime: new Date(activeSession.checkIn),
            date: formatDate(new Date(activeSession.checkIn)),
            location: sessionLocation,
          };
          
          setCurrentSession(currentSessionData);
          setIsCheckedIn(true);
          
          // Update location to match the active session if not using current location
          if (sessionLocation && !useCurrentLocation) {
            setLocation(sessionLocation);
          }
        } else {
          // No active session - user is checked out
          setCurrentSession(null);
          setIsCheckedIn(false);
        }

        // Format history with proper location handling
        const formattedHistory = allSessions.map((session) => {
          // Try to get location from session, fallback to current location or first available location
          let sessionLocation = session.location;
          if (!sessionLocation && fetchedLocations.length > 0) {
            sessionLocation = `${fetchedLocations[0].city}, ${fetchedLocations[0].state}, ${fetchedLocations[0].country}`;
          }
          if (!sessionLocation) {
            sessionLocation = location || "Unknown Location";
          }
          
          return {
            id: session._id,
            date: formatDate(new Date(session.checkIn)),
            checkIn: formatTime(new Date(session.checkIn)),
            checkOut: session.checkOut ? formatTime(new Date(session.checkOut)) : "-",
            duration: session.checkOut
              ? calculateDuration(new Date(session.checkIn), new Date(session.checkOut))
              : "-",
            location: sessionLocation,
          };
        });
        setHistory(formattedHistory);

        setInitialDataLoaded(true);

      } catch (err) {
        const error = err as AxiosError<ApiError>;
        setError(error.response?.data?.error || "Failed to fetch data");
        console.error("Data fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [userId, router]); // Removed 'location' dependency to avoid infinite loops

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
    if (loading || !location || isCheckedIn) return;
    setLoading(true);
    setError(null);
    
    try {
      const token = getAuthToken();
      if (!token) {
        setError("Authentication token not found. Please log in.");
        router.push("/login");
        return;
      }

      // Prepare check-in data with proper format
      const checkInData: any = { 
        userId, 
        time: new Date().toISOString(),
        location 
      };

      // Include coordinates if using current location
      if (useCurrentLocation && currentGeolocation) {
        checkInData.coordinates = {
          latitude: currentGeolocation.latitude,
          longitude: currentGeolocation.longitude
        };
      }

      const response = await axios.post(
        `${API_BASE_URL}/session/checkin`,
        checkInData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      const sessionData = response.data.session || response.data;
      const newSession: CurrentSession = {
        id: sessionData._id,
        checkInTime: new Date(sessionData.checkIn),
        date: formatDate(new Date(sessionData.checkIn)),
        location,
      };
      setCurrentSession(newSession);
      setIsCheckedIn(true);

      // Add new session to history immediately
      const newHistoryEntry: AttendanceRecord = {
        id: sessionData._id,
        date: formatDate(new Date(sessionData.checkIn)),
        checkIn: formatTime(new Date(sessionData.checkIn)),
        checkOut: "-",
        duration: "-",
        location: location,
      };
      setHistory((prevHistory) => [newHistoryEntry, ...prevHistory]);

    } catch (err) {
      const error = err as AxiosError<ApiError>;
      setError(error.response?.data?.error || "Check-in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async (): Promise<void> => {
    if (loading || !currentSession || !isCheckedIn) return;
    setLoading(true);
    setError(null);
    
    try {
      const token = getAuthToken();
      if (!token) {
        setError("Authentication token not found. Please log in.");
        router.push("/login");
        return;
      }

      const response = await axios.put(
        `${API_BASE_URL}/session/checkout/${currentSession.id}`,
        { time: new Date().toISOString() },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
                     withCredentials: true,
        }
      );

      const sessionData = response.data.session || response.data;
      const checkOutTime = new Date(sessionData.checkOut!);
      
      // Update the existing history entry
      setHistory((prevHistory) => 
        prevHistory.map((record) => 
          record.id === sessionData._id 
            ? {
                ...record,
                checkOut: formatTime(checkOutTime),
                duration: calculateDuration(currentSession.checkInTime, checkOutTime),
              }
            : record
        )
      );
      
      setCurrentSession(null);
      setIsCheckedIn(false);
      // Don't clear current location on checkout - keep it for future use
      // setUseCurrentLocation(false);
      // setCurrentGeolocation(null);
    } catch (err) {
      const error = err as AxiosError<ApiError>;
      setError(error.response?.data?.error || "Check-out failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    // This function is no longer needed since we removed the dropdown
    // Keep it for backward compatibility but it won't be used
    if (!isCheckedIn) {
      setLocation(e.target.value);
      setUseCurrentLocation(false);
      setCurrentGeolocation(null);
    }
  };
    const handleTabChange = (tab: "dashboard" | "history"): void => {
    setActiveTab(tab);
  };

  const handleLogout = async (): Promise<void> => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      // Clear localStorage first
      if (typeof window !== "undefined") {
        localStorage.clear();
      }

      // Try to call logout API if token exists, but don't block logout if it fails
      if (token) {
        try {
          await axios.post(
            `${API_BASE_URL}/auth/logout`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              withCredentials: true,
            }
          );
        } catch (apiError) {
          // Log API error but don't prevent logout
          console.warn("Logout API call failed:", apiError);
        }
       }

      // Always redirect to login regardless of API success/failure
      setError(null);
      router.push("/login");
    } catch (err) {
      // Even if everything fails, clear data and redirect
      if (typeof window !== "undefined") {
        localStorage.clear();
      }
      setError(null);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while initial data is being fetched
  if (!initialDataLoaded && loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your attendance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
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
                <p className="text-gray-600">
                  {useCurrentLocation && currentGeolocation ? (
                    <span className="flex items-center">
                      <Navigation className="w-4 h-4 mr-1 text-blue-500" />
                      {location}
                    </span>
                  ) : (
                    location 
                  )}
                </p>
              </div>
            </div>
            <div className="text-right space-y-2">
              <p className="text-sm text-gray-500">Today</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatDate(new Date())}
              </p>
              <button
                onClick={handleLogout}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:bg-gray-400"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
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
                      <p className="text-lg font-semibold text-green-800 flex items-center justify-center">
                        {useCurrentLocation && (
                          <Navigation className="w-4 h-4 mr-1 text-blue-500" />
                        )}
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
                
                {/* Current Location Section */}
                <div className="space-y-4">
                  {!useCurrentLocation ? (
                    <div>
                      <button
                        onClick={handleGetCurrentLocation}
                        disabled={isCheckedIn || locationLoading || loading}
                        className="flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed w-full justify-center"
                      >
                        {locationLoading ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        ) : (
                          <Navigation className="w-5 h-5 mr-2" />
                        )}
                        {locationLoading ? "Detecting Location..." : "Get My Current Location"}
                      </button>
                      
                      {/* Location Permission Instructions */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                        <p className="text-sm text-blue-800 font-medium mb-2">📍 How to enable location access:</p>
                        <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
                          <li>Click "Get My Current Location" button above</li>
                          <li>Allow location access when browser asks</li>
                          <li>If blocked, click the lock icon in address bar</li>
                          <li>Set Location permission to "Allow"</li>
                          <li>Refresh the page and try again</li>
                        </ol>
                      </div>
                      
                      {locationError && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-3">
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="ml-3 flex-1">
                              <h3 className="text-sm font-medium text-red-800">Location Error</h3>
                              <p className="text-sm text-red-700 mt-1">{locationError}</p>
                              
                              {locationError.includes("denied") && (
                                <div className="mt-3 bg-white border border-red-200 rounded p-3">
                                  <p className="text-xs font-medium text-red-800 mb-2">To fix this:</p>
                                  <div className="text-xs text-red-700 space-y-1">
                                    <p><strong>Chrome/Edge:</strong> Click the 🔒 icon → Site settings → Location → Allow</p>
                                    <p><strong>Firefox:</strong> Click the 🛡️ icon → Permissions → Location → Allow</p>
                                    <p><strong>Safari:</strong> Safari → Preferences → Websites → Location</p>
                                  </div>
                                  <button
                                    onClick={() => {
                                      setLocationError(null);
                                      window.location.reload();
                                    }}
                                    className="mt-2 text-xs bg-red-100 hover:bg-red-200 text-red-800 px-2 py-1 rounded"
                                  >
                                    Refresh Page
                                  </button>
                                </div>
                              )}
                              
                              {locationError.includes("unavailable") && (
                                <div className="mt-3 bg-white border border-red-200 rounded p-3">
                                  <p className="text-xs text-red-700">
                                    Please check that:
                                    <br />• GPS/Location services are enabled on your device
                                    <br />• You have an internet connection
                                    <br />• Try moving to an area with better signal
                                  </p>
                                </div>
                              )}
                              
                              {locationError.includes("timeout") && (
                                <div className="mt-3 bg-white border border-red-200 rounded p-3">
                                  <p className="text-xs text-red-700">
                                    Location detection timed out. This might happen if:
                                    <br />• GPS signal is weak
                                    <br />• You're indoors or in a covered area
                                    <br />• Network connection is slow
                                  </p>
                                  <button
                                    onClick={handleGetCurrentLocation}
                                    disabled={locationLoading}
                                    className="mt-2 text-xs bg-red-100 hover:bg-red-200 text-red-800 px-2 py-1 rounded"
                                  >
                                    Try Again
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm text-green-800 font-medium flex items-center mb-2">
                            <Navigation className="w-4 h-4 mr-1" />
                            Location Detected Successfully
                          </p>
                          <div className="space-y-1">
                            <p className="text-sm text-green-700">
                              <span className="font-medium">Address:</span> {currentGeolocation?.address}
                            </p>
                            <p className="text-xs text-green-600">
                              <span className="font-medium">Coordinates:</span> {currentGeolocation?.latitude.toFixed(6)}, {currentGeolocation?.longitude.toFixed(6)}
                            </p>
                            {currentGeolocation?.timestamp && (
                              <p className="text-xs text-green-500">
                                <span className="font-medium">Detected:</span> {new Date(currentGeolocation.timestamp).toLocaleString('en-IN', {
                                  timeZone: 'Asia/Kolkata',
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {!isCheckedIn && (
                          <div className="flex flex-col space-y-1 ml-2">
                            <button
                              onClick={handleGetCurrentLocation}
                              disabled={locationLoading}
                              className="text-green-600 hover:text-green-800 p-1"
                              title="Update location"
                            >
                              {locationLoading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                              ) : (
                                <RefreshCw className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => {
                                setUseCurrentLocation(false);
                                setCurrentGeolocation(null);
                                setLocation("");
                                // Clear saved location data
                                if (typeof window !== "undefined") {
                                  localStorage.removeItem("currentGeolocation");
                                  localStorage.removeItem("useCurrentLocation");
                                }
                              }}
                              className="text-red-500 hover:text-red-700 p-1"
                              title="Clear location"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {!location && !useCurrentLocation && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Please get your current location before checking in
                    </p>
                  )}
                  
                  
                </div>
              </div>
              
              <div className="flex justify-center space-x-4">
                {!isCheckedIn ? (
                  <button
                    onClick={handleCheckIn}
                    disabled={loading || !location}
                    className="flex items-center px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    ) : (
                      <LogIn className="w-5 h-5 mr-2" />
                    )}
                    {loading ? "Checking In..." : "Check In"}
                  </button>
                ) : (
                  <button
                    onClick={handleCheckOut}
                    disabled={loading}
                    className="flex items-center px-8 py-4 bg-gradient-to-r from-red-500 to-pink-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-pink-700 transform hover:scale-105 transition-all duration-200 shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none"
                  >
      
                    {loading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    ) : (
                      <LogOut className="w-5 h-5 mr-2" />
                    )}
                    {loading ? "Checking Out..." : "Check Out"}
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

