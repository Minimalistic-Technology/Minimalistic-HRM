import React from 'react';
import { LogIn, LogOut } from 'lucide-react';
import { Location } from '../../types';

interface CheckInOutButtonsProps {
  isCheckedIn: boolean;
  loading: boolean;
  location: Location | null;
  onCheckIn: () => void;
  onCheckOut: () => void;
}

export const CheckInOutButtons: React.FC<CheckInOutButtonsProps> = ({ 
  isCheckedIn, 
  loading, 
  location, 
  onCheckIn, 
  onCheckOut 
}) => {
  return (
    <div className="flex justify-center space-x-4">
      {!isCheckedIn ? (
        <button
          onClick={onCheckIn}
          disabled={loading || !location?.lat}
          className="flex items-center px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
          ) : (
            <LogIn className="w-5 h-5 mr-2" />
          )}
          {loading ? "Checking In..." : "Check In"}
        </button>
      ) : (
        <button
          onClick={onCheckOut}
          disabled={loading}
          className="flex items-center px-8 py-4 bg-gradient-to-r from-red-500 to-pink-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-pink-700 transform hover:scale-105 transition-all duration-200 shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
          ) : (
            <LogOut className="w-5 h-5 mr-2" />
          )}
          {loading ? "Checking Out..." : "Check Out"}
        </button>
      )}
    </div>
  );
};

