import React from 'react';
import { AttendanceRecord } from '../../types';
import { formatTime } from '../../functions/helperFunctions';

interface AttendanceTableProps {
  history: AttendanceRecord[];
}

export const AttendanceTable: React.FC<AttendanceTableProps> = ({ history }) => {
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

  return (
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
            // Add null checks before creating Date objects
            const checkInDateTime = record?.checkIn?.dateTime;
            const checkOutDateTime = record?.checkOut?.dateTime;
            
            let duration = 0;
            let durationFormatted = "-";
            
            // Only calculate duration if both check-in and check-out exist
            if (checkInDateTime && checkOutDateTime) {
              duration = Math.floor(
                (new Date(checkOutDateTime).getTime() - new Date(checkInDateTime).getTime()) /
                1000 /
                60
              );
              
              const durationObj = formatDuration(duration);
              durationFormatted = `
                ${durationObj.days ? `${durationObj.days} d ` : ""}
                ${durationObj.hours ? `${durationObj.hours} h ` : ""}
                ${durationObj.minutes ? `${durationObj.minutes} m ` : ""}
                ${durationObj.duration || durationObj.duration === 0
                  ? `${durationObj.duration} m`
                  : ""
                }
              `.trim();
            }

            return (
              <tr key={record._id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2 text-sm font-medium text-gray-900">
                  {checkInDateTime 
                    ? new Date(checkInDateTime).toLocaleDateString()
                    : "-"}
                </td>
                <td className="px-4 py-2 text-sm font-medium text-gray-900">
                  {checkOutDateTime
                    ? new Date(checkOutDateTime).toLocaleDateString()
                    : "-"}
                </td>
                <td className="px-4 py-2 text-sm text-gray-600">
                  {record.checkIn?.city || "-"}
                </td>
                <td className="px-4 py-2 text-sm text-green-600 text-center">
                  {checkInDateTime
                    ? formatTime(new Date(checkInDateTime))
                    : "-"}
                </td>
                <td
                  className={`px-4 py-2 text-sm text-center ${
                    record.checkOut ? "text-red-600" : "text-gray-400"
                  }`}
                >
                  {checkOutDateTime
                    ? formatTime(new Date(checkOutDateTime))
                    : "-"}
                </td>
                <td className="px-4 py-2 text-sm font-semibold text-indigo-600 text-center">
                  {durationFormatted}
                </td>
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
  );
};