import React from 'react';
import { StatusIndicator } from './StatusIndicator';

import { LocationSection } from './LocationSection';
import { CheckInOutButtons } from './CheckInOutButtons';
import {  Location } from '../../types';

interface DashboardProps {
  isCheckedIn: boolean;
  
  location: Location | null;
  loading: boolean;
  onCheckIn: () => void;
  onCheckOut: () => void;
  onGetLocation: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  isCheckedIn, 
  
  location, 
  loading, 
  onCheckIn, 
  onCheckOut, 
  onGetLocation 
}) => {
  return (
    <div className="p-8">
      <StatusIndicator isCheckedIn={isCheckedIn} />
      
      
      <LocationSection 
        location={location}
        isCheckedIn={isCheckedIn}
        loading={loading}
        onGetLocation={onGetLocation}
      />

      <CheckInOutButtons 
        isCheckedIn={isCheckedIn}
        loading={loading}
        location={location}
        onCheckIn={onCheckIn}
        onCheckOut={onCheckOut}
      />
    </div>
  );
};