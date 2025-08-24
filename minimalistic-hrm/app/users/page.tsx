/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Clock,
  LogIn,
  LogOut,
  History,
  User as UserIcon,
  Calendar,
  MapPin,
  Navigation,
  RefreshCw,
} from "lucide-react";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";

// Define interfaces
interface AttendanceRecord {
  _id: string;
  date: string;
  checkIn: any;
  checkOut: any;
  duration: any;
  location: any;
}

interface CurrentSession {
  id: string;
  checkInTime: Date;
  date: string;
  location: string;
}

interface Location {
  _id: string;
  userId: string;
  city: string;
  state: string;
  country: string;
  ip: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  address?: string;
  createdAt: string;
  updatedAt: string;
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

const CheckInOutApp: React.FC = () => {
  const [isCheckedIn, setIsCheckedIn] = useState<boolean>(false);
  const [currentSession, setCurrentSession] = useState<CurrentSession | null>(
    null
  );
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [userName, setUserName] = useState<string>("");
  const [location, setLocation] = useState<{
    city: string;
    state: string;
    country: string;
    ip: string;
  }>({ city: "", state: "", country: "", ip: "" });

  const [activeTab, setActiveTab] = useState<"dashboard" | "history">(
    "dashboard"
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  // const [initialDataLoaded, setInitialDataLoaded] = useState<boolean>(false);
  const [userId, setUserId] = useState<string>("");
  // const [autoCheckoutEnabled, setAutoCheckoutEnabled] = useState<boolean>(true);
  const [timeToMidnight, setTimeToMidnight] = useState<string>("");
  const router = useRouter();

  // Refs for intervals
  const midnightCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/hrm";

  // Get auth token from localStorage (browser-safe)
  const getAuthToken = (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  };

  // Get user's real IP address
  const getUserLocationDetails = async (): Promise<object> => {
    try {
      const ipRes = await fetch("https://api.ipify.org?format=json");
      const { ip } = await ipRes.json();

      // Get location from IP
      const geoRes = await fetch(`https://ipapi.co/${ip}/json/`);
      const { city, region: state, country } = await geoRes.json();
      setLocation({ city, ip, state, country });
      // console.log(location)
      return { city, ip, state, country };
    } catch (error) {
      console.warn("Failed to get real IP, using fallback:", error);
      return { ip: "127.0.0.1" };
    }
  };

  useEffect(() => {
    getUserLocationDetails();
  }, []);
  useEffect(() => {
    return () => {
      if (midnightCheckIntervalRef.current) {
        clearTimeout(midnightCheckIntervalRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  // Setup/cleanup midnight check when check-in status changes
  // useEffect(() => {
  //   // setupAutoCheckoutTimer();
  //   // setupCountdown();

  //   return () => {
  //     if (midnightCheckIntervalRef.current) {
  //       clearTimeout(midnightCheckIntervalRef.current);
  //     }
  //     if (countdownIntervalRef.current) {
  //       clearInterval(countdownIntervalRef.current);
  //     }
  //   };
  // }, [isCheckedIn, currentSession, autoCheckoutEnabled]);

  // Load auto checkout preference from localStorage
  // useEffect(() => {
  //   if (typeof window !== "undefined") {
  //     // const savedPreference = localStorage.getItem("autoCheckoutEnabled");
  //     if (savedPreference !== null) {
  //       setAutoCheckoutEnabled(savedPreference === "true");
  //     }
  //   }
  // }, []);

  useEffect(() => {
    console.log(isCheckedIn, history[history.length - 1]);
  }, [isCheckedIn, history]);
  useEffect(() => {
    if (error !== "Authentication token not found. Please log in.")
      setIsCheckedIn(history[history.length - 1]?.checkOut === null);
  }, [history, error]);

  const fetchUserHistory = async (token: string) => {
    try {
      const historyResponse = await axios.get(
        `${API_BASE_URL}/HistoryByUserId`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      console.log("History response:", historyResponse.data);
      setHistory(historyResponse.data[0].history);

      let historyData = [];

      // Handle different response formats
      if (
        historyResponse.data?.history &&
        Array.isArray(historyResponse.data.history)
      ) {
        historyData = historyResponse.data.history;
      }

      console.log("Processing history data:", historyData);

      // Find active session (no checkOut time)
      // let activeSession: CurrentSession | null = null;
      // const formattedHistory: AttendanceRecord[] = [];

      historyData[0]?.history.forEach((entry: any, index: number) => {
        // const sessionId = entry._id || entry.id || `${userIdParam}_${index}`;
        const checkInTime =
          entry.checkIn || entry.checkInTime || entry.createdAt;
        const checkOutTime = entry.checkOut || entry.checkOutTime || null;

        if (!checkInTime) {
          console.warn("Skipping entry without checkIn time:", entry);
          return;
        }

        const checkInDate = new Date(checkInTime.dateTime);

        // Check if this is an active session (no checkout)
        // if (!checkOutTime && !activeSession) {
        //   activeSession = {
        //     id: "",
        //     checkInTime: checkInDate,
        //     date: formatDate(checkInDate),
        //     location: "",
        //   };
        // }

        // Add to formatted history
        // formattedHistory.push({
        //   _id: "",
        //   date: formatDate(checkInDate),
        //   checkIn: formatTime(checkInDate),
        //   checkOut: checkOutTime
        //     ? formatTime(new Date(checkOutTime.dateTime))
        //     : "-",
        //   duration: checkOutTime
        //     ? calculateDuration(checkInDate, new Date(checkOutTime.dateTime))
        //     : "-",
        //   location: "",
        // });
      });
    } catch (historyError) {
      console.error("Failed to fetch history:", historyError);
      const error = historyError as AxiosError<ApiError>;

      // If history fetch fails, still allow the app to work
      setHistory([]);
      // setCurrentSession(null);
      setIsCheckedIn(false);

      // Show error only if it's not a 404 (no history yet)
      if (error.response?.status !== 404) {
        console.warn(
          "History fetch failed:",
          error.response?.data?.error || "Unknown error"
        );
      }
    }
  };

  // Simplified fetch user details and history
  const fetchUserDataAndHistory = async (
    token: string
    // userIdParam: string
  ): Promise<void> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/access-control/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      const data = await response?.data;

      setUserName(data?.username);

      fetchUserHistory(token);
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      throw error;
    }
  };

  useEffect(() => {
    if (error !== "Authentication token not found. Please log in.") {
      const fetchData = async () => {
        try {
          setLoading(true);
          setError(null);

          const token = getAuthToken();
          if (!token) {
            setError("Authentication token not found. Please log in.");
            return;
          }

          // console.log("Starting data fetch for user:", userId);

          await fetchUserDataAndHistory(token);

          // setInitialDataLoaded(true);
          console.log("Data fetch completed successfully");
        } catch (err) {
          console.error("Data fetch error:", err);
          const error = err as AxiosError<ApiError>;

          if (
            error.response?.status === 401 ||
            error.response?.status === 403
          ) {
            setError("Session expired. Please log in again.");
          } else {
            setError(error.response?.data?.error || "Failed to fetch data");
          }
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, []);
  useEffect(() => {
    if (error === "Authentication token not found. Please log in.") {
      router.replace("/login");
    }
  }, [error]);
  if (error === "Authentication token not found. Please log in.") {
    return;
  }
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

  // Handle Check In using session/checkin endpoint
  const handleCheckIn = async (): Promise<void> => {
    if (!location) {
      setError("Please set your location before checking in.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const token = getAuthToken();

      if (!token) {
        setError("Authentication token not found. Please log in.");
        return;
      }

      const history = {
        // userId: userId,
        checkIn: location,
        checkOut: null,
      };

      console.log("Sending check-in data:", history);

      const response = await axios.post(
        `${API_BASE_URL}/checkin`,
        { history },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      console.log("Check-in response:", response.data);

      setIsCheckedIn(true);
      fetchUserHistory(token);

      setError(null);
    } catch (err) {
      console.error("Check-in failed:", err);
      const error = err as AxiosError<ApiError>;
      setError(
        `Check-in failed: ${error.response?.data?.error || "Unknown error"}`
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle Check Out using session/checkout endpoint - FIXED
  const handleCheckOut = async (): Promise<void> => {
    // if (!currentSession) {
    //   setError("No active session found.");
    //   return;
    // }

    try {
      setLoading(true);
      setError(null);
      const token = getAuthToken();

      if (!token) {
        setError("Authentication token not found. Please log in.");
        return;
      }

      const checkOut = await getUserLocationDetails();

      console.log(
        "Sending check-out data for session:",
        // currentSession.id,
        checkOut
      );

      const response = await axios.put(
        `${API_BASE_URL}/checkout`,
        { checkOut },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      console.log("Check-out response:", response.data);

      const checkOutTime = new Date();

      fetchUserHistory(token);
      setCurrentSession(null);
      setIsCheckedIn(false);

      setError(null);
    } catch (err) {
      console.error("Check-out failed:", err);
      const error = err as AxiosError<ApiError>;
      setError(
        `Check-out failed: ${error.response?.data?.error || "Unknown error"}`
      );
    } finally {
      setLoading(false);
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
        localStorage.removeItem("token");
      }

      // Try to call logout API if token exists
      // if (token) {
      //   try {
      //     await axios.post(
      //       `${API_BASE_URL.replace("/checksession", "")}/auth/logout`,
      //       {},
      //       {
      //         headers: {
      //           Authorization: `Bearer ${token}`,
      //           "Content-Type": "application/json",
      //         },
      //         withCredentials: true,
      //       }
      //     );
      //   } catch (apiError) {
      //     console.warn("Logout API call failed:", apiError);
      //   }
      // }

      // Clear timers
      if (midnightCheckIntervalRef.current) {
        clearTimeout(midnightCheckIntervalRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }

      setError(null);
      window.location.href = "/login";
    } catch (err) {
      // Even if logout fails, clear everything and redirect
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
      setError(null);
      window.location.href = "/login";
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while initial data is being fetched
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your attendance data...</p>
          {userId && (
            <p className="text-sm text-gray-500 mt-2">User: {userId}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {error && (
          <div
            className={`border px-4 py-3 rounded-lg mb-4 ${
              error.includes("successful") || error.includes("updated")
                ? "bg-green-100 border-green-400 text-green-700"
                : "bg-red-100 border-red-400 text-red-700"
            }`}
          >
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
                  {location.city && (
                    <span className="flex items-center">
                      <Navigation className="w-4 h-4 mr-1 text-blue-500" />
                      {location?.city}
                    </span>
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
              History ({history.length})
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
              </div>

              {isCheckedIn && currentSession && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-8 border border-green-200">
                  <h3 className="text-lg font-semibold text-green-800 mb-4">
                    Current Session
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-green-600 mb-1">Location</p>
                      <p className="text-lg font-semibold text-green-800 flex items-center justify-center">
                        {location.city && (
                          <Navigation className="w-4 h-4 mr-1 text-blue-500" />
                        )}
                        {location.city}
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

                <div className="space-y-4">
                  {!location.city ? (
                    <div>
                      <button
                        onClick={getUserLocationDetails}
                        disabled={isCheckedIn || loading}
                        className="flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed w-full justify-center"
                      >
                        Get Current location
                      </button>
                    </div>
                  ) : (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      {location?.city}
                    </div>
                  )}

                  {!location.city && (
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
                    disabled={loading || !location.city}
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
                  {history.length > 0
                    ? `${history.length} records`
                    : "No records"}
                </div>
              </div>
              {history.length === 0 ? (
                <div className="text-center py-12">
                  <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No attendance history yet</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Check in to start tracking your attendance
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {history?.map((record) => {
                    const formatDuration = (duration: any) => {
                      if (duration > 59) {
                        if (duration > 24 * 60) {
                          const days = Math.floor(duration / 60 / 24);
                          const hours = Math.round(duration / 60) % 24;
                          return { days, hours };
                        } else {
                          const hours = Math.floor(duration / 60);
                          const minutes = Math.floor(duration % 60);
                          return { hours, minutes };
                        }
                      } else {
                        return { duration };
                      }
                    };
                    const duration = Math.floor(
                      (new Date(record?.checkOut?.dateTime).getTime() -
                        new Date(record?.checkIn?.dateTime).getTime()) /
                        1000 /
                        60
                    );

                    return (
                      <div
                        key={record._id}
                        className="bg-gray-50 rounded-xl p-10 hover:bg-gray-100 transition-colors min-w-[700px]"
                      >
                        <div className="flex items-center justify-between mb-5 ">
                          <div className="flex items-center pl-20 ">
                            <Calendar className="w-5 h-5 text-indigo-600" />
                            <span className="font-semibold text-gray-900 pl-1">
                              {new Date(
                                record.checkIn?.dateTime
                              ).toLocaleDateString()}
                            </span>
                            {record.checkOut === null ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Active
                              </span>
                            ) : (
                              <>
                                <Calendar className="w-5 h-5 text-indigo-600 ml-40" />
                                <span className="font-semibold inline-block min-w-10 pl-1 text-gray-900">
                                  {new Date(
                                    record.checkOut?.dateTime
                                  ).toLocaleDateString()}
                                </span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              {record.checkIn?.city}
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-sm text-gray-500 mb-3">
                              Check In
                            </p>
                            <p className="font-semibold text-green-600">
                              {record.checkIn?.dateTime
                                ? formatTime(new Date(record.checkIn.dateTime))
                                : "-"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 mb-3">
                              Check Out
                            </p>
                            <p
                              className={`font-semibold ${
                                record.checkOut === "-"
                                  ? "text-gray-400"
                                  : "text-red-600"
                              }`}
                            >
                              {record.checkOut?.dateTime
                                ? formatTime(new Date(record.checkOut.dateTime))
                                : "-"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 mb-1">
                              Duration
                            </p>
                            <p
                              className={`font-semibold ${
                                record.duration === "-"
                                  ? "text-gray-400"
                                  : "text-indigo-600"
                              }`}
                            >
                              {`${
                                formatDuration(duration).days
                                  ? `${formatDuration(duration).days + " d"}`
                                  : ""
                              }
                              ${
                                formatDuration(duration).hours
                                  ? `${formatDuration(duration).hours + " h"}`
                                  : ""
                              }
                              ${
                                formatDuration(duration).minutes
                                  ? `${formatDuration(duration).minutes + " m"}`
                                  : ""
                              }
                              ${
                                formatDuration(duration).duration ||
                                formatDuration(duration).duration === 0
                                  ? `${formatDuration(duration).duration} m`
                                  : ""
                              }
                              `}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
