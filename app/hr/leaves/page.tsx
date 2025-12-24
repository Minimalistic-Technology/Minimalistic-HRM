"use client";

import React, { useEffect, useState } from "react";
import { Check, X, Loader2, RefreshCw } from "lucide-react";
import { getAuthToken } from "../../functions/helperFunctions";
import axios from "axios";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASEURL + "/hrm/leaves";

// Shape from backend
interface LeaveApi {
  _id: string;
  user_id: string;
  email?: string;
  leaveType?: string;
  from: string;
  to: string;
  reason?: string;
  status: "Pending" | "Approved" | "Rejected";
  appliedAt?: string;
  handledBy?: string;
}

// Shape used in UI
interface LeaveRow {
  id: string;
  employeeEmail: string;
  leaveType: string;
  fromDate: string;
  toDate: string;
  days: number;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  appliedAt: string;
}

const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return "-";
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const calculateDays = (fromDate: string, toDate: string): number => {
  if (!fromDate || !toDate) return 0;
  const from = new Date(fromDate);
  const to = new Date(toDate);
  const diffTime = Math.abs(to.getTime() - from.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

const getStatusStyle = (status: LeaveRow["status"]): string => {
  switch (status) {
    case "Approved":
      return "text-green-600 bg-green-50 px-3 py-1 rounded-full text-xs font-medium";
    case "Rejected":
      return "text-red-600 bg-red-50 px-3 py-1 rounded-full text-xs font-medium";
    case "Pending":
      return "text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full text-xs font-medium";
    default:
      return "text-gray-600 bg-gray-50 px-3 py-1 rounded-full text-xs font-medium";
  }
};

const HrLeavePage: React.FC = () => {
  const [leaves, setLeaves] = useState<LeaveRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const mapLeave = (leave: LeaveApi): LeaveRow => {
    const fromISO =
      typeof leave.from === "string" ? leave.from : String(leave.from);
    const toISO = typeof leave.to === "string" ? leave.to : String(leave.to);

    const fromDate = fromISO.split("T")[0];
    const toDate = toISO.split("T")[0];

    return {
      id: leave._id,
      employeeEmail: leave.email || "-",
      leaveType: leave.leaveType || "Leave",
      fromDate,
      toDate,
      days: calculateDays(fromDate, toDate),
      reason: leave.reason || "",
      status: leave.status,
      appliedAt: leave.appliedAt || "",
    };
  };

  const token = getAuthToken();

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get<LeaveApi[]>(`${API_BASE_URL}/leaves`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true, // ✅ send cookies
      });

      const data = res.data;
      setLeaves(data.map(mapLeave));
    } catch (err: any) {
      console.error("Fetch leaves error:", err);

      const message =
        err.response?.data?.message || err.message || "Failed to fetch leaves";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleAction = async (id: string, action: "Approved" | "Rejected") => {
    try {
      setActionLoadingId(id);

      const res = await axios.put(
        `${API_BASE_URL}/handle/${id}`,
        { action }, // backend expects { action }
        {
          headers: { Authorization: `Bearer ${getAuthToken()}` },
          withCredentials: true, // ✅ cookie auth
        }
      );

      const updatedLeave: LeaveApi = res.data.leave;

      setLeaves((prev) =>
        prev.map((l) =>
          l.id === updatedLeave._id ? { ...l, status: updatedLeave.status } : l
        )
      );
    } catch (err: any) {
      console.error("Handle leave error:", err);

      const message =
        err.response?.data?.message ||
        err.message ||
        "Error updating leave status";

      alert(message);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                HR Leave Requests
              </h1>
              <p className="text-sm text-gray-500">
                Review and manage all employee leave applications
              </p>
            </div>

            <button
              onClick={fetchLeaves}
              disabled={loading}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Refreshing...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>Refresh</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {error && (
            <div className="p-4 bg-red-50 text-red-700 text-sm border-b border-red-100">
              {error}
            </div>
          )}

          {loading && !leaves.length ? (
            <div className="p-8 flex items-center justify-center text-gray-500 text-sm">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Loading leave records...
            </div>
          ) : leaves.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              No leave records found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                      Employee Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                      Leave Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                      From
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                      To
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                      Days
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                      Applied At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leaves.map((leave) => (
                    <tr key={leave.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {leave.employeeEmail}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {leave.leaveType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(leave.fromDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(leave.toDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {leave.days}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 max-w-xs truncate">
                        {leave.reason || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(leave.appliedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getStatusStyle(leave.status)}>
                          {leave.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-2">
                          <button
                            disabled={
                              leave.status !== "Pending" ||
                              actionLoadingId === leave.id
                            }
                            onClick={() => handleAction(leave.id, "Approved")}
                            className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                          >
                            {actionLoadingId === leave.id ? (
                              <Loader2 className="w-3 h-3 animate-spin mr-1" />
                            ) : (
                              <Check className="w-3 h-3 mr-1" />
                            )}
                            Approve
                          </button>
                          <button
                            disabled={
                              leave.status !== "Pending" ||
                              actionLoadingId === leave.id
                            }
                            onClick={() => handleAction(leave.id, "Rejected")}
                            className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                          >
                            {actionLoadingId === leave.id ? (
                              <Loader2 className="w-3 h-3 animate-spin mr-1" />
                            ) : (
                              <X className="w-3 h-3 mr-1" />
                            )}
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HrLeavePage;
