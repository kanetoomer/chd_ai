import React from "react";

const Loading = ({ message = "Loading..." }) => {
  return (
    <div className="flex h-full w-full items-center justify-center p-10">
      <div className="text-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">{message}</p>
      </div>
    </div>
  );
};

export default Loading;
