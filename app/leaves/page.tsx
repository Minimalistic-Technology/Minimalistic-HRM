"use client";

import React, { useEffect, useState } from "react";
import { Edit, Trash2, Plus, X, Calendar, User, FileText } from "lucide-react";
import { getAuthToken } from "../functions/helperFunctions";

const API_BASE_URL = "http://localhost:5000/hrm/leaves";

interface LeaveRecord {
  id: string;
  leaveType: string;
  fromDate: string;
  toDate: string;
  days: number;
  reason: string;
  status: "Approved" | "Rejected" | "Pending";
}

interface LeaveFormData {
  leaveType: string;
  fromDate: string;
  toDate: string;
  reason: string;
}

interface LeaveApi {
  _id: string;
  from: string;
  to: string;
  reason: string;
  email?: string;
  leaveType?: string;
  status: "Approved" | "Rejected" | "Pending";
}

const leaveTypes = [
  "Casual Leave",
  "Sick Leave",
  "Earned Leave",
  "Maternity Leave",
  "Paternity Leave",
  "Emergency Leave",
];

const LeaveManagement: React.FC = () => {
  const [leaveData, setLeaveData] = useState<LeaveRecord[]>([]);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [formData, setFormData] = useState<LeaveFormData>({
    leaveType: "",
    fromDate: "",
    toDate: "",
    reason: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [editingLeaveId, setEditingLeaveId] = useState<string | null>(null);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-GB", {
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

  const getStatusStyle = (status: LeaveRecord["status"]): string => {
    switch (status) {
      case "Approved":
        return "text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm font-medium";
      case "Rejected":
        return "text-red-600 bg-red-50 px-3 py-1 rounded-full text-sm font-medium";
      case "Pending":
        return "text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full text-sm font-medium";
      default:
        return "text-gray-600 bg-gray-50 px-3 py-1 rounded-full text-sm font-medium";
    }
  };



  const token = getAuthToken();

  const sortedData = [...leaveData];

  // 🔹 Fetch leaves on mount
  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_BASE_URL}/myleaves`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.message || "Failed to fetch leaves");
        }

        const data: LeaveApi[] = await res.json();

        const mapped: LeaveRecord[] = data.map((leave) => {
          const fromISO =
            typeof leave.from === "string" ? leave.from : String(leave.from);
          const toISO =
            typeof leave.to === "string" ? leave.to : String(leave.to);

          const fromDate = fromISO.split("T")[0];
          const toDate = toISO.split("T")[0];

          return {
            id: leave._id,
            leaveType: leave.leaveType || "Leave",
            fromDate,
            toDate,
            days: calculateDays(fromDate, toDate),
            reason: leave.reason || "",
            status: leave.status,
          };
        });

        setLeaveData(mapped);
      } catch (err: any) {
        console.error("Fetch leaves error:", err);
        setError(err.message || "Failed to load leaves");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaves();
  }, []);

  // Handle edit: open modal with existing data
  const handleEdit = (id: string) => {
    const record = leaveData.find((r) => r.id === id);
    if (!record) return;

    setEditingLeaveId(id);
    setFormData({
      leaveType: record.leaveType,
      fromDate: record.fromDate,
      toDate: record.toDate,
      reason: record.reason,
    });
    setShowApplyModal(true);
  };

  // Handle delete – uses backend route (Admin in your current router)
  const handleDelete = async (id: string) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this leave record?"
    );
    if (!confirm) return;

    try {
      const res = await fetch(`${API_BASE_URL}/delete/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Failed to delete leave");
      }

      setLeaveData((prev) => prev.filter((record) => record.id !== id));
    } catch (err: any) {
      alert(err.message || "Error deleting leave");
    }
  };

  // Apply Leave Button
  const handleApplyLeave = () => {
    setEditingLeaveId(null); // new leave
    setShowApplyModal(true);
  };

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission (apply or edit)
  const handleSubmitLeave = async () => {
    if (
      !formData.leaveType ||
      !formData.fromDate ||
      !formData.toDate ||
      !formData.reason
    ) {
      alert("Please fill in all required fields");
      return;
    }

    if (new Date(formData.fromDate) > new Date(formData.toDate)) {
      alert("From date cannot be after To date");
      return;
    }

    const payload = {
      from: formData.fromDate,
      to: formData.toDate,
      reason: formData.reason,
      leaveType: formData.leaveType,
    };

    try {
      setSubmitting(true);

      const url = editingLeaveId
        ? `${API_BASE_URL}/edit/${editingLeaveId}`
        : `${API_BASE_URL}/apply`;
      const method = editingLeaveId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Failed to submit leave");
      }

      const data = await res.json();
      const leave: LeaveApi = data.leave;

      const fromISO =
        typeof leave.from === "string" ? leave.from : String(leave.from);
      const toISO = typeof leave.to === "string" ? leave.to : String(leave.to);

      const fromDate = fromISO.split("T")[0];
      const toDate = toISO.split("T")[0];

      const newRecord: LeaveRecord = {
        id: leave._id,
        leaveType: leave.leaveType || formData.leaveType,
        fromDate,
        toDate,
        days: calculateDays(fromDate, toDate),
        reason: leave.reason || formData.reason,
        status: leave.status,
      };

      setLeaveData((prev) =>
        editingLeaveId
          ? prev.map((r) => (r.id === editingLeaveId ? newRecord : r))
          : [newRecord, ...prev]
      );

      closeModal();
    } catch (err: any) {
      alert(err.message || "Error submitting leave");
    } finally {
      setSubmitting(false);
    }
  };

  // Close modal
  const closeModal = () => {
    setShowApplyModal(false);
    setEditingLeaveId(null);
    setFormData({
      leaveType: "",
      fromDate: "",
      toDate: "",
      reason: "",
    });
  };

  const SortIcon = ({ field }: { field: keyof LeaveRecord }) => null; // sorting removed

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-bold">Leave Management</h1>

            {/* Apply Leave Button */}
            <button
              onClick={handleApplyLeave}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>{editingLeaveId ? "Edit Leave" : "Apply Leave"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Loading leaves...
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">{error}</div>
          ) : (
            <>
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
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
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedData.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {record.leaveType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {formatDate(record.fromDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {formatDate(record.toDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {record.days}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {record.reason}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={getStatusStyle(record.status)}>
                            {record.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center space-x-2">
                            {record.status === "Pending" && (
                              <>
                                <button
                                  onClick={() => handleEdit(record.id)}
                                  className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                                  title="Edit"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>

                                <button
                                  onClick={() => handleDelete(record.id)}
                                  className="text-red-600 hover:text-red-800 transition-colors duration-200"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Empty State */}
              {sortedData.length === 0 && !loading && (
                <div className="text-center py-12">
                  <div className="text-gray-500 text-lg">
                    No leave records found
                  </div>
                  <button
                    onClick={handleApplyLeave}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                  >
                    Apply for Leave
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Apply / Edit Leave Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                {editingLeaveId ? "Edit Leave" : "Apply for Leave"}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="space-y-4">
                {/* Leave Type */}
                <div>
                  <label
                    htmlFor="leaveType"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Leave Type *
                  </label>
                  <select
                    id="leaveType"
                    name="leaveType"
                    value={formData.leaveType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Leave Type</option>
                    {leaveTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* From Date */}
                <div>
                  <label
                    htmlFor="fromDate"
                    className="block text-sm font-medium text-gray-700 mb-1 flex items-center"
                  >
                    <Calendar className="w-4 h-4 mr-1" />
                    From Date *
                  </label>
                  <input
                    type="date"
                    id="fromDate"
                    name="fromDate"
                    value={formData.fromDate}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {/* To Date */}
                <div>
                  <label
                    htmlFor="toDate"
                    className="block text-sm font-medium text-gray-700 mb-1 flex items-center"
                  >
                    <Calendar className="w-4 h-4 mr-1" />
                    To Date *
                  </label>
                  <input
                    type="date"
                    id="toDate"
                    name="toDate"
                    value={formData.toDate}
                    onChange={handleInputChange}
                    min={
                      formData.fromDate ||
                      new Date().toISOString().split("T")[0]
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {/* Days Display */}
                {formData.fromDate && formData.toDate && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <span className="text-sm text-blue-800">
                      Total Days:{" "}
                      <strong>
                        {calculateDays(formData.fromDate, formData.toDate)}
                      </strong>
                    </span>
                  </div>
                )}

                {/* Reason */}
                <div>
                  <label
                    htmlFor="reason"
                    className="block text-sm font-medium text-gray-700 mb-1 flex items-center"
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    Reason *
                  </label>
                  <textarea
                    id="reason"
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="Please provide a reason for your leave..."
                    required
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors duration-200"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitLeave}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 disabled:opacity-60"
                  disabled={submitting}
                >
                  <Plus className="w-4 h-4" />
                  <span>
                    {editingLeaveId ? "Update Leave" : "Submit Leave"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveManagement;
