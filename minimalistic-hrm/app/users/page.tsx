

"use client";
import React, { useState, useEffect } from "react";
import { Clock, LogIn, LogOut, History, User as UserIcon, Calendar, MapPin } from "lucide-react";
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
}

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
  const [loading, setLoading] = useState<boolean>(true);
  const [initialDataLoaded, setInitialDataLoaded] = useState<boolean>(false);
  const [userId, setUserId] = useState<string>("");
  const router = useRouter();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/checksession";

  // Get auth token from localStorage
  const getAuthToken = (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  };

  // Fetch initial data
  useEffect(() => {
    // Set userId and username from localStorage after mount
    if (typeof window !== "undefined") {
      const storedUserId = localStorage.getItem("userId") || "user123";
      const storedUsername = localStorage.getItem("username") || "Guest User";
      setUserId(storedUserId);
      setUserName(storedUsername);
    }
  }, []);

  // Separate useEffect for fetching data when userId changes
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

        // Fetch location data
        let fetchedLocations: Location[] = [];
        try {
          const locationResponse = await axios.get(`${API_BASE_URL}/location`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            withCredentials: true,
          });
          fetchedLocations = locationResponse.data;
          
          // Remove duplicate locations based on city, state, country combination
          const uniqueLocations = fetchedLocations.filter((location, index, self) => 
            index === self.findIndex((l) => 
              l.city === location.city && 
              l.state === location.state && 
              l.country === location.country
            )
          );
          
          setLocations(uniqueLocations);
          
          // Set location based on active session or default to first location
          if (activeSession) {
            // If there's an active session, try to find the matching location
            const sessionLocation = uniqueLocations.find(loc => 
              `${loc.city}, ${loc.state}, ${loc.country}` === activeSession.location
            );
            if (sessionLocation) {
              setLocation(`${sessionLocation.city}, ${sessionLocation.state}, ${sessionLocation.country}`);
            } else if (uniqueLocations.length > 0) {
              // Fallback to first available location
              setLocation(`${uniqueLocations[0].city}, ${uniqueLocations[0].state}, ${uniqueLocations[0].country}`);
            }
          } else if (uniqueLocations.length > 0 && !location) {
            // No active session, set default location
            setLocation(`${uniqueLocations[0].city}, ${uniqueLocations[0].state}, ${uniqueLocations[0].country}`);
          }
        } catch (locationError) {
          const error = locationError as AxiosError<ApiError>;
          setError(error.response?.data?.error || "Failed to fetch locations");
          return; // Don't continue if locations can't be fetched
        }

        // Handle active sessions - PRESERVE THE SESSION STATE
        if (activeSession) {
          // Set the current session state to reflect the active session
          const sessionLocation = activeSession.location || 
            (fetchedLocations.length > 0 ? `${fetchedLocations[0].city}, ${fetchedLocations[0].state}, ${fetchedLocations[0].country}` : location);
          
          const currentSessionData: CurrentSession = {
            id: activeSession._id,
            checkInTime: new Date(activeSession.checkIn),
            date: formatDate(new Date(activeSession.checkIn)),
            location: sessionLocation,
          };
          
          setCurrentSession(currentSessionData);
          setIsCheckedIn(true);
          
          // Update location to match the active session
          if (sessionLocation) {
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
            sessionLocation = location || "Unknown";
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
  }, [userId, router]);

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

      const response = await axios.post(
        `${API_BASE_URL}/session/checkin`,
        { userId, location },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      const session: Session = response.data;
      const newSession: CurrentSession = {
        id: session._id,
        checkInTime: new Date(session.checkIn),
        date: formatDate(new Date(session.checkIn)),
        location,
      };
      setCurrentSession(newSession);
      setIsCheckedIn(true);

      // Add new session to history immediately
      const newHistoryEntry: AttendanceRecord = {
        id: session._id,
        date: formatDate(new Date(session.checkIn)),
        checkIn: formatTime(new Date(session.checkIn)),
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
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      const session: Session = response.data;
      const checkOutTime = new Date(session.checkOut!);
      
      // Update the existing history entry
      setHistory((prevHistory) => 
        prevHistory.map((record) => 
          record.id === session._id 
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
    } catch (err) {
      const error = err as AxiosError<ApiError>;
      setError(error.response?.data?.error || "Check-out failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    if (!isCheckedIn) {
      setLocation(e.target.value);
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
                <p className="text-gray-600">{location || "Please choose a location"}</p>
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
                  Choose Location
                </label>
                <select
                  value={location}
                  onChange={handleLocationChange}
                  disabled={isCheckedIn || loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Please select your location</option>
                  {locations.map((loc) => {
                    const locationString = `${loc.city}, ${loc.state}, ${loc.country}`;
                    return (
                      <option
                        key={`${loc._id}-${loc.city}-${loc.state}-${loc.country}`}
                        value={locationString}
                      >
                        {locationString}
                      </option>
                    );
                  })}
                </select>
                {!location && (
                  <p className="text-sm text-gray-500 mt-2">
                    Please choose your location before checking in
                  </p>
                )}
                {isCheckedIn && (
                  <p className="text-sm text-blue-600 mt-2">
                    Location cannot be changed while checked in
                  </p>
                )}
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