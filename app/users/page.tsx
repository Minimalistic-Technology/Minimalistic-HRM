"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiCheckCircle, FiXCircle } from "react-icons/fi";

interface Session {
  checkIn: { dateTime: string; city: string; state?: string; country: string; ip?: string; lat?: number; long?: number };
  checkOut?: { dateTime: string; city: string; state?: string; country: string; ip?: string; lat?: number; long?: number };
}

interface Attendance {
  _id: string;
  user: string;
  date: string;
  sessions: Session[];
  totalHours: number;
}

const API_BASE = "http://localhost:5000/api/hrm";

const UserDashboard: React.FC = () => {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "history">("dashboard");

  const token = localStorage.getItem("token");

  const fetchAttendance = async () => {
    try {
      const res = await axios.get(`${API_BASE}/emp/attendance`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAttendance(res.data);
      checkCurrentStatus(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const checkCurrentStatus = (records: Attendance[]) => {
    if (records.length === 0) return setIsCheckedIn(false);
    const todayRecord = records.find(r => r.date === new Date().toISOString().split("T")[0]);
    if (!todayRecord) return setIsCheckedIn(false);
    const lastSession = todayRecord.sessions[todayRecord.sessions.length - 1];
    setIsCheckedIn(!!(lastSession && !lastSession.checkOut));
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const getUserLocation = async () => {
    return new Promise<{ city: string; country: string; lat?: number; long?: number }>((resolve, reject) => {
      if (!navigator.geolocation) return reject("Geolocation not supported");
      navigator.geolocation.getCurrentPosition(
        pos => resolve({ city: "Unknown", country: "Unknown", lat: pos.coords.latitude, long: pos.coords.longitude }),
        err => reject(err)
      );
    });
  };

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      const location = await getUserLocation();
      await axios.post(`${API_BASE}/checkin`, location, { headers: { Authorization: `Bearer ${token}` } });
      await fetchAttendance();
    } catch (err: any) {
      alert(err.response?.data?.message || "Check-in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      const location = await getUserLocation();
      await axios.post(`${API_BASE}/checkout`, location, { headers: { Authorization: `Bearer ${token}` } });
      await fetchAttendance();
    } catch (err: any) {
      alert(err.response?.data?.message || "Check-out failed");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateStr: string) => new Date(dateStr).toLocaleTimeString();
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString();

  const currentSession = attendance.length
    ? attendance[0].sessions[attendance[0].sessions.length - 1]
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Attendance Dashboard</h2>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            className={`px-6 py-2 rounded-lg font-medium ${activeTab === "dashboard" ? "bg-blue-600 text-white shadow" : "bg-gray-200 text-gray-700"}`}
            onClick={() => setActiveTab("dashboard")}
          >
            Dashboard
          </button>
          <button
            className={`px-6 py-2 rounded-lg font-medium ${activeTab === "history" ? "bg-blue-600 text-white shadow" : "bg-gray-200 text-gray-700"}`}
            onClick={() => setActiveTab("history")}
          >
            History
          </button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <div className="p-4 rounded-lg bg-white shadow flex items-center justify-between">
              <span className="font-semibold text-lg">Status:</span>
              {isCheckedIn ? (
                <span className="text-green-600 flex items-center gap-2 font-medium">
                  <FiCheckCircle /> Checked In
                </span>
              ) : (
                <span className="text-red-600 flex items-center gap-2 font-medium">
                  <FiXCircle /> Not Checked In
                </span>
              )}
            </div>

            <div className="flex gap-4">
              {!isCheckedIn ? (
                <button
                  onClick={handleCheckIn}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 disabled:bg-gray-400"
                >
                  {loading ? "Checking In..." : "Check In"}
                </button>
              ) : (
                <button
                  onClick={handleCheckOut}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 disabled:bg-gray-400"
                >
                  {loading ? "Checking Out..." : "Check Out"}
                </button>
              )}
            </div>

            {/* Current Session Card */}
            {isCheckedIn && currentSession && (
              <div className="p-5 bg-green-50 border border-green-200 rounded-xl shadow-md">
                <h3 className="text-xl font-semibold mb-3">Current Session</h3>
                <p className="text-gray-700">Date: {formatDate(currentSession.checkIn.dateTime)}</p>
                <p className="text-gray-700">Check-In Time: {formatTime(currentSession.checkIn.dateTime)}</p>
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <div className="overflow-x-auto bg-white shadow rounded-xl p-4">
            {attendance.length === 0 ? (
              <p className="text-gray-600">No attendance records yet.</p>
            ) : (
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-4 py-2 text-left">Date</th>
                    <th className="border px-4 py-2 text-left">Check-In</th>
                    <th className="border px-4 py-2 text-left">Check-Out</th>
                    <th className="border px-4 py-2 text-left">Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map(record =>
                    record.sessions.map((session, idx) => {
                      const hours = session.checkOut
                        ? ((new Date(session.checkOut.dateTime).getTime() - new Date(session.checkIn.dateTime).getTime()) / (1000 * 60 * 60)).toFixed(2)
                        : "-";
                      return (
                        <tr
                          key={`${record._id}-${idx}`}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="border px-4 py-2">{formatDate(record.date)}</td>
                          <td className="border px-4 py-2">{formatTime(session.checkIn.dateTime)}</td>
                          <td className="border px-4 py-2">{session.checkOut ? formatTime(session.checkOut.dateTime) : "-"}</td>
                          <td className="border px-4 py-2">{hours}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
