import React from 'react';
import { Clock, History } from 'lucide-react';

interface TabNavigationProps {
  activeTab: "dashboard" | "history";
  onTabChange: (tab: "dashboard" | "history") => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ 
  activeTab, 
  onTabChange 
}) => {
  return (
    <div className="flex border-b border-gray-200">
      <button
        onClick={() => onTabChange("dashboard")}
        className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
          activeTab === "dashboard"
            ? "text-indigo-600 bg-white shadow-"
            : "text-gray-500 hover:text-gray-700 bg-gray-300 opacity-70"
        }`}
      >
        <Clock className="w-5 h-5 inline-block mr-2" />
        Dashboard
      </button>
      <button
        onClick={() => onTabChange("history")}
        className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
          activeTab === "history"
            ? "text-indigo-600 bg-white"
            : "text-gray-500 hover:text-gray-700 bg-gray-300 opacity-70"
        }`}
      >
        <History className="w-5 h-5 inline-block mr-2" />
        History
      </button>
    </div>
  );
};
