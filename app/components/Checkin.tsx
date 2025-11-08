"use client";
import React, { useState, useEffect } from "react";
import { LogIn, LogOut, MapPin, Navigation } from "lucide-react";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { getUserLocationDetails } from "../functions/helperFunctions";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store/store";
import { setLocation, setUser } from "../store/authSlice";

interface ApiError {
  error: string;
  
}

const DashboardPage: React.FC = () => {
  const [isCheckedIn, setIsCheckedIn] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const { location, token, user } = useSelector((store: RootState) => store.auth);
  const dispatch = useDispatch();
  const router = useRouter();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/hrm";

  useEffect(() => {
    if (!user) router.replace("/login");
  }, [user, router]);

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
    setLoading(false);
  }, [dispatch]);

  const handleCheckIn = async (): Promise<void> => {
    if (!location) {
      setError("Please set your location before checking in.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      if (!token) {
        setError("Authentication token not found. Please log in.");
        return;
      }

      const history = {
        checkIn: {
          city: location.city,
          state: location.state ? location.state : "",
          country: location.country,
          ip: location.ip ? location.ip : "",
          lat: location.lat,
          long: location.lon,
        },
        checkOut: null,
      };

      await axios.post(
        `${API_BASE_URL}/checkin`,
        { history },
        {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      setIsCheckedIn(true);
      setError(null);
    } catch (err) {
      const error = err as AxiosError<ApiError>;
      setError(`Check-in failed: ${error.response?.data?.error || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      if (!token) {
        setError("Authentication token not found. Please log in.");
        return;
      }

      const checkOut = await getUserLocationDetails();

      await axios.put(
        `${API_BASE_URL}/checkout`,
        { checkOut },
        {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      setIsCheckedIn(false);
      setError(null);
    } catch (err) {
      const error = err as AxiosError<ApiError>;
      setError(`Check-out failed: ${error.response?.data?.error || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      

      {/* Page Heading */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2"></h1>
        {/* <p className="text-gray-600">Manage your daily attendance </p> */}
      </div>

      {/* Main Content Grid */}
      <div className="max-w-3xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
             


        {/* Check-in/Check-out Card */}
        <div className="bg-white rounded-xl shadow-lg p-6">
                    <p className="text-gray-900 pl-14 mb-2">Manage your daily attendance </p>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-2 py-2 rounded mb-2">
              {error}
            </div>
          )}

          {/* Status */}
          <div className="text-center mb-4">
            <div
              className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                isCheckedIn ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
              }`}
            >
              <div className={`w-2 h-2 rounded-full mr-2 ${isCheckedIn ? "bg-green-500" : "bg-gray-500"}`} />
              {isCheckedIn ? "Checked In" : "Checked Out"}
            </div>
          </div>

          {/* Location */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-3 h-3 inline-block mr-1" /> Current Location
            </label>
            {!location?.lat ? (
              <button
                onClick={getUserLocationDetails}
                disabled={isCheckedIn || loading}
                className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Get Current Location
              </button>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
                <Navigation className="w-4 h-4 mr-2 text-blue-500" />
                {location?.lat}, {location?.lon}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-3">
            {!isCheckedIn ? (
              <button
                onClick={handleCheckIn}
                disabled={loading || !location?.lat}
                className="px-8 py-4 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700"
              >
                {loading ? "Checking In..." : <><LogIn className="w-5 h-5 inline mr-2" /> Check In</>}
              </button>
            ) : (
              <button
                onClick={handleCheckOut}
                disabled={loading}
                className="px-8 py-4 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700"
              >
                {loading ? "Checking Out..." : <><LogOut className="w-5 h-5 inline mr-2" /> Check Out</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
