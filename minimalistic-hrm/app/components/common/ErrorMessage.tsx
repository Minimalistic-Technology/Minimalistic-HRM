import React from 'react';

interface ErrorMessageProps {
  error: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ error }) => {
  const isSuccess = error.includes("successful") || error.includes("updated");
  
  return (
    <div
      className={`border px-4 py-3 rounded-lg mb-4 ${
        isSuccess
          ? "bg-green-100 border-green-400 text-green-700"
          : "bg-red-100 border-red-400 text-red-700"
      }`}
    >
      {error}
    </div>
  );
};