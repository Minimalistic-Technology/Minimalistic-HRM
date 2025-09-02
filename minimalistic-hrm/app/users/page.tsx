"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setLocation, setUser } from "../store/authSlice";
import { getUserLocationDetails } from "../functions/helperFunctions";
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { TabNavigation } from '../components/common/TabNavigation';
import { Dashboard } from '../components/attendance/Dashboard';
import { HistoryTab } from '../components/attendance/HistoryTab';

import { useAttendance } from "../hooks/useAttendance";
import { AxiosError } from "axios";

const CheckInOutApp: React.FC = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  
  // Add missing state setters
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isCheckedIn, setIsCheckedIn] = useState<boolean>(false);
  
  const {
    currentSession,
    history,
    activeTab,
    userId,
    location,
    token,
    user,
    setActiveTab,
    handleCheckIn,
    handleCheckOut,
    fetchUserDataAndHistory,
  } = useAttendance();

  // Initialize user data from localStorage
  useEffect(() => {
    const userString = localStorage.getItem("user");
    const tokenLocal = localStorage.getItem("token");
    const locationString = localStorage.getItem("location");

    const userData = userString ? JSON.parse(userString) : null;
    const locationData = locationString ? JSON.parse(locationString) : null;

    if (userData && tokenLocal && locationData) {
      dispatch(setUser({ user: userData, token: tokenLocal }));
      dispatch(setLocation(locationData));
    }
  }, [dispatch]);

  // Check authentication status
  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, [user, router]);

  // Fetch user data when token is available
  useEffect(() => {
    if (!token || error === "Authentication token not found. Please log in.") return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!token) {
          setError("Authentication token not found. Please log in.");
          return;
        }

        await fetchUserDataAndHistory();
      } catch (err) {
        
       
  console.error("Data fetch error:", err);
  const axiosError = err as AxiosError;

  if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
    setError("Session expired. Please log in again.");
  } else {
    setError( "Failed to fetch data");
  }
}
       finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, error, fetchUserDataAndHistory]);

  // Update check-in status based on history
  useEffect(() => {
    const fetchStatus = async () => {
      if (!history) return;
      const lastHistory = history[history.length - 1];
      
      if (history && lastHistory?.checkOut === null) {
        const lastDate = new Date(lastHistory.checkIn.dateTime);
        const endOfDay = new Date(lastDate);
        endOfDay.setHours(23, 59, 59, 999);

        if (new Date() > endOfDay) {
          setIsCheckedIn(false);
          return;
        }
        setIsCheckedIn(true);
      } else {
        setIsCheckedIn(false);
      }
    };

    fetchStatus();
  }, [history]);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      // Cleanup code would go here if needed
    };
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading your attendance data..." userId={userId} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {error && <ErrorMessage error={error} />}

        <div className="bg-white rounded-2xl shadow-xl mb-8">
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
          
          {activeTab === "dashboard" && (
            <Dashboard
              isCheckedIn={isCheckedIn}
            
              location={location}
              loading={loading}
              onCheckIn={handleCheckIn}
              onCheckOut={handleCheckOut}
              onGetLocation={getUserLocationDetails}
            />
          )}

          {activeTab === "history" && (
            <HistoryTab history={history} />
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckInOutApp;