"use client"
import React, { useState } from 'react';
import { Edit, Trash2, Plus, X, Calendar, User, FileText } from 'lucide-react';

// Types
interface LeaveRecord {
  id: string;
  leaveType: string;
  fromDate: string;
  toDate: string;
  days: number;
  reason: string;
  status: 'Approved' | 'Rejected' | 'Pending';
}

interface LeaveFormData {
  leaveType: string;
  fromDate: string;
  toDate: string;
  reason: string;
}

// Sample data - in a real app, this would come from an API
const initialLeaveData: LeaveRecord[] = [

  {
    id: '1',
    leaveType: 'Earned Leave',
    fromDate: '2024-12-05',
    toDate: '2024-12-07',
    days: 3,
    reason: 'Personal Work',
    status: 'Rejected'
  },
  {
    id: '2',
    leaveType: 'Sick Leave',
    fromDate: '2024-11-08',
    toDate: '2024-11-09',
    days: 2,
    reason: 'Viral Fever',
    status: 'Pending'
  },
  {
    id: '3',
    leaveType: 'Casual Leave',
    fromDate: '2024-11-01',
    toDate: '2024-11-02',
    days: 2,
    reason: 'Family Emergency',
    status: 'Approved'
  }
];

const leaveTypes = [
  'Casual Leave',
  'Sick Leave',
  'Earned Leave',
  'Maternity Leave',
  'Paternity Leave',
  'Emergency Leave'
];

const LeaveManagement: React.FC = () => {
  const [leaveData, setLeaveData] = useState<LeaveRecord[]>(initialLeaveData);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [formData, setFormData] = useState<LeaveFormData>({
    leaveType: '',
    fromDate: '',
    toDate: '',
    reason: ''
  });

  // Format date for display
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Calculate days between dates
  const calculateDays = (fromDate: string, toDate: string): number => {
    if (!fromDate || !toDate) return 0;
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const diffTime = Math.abs(to.getTime() - from.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  // Get status styling
  const getStatusStyle = (status: LeaveRecord['status']): string => {
    switch (status) {
      case 'Approved':
        return 'text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm font-medium';
      case 'Rejected':
        return 'text-red-600 bg-red-50 px-3 py-1 rounded-full text-sm font-medium';
      case 'Pending':
        return 'text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full text-sm font-medium';
      default:
        return 'text-gray-600 bg-gray-50 px-3 py-1 rounded-full text-sm font-medium';
    }
  };

  // Handle sorting

  // Sort data - now just returns data in original order
  const sortedData = [...leaveData];

  // Handle edit
  const handleEdit = (id: string) => {
    console.log('Edit leave record:', id);
    // In a real app, this would open an edit modal or navigate to edit page
  };

  // Handle delete
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this leave record?')) {
      setLeaveData(prev => prev.filter(record => record.id !== id));
    }
  };

  // Handle apply leave
  const handleApplyLeave = () => {
    setShowApplyModal(true);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmitLeave = () => {
    
    if (!formData.leaveType || !formData.fromDate || !formData.toDate || !formData.reason) {
      alert('Please fill in all required fields');
      return;
    }

    if (new Date(formData.fromDate) > new Date(formData.toDate)) {
      alert('From date cannot be after To date');
      return;
    }

    const days = calculateDays(formData.fromDate, formData.toDate);
    const newLeave: LeaveRecord = {
      id: (Date.now()).toString(),
      leaveType: formData.leaveType,
      fromDate: formData.fromDate,
      toDate: formData.toDate,
      days: days,
      reason: formData.reason,
      status: 'Pending'
    };

    setLeaveData(prev => [newLeave, ...prev]);
    setShowApplyModal(false);
    setFormData({
      leaveType: '',
      fromDate: '',
      toDate: '',
      reason: ''
    });
  };

  // Close modal
  const closeModal = () => {
    setShowApplyModal(false);
    setFormData({
      leaveType: '',
      fromDate: '',
      toDate: '',
      reason: ''
    });
  };


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
              <span>Apply Leave</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
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
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {sortedData.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">No leave records found</div>
              <button
                onClick={handleApplyLeave}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Apply for Leave
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                Apply for Leave
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
                  <label htmlFor="leaveType" className="block text-sm font-medium text-gray-700 mb-1">
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
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* From Date */}
                <div>
                  <label htmlFor="fromDate" className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    From Date *
                  </label>
                  <input
                    type="date"
                    id="fromDate"
                    name="fromDate"
                    value={formData.fromDate}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {/* To Date */}
                <div>
                  <label htmlFor="toDate" className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    To Date *
                  </label>
                  <input
                    type="date"
                    id="toDate"
                    name="toDate"
                    value={formData.toDate}
                    onChange={handleInputChange}
                    min={formData.fromDate || new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {/* Days Display */}
                {formData.fromDate && formData.toDate && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <span className="text-sm text-blue-800">
                      Total Days: <strong>{calculateDays(formData.fromDate, formData.toDate)}</strong>
                    </span>
                  </div>
                )}

                {/* Reason */}
                <div>
                  <label htmlFor="reason" className="text-sm font-medium text-gray-700 mb-1 flex items-center">
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
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitLeave}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Submit Leave</span>
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