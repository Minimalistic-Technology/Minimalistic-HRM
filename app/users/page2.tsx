/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
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
import {
  formatTime,
  getAuthToken,
  getUserLocationDetails,
} from "../functions/helperFunctions";
import { useAuth } from "../context/AuthContext";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import { setLocation, setUser } from "../store/authSlice";

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
  // const {user,token} = useAuth();
  const { location, token, user } = useSelector(
    (store: RootState) => store.auth
  );
  const dispatch = useDispatch();

  // Refs for intervals
  const midnightCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/hrm";

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
  useEffect(() => {
    const fetchStatus = async () => {
      if (!history) return;
      const lastHistory = history[history.length - 1];
      console.log(lastHistory)
      if (history && lastHistory?.checkOut === null) {
        const lastDate = new Date(lastHistory.checkIn.dateTime);
        const endOfDay = new Date(lastDate);
        console.log(endOfDay,new Date())
        endOfDay.setHours(23, 59, 59, 999);

        if (new Date() > endOfDay) {
          // Session expired → show Check In
          setIsCheckedIn(false);
          console.log(isCheckedIn)
          return;
        }

        // Still same day → show Checkout
        // setStatus("checkedIn");
        setIsCheckedIn(true);
      } else {
        setIsCheckedIn(false);
        // setStatus("checkedOut");
      }
    };

    fetchStatus();
  }, [history]);

  useEffect(() => {
    const userString = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    const locationString = localStorage.getItem("location");

    const user = userString ? JSON.parse(userString) : null;
    const location = locationString ? JSON.parse(locationString) : null;

    if (user && token && location) {
      dispatch(setUser({ user, token }));
      dispatch(setLocation(location));
    }
  }, [dispatch]);

  useEffect(() => {
    console.log(isCheckedIn, history && history[history?.length - 1]);
  }, [isCheckedIn, history]);
  // useEffect(() => {
  //   if (error !== "Authentication token not found. Please log in.")
  //     setIsCheckedIn(history && history[history.length - 1]?.checkOut === null);
  // }, [history, error]);

  const fetchUserHistory = async () => {
    try {
      console.log(token);
      if (!token) {
        console.warn("No token, skipping history fetch");
        return;
      }
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
      setHistory(historyResponse.data[0]?.history);

      let historyData = [];

      // Handle different response formats
      if (
        historyResponse.data?.history &&
        Array.isArray(historyResponse.data.history)
      ) {
        historyData = historyResponse.data.history;
      }

      console.log("Processing history data:", historyData);
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
  const fetchUserDataAndHistory = async (): // userIdParam: string
  Promise<void> => {
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

      fetchUserHistory();
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      throw error;
    }
  };

  useEffect(() => {
    if (!token) return;
    if (error !== "Authentication token not found. Please log in.") {
      const fetchData = async () => {
        try {
          setLoading(true);
          setError(null);

          // const token = getAuthToken();
          if (!token) {
            console.log("here");

            setError("Authentication token not found. Please log in.");
            return;
          }

          // console.log("Starting data fetch for user:", userId);

          await fetchUserDataAndHistory();

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
  }, [token]);


  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, [user]);

  // if (error === "Authentication token not found. Please log in.") {
  //   return;
  // }

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
      // const token = getAuthToken();

      if (!token) {
        console.log("here");
        setError("Authentication token not found. Please log in.");
        return;
      }

      const history = {
        // userId: userId,
        checkIn: {
          city: location.city,
          state: location.state ? location.state : "",
          country: location.country,
          ip: location.ip ? location.ip : "",
          lat:location.lat,
          long:location.lon,
        },
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
      fetchUserHistory();

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
      // const token = getAuthToken();

      if (!token) {
        console.log("here");
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

      fetchUserHistory();
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

        <div className="bg-white rounded-2xl shadow-xl mb-8">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => handleTabChange("dashboard")}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === "dashboard"
                  ? "text-indigo-600   bg-white shadow-"
                  : "text-gray-500 hover:text-gray-700 bg-gray-300 opacity-70"
              }`}
            >
              <Clock className="w-5 h-5 inline-block mr-2" />
              Dashboard
            </button>
            <button
              onClick={() => {
                handleTabChange("history");
                // fetchUserHistory();
              }}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === "history"
                  ? "text-indigo-600   bg-white "
                  : "text-gray-500 hover:text-gray-700 bg-gray-300 opacity-70"
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
                        {location?.lat && (
                          <Navigation className="w-4 h-4 mr-1 text-blue-500" />
                        )}
                        {location?.lat}
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
                  {!location?.lat ? (
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
                      {location?.lat}
                    </div>
                  )}

                  {!location?.lat && (
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
                    disabled={loading || !location?.lat}
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
                  {history?.length > 0
                    ? `${history.length} records`
                    : "No records"}
                </div>
              </div>
              {history?.length === 0 ? (
                <div className="text-center py-6">
                  <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No attendance history yet</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Check in to start tracking your attendance
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* {history?.map((record) => {
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

                    return ( */}
                  <div className="overflow-x-auto">
                    <table className="min-w-[700px] border-collapse border border-gray-200 rounded-lg">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                            Check-In Date
                          </th>
                          <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                            Check-Out Date
                          </th>
                          <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                            Location
                          </th>
                          <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">
                            Check-In Time
                          </th>
                          <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">
                            Check-Out Time
                          </th>
                          <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">
                            Duration
                          </th>
                          <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {history?.map((record) => {
                          const formatDuration = (duration: number) => {
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

                          const durationFormatted = `
          ${
            formatDuration(duration).days
              ? `${formatDuration(duration).days} d `
              : ""
          }
          ${
            formatDuration(duration).hours
              ? `${formatDuration(duration).hours} h `
              : ""
          }
          ${
            formatDuration(duration).minutes
              ? `${formatDuration(duration).minutes} m `
              : ""
          }
          ${
            formatDuration(duration).duration ||
            formatDuration(duration).duration === 0
              ? `${formatDuration(duration).duration} m`
              : ""
          }
        `;

                          return (
                            <tr
                              key={record._id}
                              className="border-t hover:bg-gray-50"
                            >
                              {/* Check-in Date */}
                              <td className="px-4 py-2 text-sm font-medium text-gray-900">
                                {new Date(
                                  record.checkIn?.dateTime
                                ).toLocaleDateString()}
                              </td>

                              {/* Check-out Date */}
                              <td className="px-4 py-2 text-sm font-medium text-gray-900">
                                {record.checkOut
                                  ? new Date(
                                      record.checkOut?.dateTime
                                    ).toLocaleDateString()
                                  : "-"}
                              </td>

                              {/* Location */}
                              <td className="px-4 py-2 text-sm text-gray-600">
                                {record.checkIn?.city}
                              </td>

                              {/* Check-in Time */}
                              <td className="px-4 py-2 text-sm text-green-600 text-center">
                                {record.checkIn?.dateTime
                                  ? formatTime(
                                      new Date(record.checkIn.dateTime)
                                    )
                                  : "-"}
                              </td>

                              {/* Check-out Time */}
                              <td
                                className={`px-4 py-2 text-sm text-center ${
                                  record.checkOut
                                    ? "text-red-600"
                                    : "text-gray-400"
                                }`}
                              >
                                {record.checkOut?.dateTime
                                  ? formatTime(
                                      new Date(record.checkOut.dateTime)
                                    )
                                  : "-"}
                              </td>

                              {/* Duration */}
                              <td className="px-4 py-2 text-sm font-semibold text-indigo-600 text-center">
                                {durationFormatted}
                              </td>

                              {/* Status */}
                              <td className="px-4 py-2 text-sm text-center">
                                {record.checkOut === null ? (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Active
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
                                    Completed
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* ); */}
                  {/* })} */}
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
