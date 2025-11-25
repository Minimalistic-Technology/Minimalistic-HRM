// "use client";
// import React, { useEffect, useState } from "react";
// import { History } from "lucide-react";
// import axios, { AxiosError } from "axios";
// import { useSelector } from "react-redux";
// import { RootState } from "../store/store";
// import { formatTime } from "../functions/helperFunctions";
// import Checkin from "../components/Checkin";

// interface AttendanceRecord {
//   _id: string;
//   checkIn: any;
//   checkOut: any;
// }

// interface ApiError {
//   error: string;
// }
// function calculateDuration(checkIn: any, checkOut: any): string {
//   if (!checkIn?.dateTime || !checkOut?.dateTime) return "-";

//   const start = new Date(checkIn.dateTime);
//   const end = new Date(checkOut.dateTime);

//   const diffMs = end.getTime() - start.getTime();
//   if (diffMs <= 0) return "-";

//   const hours = Math.floor(diffMs / (1000 * 60 * 60));
//   const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

//   return `${hours}h ${minutes}m`;
// }

// const HistoryPage: React.FC = () => {
//   const [history, setHistory] = useState<AttendanceRecord[]>([]);
//   const [loading, setLoading] = useState(true);
//   const { token } = useSelector((store: RootState) => store.auth);

//   const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/hrm";

//   const fetchUserHistory = async () => {
//     try {
//       if (!token) return;
//       const res = await axios.get(`${API_BASE_URL}/HistoryByUserId`, {
//         headers: { Authorization: `Bearer ${token}` },
//         withCredentials: true,
//       });
//       setHistory(res.data[0]?.history || []);
//     } catch (err) {
//       const error = err as AxiosError<ApiError>;
//       console.error("History fetch failed:", error.response?.data?.error || error.message);
//       setHistory([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchUserHistory();
//   }, []);

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-blue-50">
//         <p>Loading history...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8 flex ">
       
//   <Checkin />


//       <div className="max-w-5xl  bg-white rounded-xl shadow-lg p-8 ">
        
//         <div className="flex items-center justify-between mb-6">
//           <h2 className="text-xl font-semibold text-gray-900">Attendance History</h2>
//           <span className="text-sm text-gray-500">{history.length} records</span>
//         </div>

//         {history.length === 0 ? (
//           <div className="text-center py-6">
//             <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//             <p className="text-gray-500">No attendance history yet</p>
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="min-w-[700px] border-collapse border border-gray-200 rounded-lg">
//               <thead className="bg-gray-100">
//                 <tr>
//                   <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Check-In</th>
//                   <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Check-Out</th>
//                   <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">
//                     Duration
//                   </th>
//                   <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">Status</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {history.map((record) => (
//                   <tr key={record._id} className="border-t hover:bg-gray-50">
//                     <td className="px-4 py-2 text-sm text-green-600">
//                       {record.checkIn?.dateTime ? formatTime(new Date(record.checkIn.dateTime)) : "-"}
//                     </td>
//                     <td className="px-4 py-2 text-sm text-red-600">
//                       {record.checkOut?.dateTime ? formatTime(new Date(record.checkOut.dateTime)) : "-"}
//                     </td>
//                     <td className="px-4 py-2 text-sm text-center">
//                       {record.checkIn && record.checkOut
//                         ? calculateDuration(record.checkIn, record.checkOut)
//                         : "-"}
//                     </td>
//                     <td className="px-4 py-2 text-sm text-center">
//                       {record.checkOut === null ? (
//                         <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Active</span>
//                       ) : (
//                         <span className="px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-700">Completed</span>
//                       )}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default HistoryPage;






