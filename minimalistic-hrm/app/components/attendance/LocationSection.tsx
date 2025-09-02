import React from 'react';
import { MapPin } from 'lucide-react';
import { Location } from '../../types';

interface LocationSectionProps {
  location: Location | null;
  isCheckedIn: boolean;
  loading: boolean;
  onGetLocation: () => void;
}

export const LocationSection: React.FC<LocationSectionProps> = ({ 
  location, 
  isCheckedIn, 
  loading, 
  onGetLocation 
}) => {
  return (
    <div className="mb-8">
      <label className="block text-sm font-medium text-gray-700 mb-3">
        <MapPin className="w-4 h-4 inline-block mr-1" />
        Current Location
      </label>

      <div className="space-y-4">
        {!location?.lat ? (
          <div>
            <button
              onClick={onGetLocation}
              disabled={isCheckedIn || loading}
              className="flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed w-full justify-center"
            >
              Get Current location
            </button>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            {location?.lat}
          </div>
        )}

        {!location?.lat && (
          <p className="text-sm text-gray-500 text-center py-4">
            Please get your current location before checking in
          </p>
        )}
      </div>
    </div>
  );
};