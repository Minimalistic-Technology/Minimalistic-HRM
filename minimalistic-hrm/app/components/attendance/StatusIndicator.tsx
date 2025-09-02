import React from 'react';

interface StatusIndicatorProps {
  isCheckedIn: boolean;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ isCheckedIn }) => {
  return (
    <div className="text-center mb-8">
      <div
        className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-4 ${
          isCheckedIn
            ? "bg-green-100 text-green-800"
            : "bg-gray-100 text-gray-800"
        }`}
      >
        <div
          className={`w-2 h-2 rounded-full mr-2 ${
            isCheckedIn ? "bg-green-500" : "bg-gray-500"
          }`}
        ></div>
        {isCheckedIn ? "Checked In" : "Checked Out"}
      </div>
    </div>
  );
};