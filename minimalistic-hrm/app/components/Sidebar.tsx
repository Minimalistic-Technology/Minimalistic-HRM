// "use client"
// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { LogOut, Navigation, UserIcon } from "lucide-react";
// import React, { useEffect, useState } from "react";
// import { formatDate, getAuthToken } from "../functions/helperFunctions";
// import { useAuth } from "../context/AuthContext";
// import { useDispatch, useSelector } from "react-redux";
// import { RootState } from "../store/store";
// import { usePathname, useRouter } from "next/navigation";
// import { setLocation, setUser } from "../store/authSlice";

// const Navbar = () => {
//   const router = useRouter()
//   const pathname = usePathname()
//   const dispatch = useDispatch()
//   const {location, user} = useSelector((store: RootState) => store.auth)
  
//   const logout = () => {
//     localStorage.removeItem("user")
//     localStorage.removeItem("token");
//     // localStorage.removeItem("location");
//     dispatch(setUser({user: {}, token: ""}))
//     dispatch(setLocation({}))
//     router.replace("/login");
//   }

//   return (
// <>
//     { pathname !== "/login" &&pathname !== "/" && <nav className="dark:bg-white/40 bg-white rounded-2xl shadow-xl p-6">
//       <div className="flex items-center justify-between">
//         <div className="flex items-center space-x-4">
//           {/* Only show user icon when NOT on login page */}
//           { user && (
//             <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center">
//               <UserIcon className="w-6 h-6 text-white" />
//             </div>
//           )}
//           <div>
//             <h1 className="text-2xl font-bold text-gray-900">
//               {user?.username}
//             </h1>
//             <p className="text-gray-600">
//               {!(pathname === "/login") && user && location?.city && (
//                 <span className="flex items-center">
//                   <Navigation className="w-4 h-4 mr-1 text-blue-500" />
//                   {location?.city}
//                 </span>
//               )}
//             </p>
//           </div>
//         </div>
//         <div className="text-right space-y-2">
//           <p className="text-sm text-gray-500">Today</p>
//           <p className="text-lg font-semibold text-gray-900">
//             {formatDate(new Date())}
//           </p>
//           { user && (
//             <button
//               onClick={logout}
//               // disabled={loading}
//               className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:bg-gray-400"
//             >
//               <LogOut className="w-4 h-4 mr-2" />
//               Logout
//             </button>
//           )}
//         </div>
//       </div>
//     </nav>}</>
//   );
// };

// export default Navbar;

"use client"

import React, { useState } from 'react';
import { 
  Grid3X3,
  ClipboardList,
  Mail,
  FileText,
  BookOpen,
  PieChart,
  Settings,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Clock
} from 'lucide-react';
import Link from "next/link";


interface SidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
  className?: string;
}

interface NavigationItem {
  id: string;
  label: string;
    href: string; 
  icon: React.ComponentType<any>;
  badge?: string | number;
  isActive?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen: controlledIsOpen, 
  onToggle, 
  className = '' 
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Use controlled state if provided, otherwise use internal state
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const handleToggle = onToggle || (() => setInternalIsOpen(!internalIsOpen));

  const navigationItems: NavigationItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Grid3X3, href: '/dashboard' },
  { id: 'projects', label: 'Projects', icon: ClipboardList, href: '/projects' },
  { id: 'messages', label: 'Messages', icon: Mail, href: '/messages' },
  { id: 'files', label: 'Files', icon: FileText, href: '/files' },
  { id: 'history', label: 'History', icon: Clock, href: '/history' },
  { id: 'reports', label: 'Reports', icon: BookOpen, href: '/reports' },
  { id: 'analytics', label: 'Analytics', icon: PieChart, href: '/analytics' },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
];


  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity duration-300 ease-in-out"
          onClick={handleToggle}
        />
      )}

      {/* Mobile Menu Button */}
      <button
        onClick={handleToggle}
        className="fixed top-4 left-4 z-50 lg:hidden bg-white rounded-lg p-2 shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
      >
        {isOpen ? (
          <X className="w-5 h-5 text-gray-600" />
        ) : (
          <Menu className="w-5 h-5 text-gray-600" />
        )}
      </button>

      {/* Sidebar */}
      <div className={`
        fixed lg:relative top-0 left-0 h-full bg-white border-r border-gray-200 z-50
        transform transition-all duration-300 ease-in-out shadow-xl lg:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'w-16' : 'w-64'}
        ${className}
      `}>
        {/* Header */}
        <div className={`
          p-4 border-b border-gray-200 flex items-center justify-between
          transition-all duration-300 ease-in-out
          ${isCollapsed ? 'px-3' : 'px-4'}
        `}>
          <h1 className={`
            font-semibold text-gray-900 transition-all duration-300 ease-in-out
            ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 text-xl'}
          `}>
            Dashboard
          </h1>
          
          {/* Desktop Collapse Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex items-center justify-center w-6 h-6 rounded-full hover:bg-gray-100 transition-colors duration-200"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            )}
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="mt-8 flex-1 overflow-hidden">
          <div className="space-y-1 px-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
               <Link
  key={item.id}
  href={item.href}
  className={`
    group flex items-center rounded-lg transition-all duration-200 ease-in-out
    hover:bg-gray-100 hover:shadow-sm transform hover:scale-[1.02]
    ${isCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-2'}
    ${item.isActive 
      ? 'bg-teal-50 text-teal-700 border-r-2 border-teal-500' 
      : 'text-gray-700 hover:text-gray-900'
    }
  `}
  title={isCollapsed ? item.label : undefined}
>
  <Icon className={`
    flex-shrink-0 transition-all duration-200
    ${isCollapsed ? 'w-5 h-5' : 'w-5 h-5 mr-3'}
    ${item.isActive ? 'text-teal-600' : 'text-gray-500 group-hover:text-gray-700'}
  `} />
  <span className={`
    font-medium transition-all duration-300 ease-in-out
    ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}
  `}>
    {item.label}
  </span>
</Link>

              );
            })}
          </div>
        </nav>

        
      </div>
    </>
  );
};

export default Sidebar;



