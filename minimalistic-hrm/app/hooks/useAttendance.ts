import { useState, useEffect, useRef, useCallback } from 'react';
// import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import axios, { AxiosError } from 'axios';
import { RootState } from '../store/store';

import { getUserLocationDetails } from '../functions/helperFunctions';
import { AttendanceRecord, CurrentSession, ApiError } from '../types';

export const useAttendance = () => {
  const [currentSession, setCurrentSession] = useState<CurrentSession | null>(null);
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [userName, setUserName] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"dashboard" | "history">("dashboard");
  const [userId, setUserId] = useState<string>("");
 
  const [loading, setLoading] = useState<boolean>(false);
  
  
  const { location, token, user } = useSelector((store: RootState) => store.auth);


  const midnightCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = useRef<boolean>(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/hrm";

  // Memoize the fetch function to prevent unnecessary re-creations
  const fetchUserHistory = useCallback(async () => {
    if (!token) {
      console.warn("No token, skipping history fetch");
      return;
    }

    try {
      setLoading(true);
      const historyResponse = await axios.get(`${API_BASE_URL}/HistoryByUserId`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      setHistory(historyResponse.data[0]?.history || []);
    } catch (historyError) {
      console.error("Failed to fetch history:", historyError);
      const error = historyError as AxiosError<ApiError>;
      setHistory([]);

      if (error.response?.status !== 404) {
        console.warn("History fetch failed:", error.response?.data?.error || "Unknown error");
      }
    } finally {
      setLoading(false);
    }
  }, [token, API_BASE_URL]);

  const fetchUserDataAndHistory = useCallback(async (): Promise<void> => {
    if (!token) {
      console.warn("No token, skipping user data fetch");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/access-control/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      
      const data = await response?.data;
      setUserName(data?.username || "");
      setUserId(data?.id || "");
      
      // Fetch history after getting user data
      await fetchUserHistory();
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      setLoading(false);
      throw error;
    }
  }, [token, API_BASE_URL, fetchUserHistory]);

  // Initial data fetch - runs only once when token becomes available
  useEffect(() => {
    if (token && !isInitializedRef.current) {
      isInitializedRef.current = true;
      fetchUserDataAndHistory();
    }
  }, [token, fetchUserDataAndHistory]);

  // Reset initialization flag when token changes (logout/login)
  useEffect(() => {
    if (!token) {
      isInitializedRef.current = false;
      setHistory([]);
      setUserName("");
      setUserId("");
      setCurrentSession(null);
    }
  }, [token]);

  const handleCheckIn = useCallback(async (): Promise<void> => {
    if (!location) {
      throw new Error("Please set your location before checking in.");
    }

    try {
      if (!token) {
        throw new Error("Authentication token not found. Please log in.");
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

      const response = await axios.post(`${API_BASE_URL}/checkin`, { history }, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      // Only fetch history after successful check-in
      await fetchUserHistory();
    } catch (err) {
      console.error("Check-in failed:", err);
      const error = err as AxiosError<ApiError>;
      throw new Error(`Check-in failed: ${error.response?.data?.error || "Unknown error"}`);
    }
  }, [location, token, API_BASE_URL, fetchUserHistory]);

  const handleCheckOut = useCallback(async (): Promise<void> => {
    try {
      if (!token) {
        throw new Error("Authentication token not found. Please log in.");
      }

      const checkOut = await getUserLocationDetails();

      const response = await axios.put(`${API_BASE_URL}/checkout`, { checkOut }, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      // Only fetch history after successful check-out
      await fetchUserHistory();
      setCurrentSession(null);
    } catch (err) {
      console.error("Check-out failed:", err);
      const error = err as AxiosError<ApiError>;
      throw new Error(`Check-out failed: ${error.response?.data?.error || "Unknown error"}`);
    }
  }, [token, API_BASE_URL, fetchUserHistory]);

  
 
  return {
    // State
    currentSession,
    history,
    userName,
    activeTab,
    userId,
    
    location,
    token,
    user,
    loading,
    
    // Actions
    setActiveTab,
    handleCheckIn,
    handleCheckOut,
    fetchUserHistory,
    fetchUserDataAndHistory,
    
    // Refs
    midnightCheckIntervalRef,
    countdownIntervalRef,
    
    // Constants
    API_BASE_URL,
  };
};