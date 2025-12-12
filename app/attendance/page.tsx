"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiCheckCircle, FiXCircle } from "react-icons/fi";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

import { useAtomValue } from "jotai";
import { roleAtom } from "@/store/roleAtom";
import { locationAtom } from "@/store/locationAtom";
import { getAuthToken } from "../functions/helperFunctions";

interface Session {
  checkIn: {
    dateTime: string;
    city?: string;
    state?: string;
    country?: string;
    ip?: string;
    lat?: number;
    lon?: number;
  };
  checkOut?: {
    dateTime: string;
    city?: string;
    state?: string;
    country?: string;
    ip?: string;
    lat?: number;
    lon?: number;
  };
}

interface Attendance {
  _id: string;
  user: string;
  date: string;
  sessions: Session[];
  totalHours: number;
}

const API_BASE = "http://localhost:5000/hrm";

const UserDashboard: React.FC = () => {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "history">(
    "dashboard"
  );

  const router = useRouter();

  // 🔹 Jotai global state
  const role = useAtomValue(roleAtom);
  const location = useAtomValue(locationAtom);



  const calculateTotalHours = (sessions: Session[]) => {
    let totalMs = 0;

    sessions.forEach((s) => {
      if (s.checkOut) {
        totalMs +=
          new Date(s.checkOut.dateTime).getTime() -
          new Date(s.checkIn.dateTime).getTime();
      }
    });

    return (totalMs / (1000 * 60 * 60)).toFixed(2); // hours
  };

  const todayStr = new Date().toISOString().split("T")[0];

  const todayAttendance = attendance.find((a) => a.date === todayStr);

  const todayHours =
    todayAttendance && todayAttendance.sessions.length > 0
      ? calculateTotalHours(todayAttendance.sessions)
      : "0.00";



  const token = getAuthToken();
  console.log(token);

const fetchAttendance = async () => {
  try {
    const token = getAuthToken(); // same helper you used in the working fetch example

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await axios.get(`${API_BASE}/attendance/emp/attendance`, {
      headers,
      withCredentials: true, // <-- important for axios (equivalent to credentials: 'include')
    });

    setAttendance(res.data);
    checkCurrentStatus(res.data);
  } catch (err) {
    console.error("fetchAttendance error:", err);
  } 
};


  const checkCurrentStatus = (records: Attendance[]) => {
    if (records.length === 0) return setIsCheckedIn(false);

    const todayStr = new Date().toISOString().split("T")[0];
    const todayRecord = records.find((r) => r.date === todayStr);

    if (!todayRecord) return setIsCheckedIn(false);

    const lastSession = todayRecord.sessions[todayRecord.sessions.length - 1];

    setIsCheckedIn(!!(lastSession && !lastSession.checkOut));
  };

  useEffect(() => {
    if (token) {
      fetchAttendance();
    }
  }, [token]);

  // 🔹 Use Jotai location if available, else fallback to geolocation
  const getUserLocation = async () => {
    if (location) {
      // Use location stored during login
      return location;
    }

    // Fallback: browser geolocation
    return new Promise<{
      city?: string;
      state?: string;
      country?: string;
      lat?: number;
      lon?: number;
      ip?: string;
    }>((resolve, reject) => {
      if (!navigator.geolocation) return reject("Geolocation not supported");
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({
            city: "Unknown",
            country: "Unknown",
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
          }),
        (err) => reject(err)
      );
    });
  };

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      const loc = await getUserLocation();
      await axios.post(`${API_BASE}/attendance/checkin`, loc, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchAttendance();
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || "Check-in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      const loc = await getUserLocation();
      await axios.post(`${API_BASE}/attendance/checkout`, loc, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchAttendance();
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || "Check-out failed");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString();
  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString();

  const currentSession = attendance.length
    ? attendance[0].sessions[attendance[0].sessions.length - 1]
    : null;

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-5xl px-4">
        {/* Header */}
        <header className="mb-8 flex flex-col gap-1">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
            Attendance Dashboard
          </h2>

          {role && (
            <p className="text-sm text-slate-500">
              Logged in as{" "}
              <span className="font-medium text-slate-800">{role}</span>
            </p>
          )}
        </header>

        {/* Tabs */}
        <div className="mb-8">
          <div className="inline-flex rounded-full bg-slate-100 p-1 text-sm">
            <button
              className={`px-4 py-1.5 rounded-full transition ${activeTab === "dashboard"
                  ? "bg-white shadow-sm text-slate-900"
                  : "text-slate-500 hover:text-slate-800"
                }`}
              onClick={() => setActiveTab("dashboard")}
            >
              Dashboard
            </button>
            <button
              className={`px-4 py-1.5 rounded-full transition ${activeTab === "history"
                  ? "bg-white shadow-sm text-slate-900"
                  : "text-slate-500 hover:text-slate-800"
                }`}
              onClick={() => setActiveTab("history")}
            >
              History
            </button>
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="space-y-4">

            {/* Status card */}
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
              <span className="text-sm font-medium text-slate-600">Status</span>
              {isCheckedIn ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                  <FiCheckCircle className="h-4 w-4" />
                  Checked in
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700">
                  <FiXCircle className="h-4 w-4" />
                  Not checked in
                </span>
              )}
            </div>

            {/* Total Hours Today */}
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Total hours today
              </p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">
                {todayHours} hrs
              </p>
            </div>

            {/* Location card */}
            {location && (
              <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Current location
                </p>
                <p className="text-slate-700">
                  {location.city || "Unknown city"}
                  {location.state ? `, ${location.state}` : ""}
                  {location.country ? `, ${location.country}` : ""}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              {!isCheckedIn ? (
                <button
                  onClick={handleCheckIn}
                  disabled={loading}
                  className="flex-1 rounded-lg border border-emerald-500 bg-emerald-500/90 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-600 disabled:border-slate-200 disabled:bg-slate-200 disabled:text-slate-500"
                >
                  {loading ? "Checking in..." : "Check in"}
                </button>
              ) : (
                <button
                  onClick={handleCheckOut}
                  disabled={loading}
                  className="flex-1 rounded-lg border border-rose-500 bg-rose-500/90 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-rose-600 disabled:border-slate-200 disabled:bg-slate-200 disabled:text-slate-500"
                >
                  {loading ? "Checking out..." : "Check out"}
                </button>
              )}
            </div>

            {/* Current Session Card */}
            {isCheckedIn && currentSession && (
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 px-4 py-4">
                <h3 className="mb-2 text-sm font-semibold text-emerald-900">
                  Current session
                </h3>
                <div className="space-y-1 text-sm text-emerald-900/80">
                  <p>
                    <span className="text-xs uppercase tracking-wide text-emerald-700/80">
                      Date
                    </span>
                    <br />
                    {formatDate(currentSession.checkIn.dateTime)}
                  </p>
                  <p>
                    <span className="text-xs uppercase tracking-wide text-emerald-700/80">
                      Check-in time
                    </span>
                    <br />
                    {formatTime(currentSession.checkIn.dateTime)}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-4">
            {attendance.length === 0 ? (
              <p className="text-sm text-slate-500">
                No attendance records yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Date
                      </th>
                      <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Check-in
                      </th>
                      <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Check-out
                      </th>
                      <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Hours
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.map((record) =>
                      record.sessions.map((session, idx) => {
                        const hours = session.checkOut
                          ? (
                            (new Date(session.checkOut.dateTime).getTime() -
                              new Date(session.checkIn.dateTime).getTime()) /
                            (1000 * 60 * 60)
                          ).toFixed(2)
                          : "-";

                        return (
                          <tr
                            key={`${record._id}-${idx}`}
                            className="border-b border-slate-100 last:border-none hover:bg-slate-50/80"
                          >
                            <td className="px-3 py-2 text-slate-700">
                              {formatDate(record.date)}
                            </td>
                            <td className="px-3 py-2 text-slate-700">
                              {formatTime(session.checkIn.dateTime)}
                            </td>
                            <td className="px-3 py-2 text-slate-700">
                              {session.checkOut
                                ? formatTime(session.checkOut.dateTime)
                                : "-"}
                            </td>
                            <td className="px-3 py-2 text-slate-700">
                              {hours}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
