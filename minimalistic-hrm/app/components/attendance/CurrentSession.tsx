// import React from 'react';
// import { Navigation } from 'lucide-react';
// import { CurrentSession as CurrentSessionType, Location } from '../../types';

// interface CurrentSessionProps {
//   currentSession: CurrentSessionType | null;
//   location: Location | null;
//   isCheckedIn: boolean;
// }

// export const CurrentSession: React.FC<CurrentSessionProps> = ({ 
//   currentSession, 
//   location, 
//   isCheckedIn 
// }) => {
//   if (!isCheckedIn || !currentSession) return null;

//   return (
//     <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-8 border border-green-200">
//       <h3 className="text-lg font-semibold text-green-800 mb-4">
//         Current Session
//       </h3>
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         <div className="text-center">
//           <p className="text-sm text-green-600 mb-1">Location</p>
//           <p className="text-lg font-semibold text-green-800 flex items-center justify-center">
//             {location?.lat && (
//               <Navigation className="w-4 h-4 mr-1 text-blue-500" />
//             )}
//             {location?.lat}
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };