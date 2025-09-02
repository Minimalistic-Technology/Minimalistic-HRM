import React from 'react';
import { History } from 'lucide-react';
import { AttendanceRecord } from '../../types';
import { AttendanceTable } from './AttendanceTable';

interface HistoryTabProps {
  history: AttendanceRecord[];
}

export const HistoryTab: React.FC<HistoryTabProps> = ({ history }) => {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Attendance History
        </h2>
        <div className="text-sm text-gray-500">
          {history?.length > 0 ? `${history.length} records` : "No records"}
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
          <AttendanceTable history={history} />
        </div>
      )}
    </div>
  );
};