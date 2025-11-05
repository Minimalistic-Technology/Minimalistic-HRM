// "use client";

// import React, { useState } from "react";
// import {
//   Grid3X3,
//   ClipboardList,
//   Mail,
//   Menu,
//   X,
//   ChevronRight,
//   ChevronDown,
//   Hash,
//   MessageSquare,
//   Star,
// } from "lucide-react";
// import Link from "next/link";

// interface SidebarProps {
//   isOpen?: boolean;
//   onToggle?: () => void;
//   className?: string;
// }

// interface NavigationItem {
//   id: string;
//   label: string;
//   href: string;
//   icon: React.ComponentType<any>;
//   badge?: string | number;
//   isActive?: boolean;
//   subcategories?: SubcategoryItem[];
// }

// interface SubcategoryItem {
//   id: string;
//   label: string;
//   href: string;
//   icon?: React.ComponentType<any>; // ✅ make optional
//   count?: number;
// }

// const Sidebar: React.FC<SidebarProps> = ({
//   isOpen: controlledIsOpen,
//   onToggle,
//   className = "",
// }) => {
//   const [internalIsOpen, setInternalIsOpen] = useState(true);
//   const [isCollapsed, setIsCollapsed] = useState(false);
//   const [expandedItems, setExpandedItems] = useState<string[]>([]);

//   // Use controlled state if provided, otherwise use internal state
//   const isOpen =
//     controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
//   const handleToggle = onToggle || (() => setInternalIsOpen(!internalIsOpen));

//   const toggleExpanded = (itemId: string) => {
//     setExpandedItems((prev) =>
//       prev.includes(itemId)
//         ? prev.filter((id) => id !== itemId)
//         : [...prev, itemId]
//     );
//   };

//   const navigationItems: NavigationItem[] = [
//     {
//       id: "Channel",
//       label: "Channel",
//       icon: Grid3X3,
//       href: "/Channel",
//       subcategories: [
//         {
//           id: "general",
//           label: "General",
//           href: "/Channel/general",
//           icon: Hash,
//           count: 12,
//         },
//         {
//           id: "announcements",
//           label: "Announcements",
//           href: "/Channel/announcements",
//           icon: MessageSquare,
//           count: 5,
//         },
//         {
//           id: "hr-policies",
//           label: "HR Policies",
//           href: "/Channel/hr-policies",
//           icon: Grid3X3,
//           count: 8,
//         },
//         {
//           id: "team-updates",
//           label: "Team Updates",
//           href: "/Channel/team-updates",
//           icon: Star,
//           count: 3,
//         },
//         {
//           id: "minimalistic-technology",
//           label: "Minimalistic-Technology",
//           href: "/Channel/minimalistic-technology",
//           // 👇 no icon provided here, will fallback to <img>
//           count: 3,
//         },
//       ],
//     },
//     {
//       id: "Chats",
//       label: "Chats",
//       icon: ClipboardList,
//       href: "/Chats",
//       subcategories: [
//         {
//           id: "direct-messages",
//           label: "Direct Messages",
//           href: "/Chats/direct-messages",
//           icon: MessageSquare,
//           count: 8,
//         },
//         {
//           id: "group-chats",
//           label: "Group Chats",
//           href: "/Chats/group-chats",
//           icon: ClipboardList,
//           count: 4,
//         },
//         {
//           id: "archived",
//           label: "Archived",
//           href: "/Chats/archived",
//           icon: Grid3X3,
//           count: 15,
//         },
//         {
//           id: "unread",
//           label: "Unread",
//           href: "/Chats/unread",
//           icon: Star,
//           count: 2,
//         },
//       ],
//     },
//     { id: "favourite", label: "favourite", icon: Mail, href: "/favourite" },
//   ];

//   return (
//     <>
//       {/* Mobile Overlay */}
//       {isOpen && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity duration-300 ease-in-out"
//           onClick={handleToggle}
//         />
//       )}

//       {/* Mobile Menu Button */}
//       <button
//         onClick={handleToggle}
//         className="fixed top-4 left-4 z-50 lg:hidden bg-white rounded-lg p-2 shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
//       >
//         {isOpen ? (
//           <X className="w-5 h-5 text-gray-600" />
//         ) : (
//           <Menu className="w-5 h-5 text-gray-600" />
//         )}
//       </button>

//       {/* Sidebar */}
//       <div
//         className={`
//         fixed lg:relative top-0 left-0 h-full  bg-white border-r border-gray-200 z-50
//         transform transition-all duration-300 ease-in-out shadow-xl lg:shadow-none
//         ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
//         ${isCollapsed ? "w-16" : "w-64"}
//         ${className}
//       `}
//       >
//         {/* Header */}
//         <div
//           className={`
//           p-4 border-b border-gray-200 flex items-center justify-between
//           transition-all duration-300 ease-in-out
//           ${isCollapsed ? "px-3" : "px-4"}
//         `}
//         >
//           <h1
//             className={`
//             font-semibold text-gray-900 transition-all duration-300 ease-in-out
//             ${isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 text-xl"}
//           `}
//           >
//             Messages
//           </h1>
//         </div>

