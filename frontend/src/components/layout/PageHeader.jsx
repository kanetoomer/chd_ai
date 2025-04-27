import React from "react";

const PageHeader = ({ title, description, actions }) => {
  return (
    <div className="p-10 mb-8 border-b border-gray-200 pb-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {description && (
            <p className="mt-2 max-w-4xl text-sm text-gray-500">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center space-x-3">{actions}</div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