//         {/* Navigation */}
//         <nav className="mt-8 flex-1 overflow-hidden">
//           <div className="space-y-1 px-2">
//             {navigationItems.map((item) => {
//               const Icon = item.icon;
//               const isExpanded = expandedItems.includes(item.id);
//               const hasSubcategories =
//                 item.subcategories && item.subcategories.length > 0;

//               return (
//                 <div key={item.id}>
//                   {/* Main Navigation Item */}
//                   {hasSubcategories ? (
//                     <button
//                       onClick={() => toggleExpanded(item.id)}
//                       className={`
//                         group flex items-center w-full rounded-lg transition-all duration-200 ease-in-out
//                         hover:bg-gray-100 hover:shadow-sm transform hover:scale-[1.02]
//                         ${isCollapsed ? "px-3 py-3 justify-center" : "px-4 py-2"}
//                         ${
//                           item.isActive
//                             ? "bg-teal-50 text-teal-700 border-r-2 border-teal-500"
//                             : "text-gray-700 hover:text-gray-900"
//                         }
//                       `}
//                       title={isCollapsed ? item.label : undefined}
//                     >
//                       {!isCollapsed && hasSubcategories && (
//                         <div className="flex items-center justify-center w-5 h-5 mr-3">
//                           {isExpanded ? (
//                             <ChevronDown className="w-4 h-4 text-gray-500" />
//                           ) : (
//                             <ChevronRight className="w-4 h-4 text-gray-500" />
//                           )}
//                         </div>
//                       )}
//                       <Icon
//                         className={`
//                         flex-shrink-0 transition-all duration-200
//                         ${isCollapsed ? "w-5 h-5" : "w-5 h-5 mr-3"}
//                         ${
//                           item.isActive
//                             ? "text-teal-600"
//                             : "text-gray-500 group-hover:text-gray-700"
//                         }
//                       `}
//                       />
//                       <span
//                         className={`
//                         font-medium transition-all duration-300 ease-in-out
//                         ${isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}
//                       `}
//                       >
//                         {item.label}
//                       </span>
//                     </button>
//                   ) : (
//                     <Link
//                       href={item.href}
//                       className={`
//                         group flex items-center rounded-lg transition-all duration-200 ease-in-out
//                         hover:bg-gray-100 hover:shadow-sm transform hover:scale-[1.02]
//                         ${isCollapsed ? "px-3 py-3 justify-center" : "px-4 py-2"}
//                         ${
//                           item.isActive
//                             ? "bg-teal-50 text-teal-700 border-r-2 border-teal-500"
//                             : "text-gray-700 hover:text-gray-900"
//                         }
//                       `}
//                       title={isCollapsed ? item.label : undefined}
//                     >
//                       <Icon
//                         className={`
//                         flex-shrink-0 transition-all duration-200
//                         ${isCollapsed ? "w-5 h-5" : "w-5 h-5 mr-3"}
//                         ${
//                           item.isActive
//                             ? "text-teal-600"
//                             : "text-gray-500 group-hover:text-gray-700"
//                         }
//                       `}
//                       />
//                       <span
//                         className={`
//                         font-medium transition-all duration-300 ease-in-out
//                         ${isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}
//                       `}
//                       >
//                         {item.label}
//                       </span>
//                     </Link>
//                   )}

//                   {/* Subcategories */}
//                   {hasSubcategories && isExpanded && !isCollapsed && (
//                     <div className="ml-8 mt-1 space-y-1">
//                       {item.subcategories!.map((subcategory) => {
//                         const SubIcon = subcategory.icon;
//                         return (
//                           <Link
//                             key={subcategory.id}
//                             href={subcategory.href}
//                             className="group flex items-center px-4 py-2 text-left text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
//                           >
//                             {SubIcon ? (
//                               <SubIcon className="w-4 h-4 mr-3 text-gray-400 group-hover:text-gray-600 flex-shrink-0" />
//                             ) : (
//                               <img
//                                 src="/m.jpg"
//                                 alt="Logo"
//                                 className="w-5 h-5 mr-3 rounded-full object-cover"
//                               />
//                             )}
//                             <span className="flex-1 text-sm">
//                               {subcategory.label}
//                             </span>
//                             {subcategory.count && (
//                               <span className="px-2 py-1 text-xs bg-gray-100 text-gray-500 rounded-full group-hover:bg-gray-200">
//                                 {subcategory.count}
//                               </span>
//                             )}
//                           </Link>
//                         );
//                       })}
//                     </div>
//                   )}
//                 </div>
//               );
//             })}
//           </div>
//         </nav>
//       </div>
//     </>
//   );
// };

// export default Sidebar;

"use client";

import Sidebar from "@/app/components/Sidebar";

export default function MessagesPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-4">
        <h1 className="text-2xl font-semibold">Messages</h1>
        <p>Welcome to your messages page.</p>
      </div>
    </div>
  );
}

