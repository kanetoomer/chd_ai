import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  HiHome,
  HiUpload,
  HiDatabase,
  HiChartBar,
  HiDocumentReport,
  HiMenuAlt2,
  HiX,
} from "react-icons/hi";

import { useAuth } from "../../context/AuthContext";
import ProfileDropdown from "./ProfileDropdown";

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const navItems = [
    { name: "Dashboard", path: "/", icon: <HiHome className="w-6 h-6" /> },
    {
      name: "Upload Data",
      path: "/upload",
      icon: <HiUpload className="w-6 h-6" />,
    },
    {
      name: "Reports",
      path: "/reports",
      icon: <HiDocumentReport className="w-6 h-6" />,
    },
  ];

  // If not authenticated, don't show the full layout
  if (
    !isAuthenticated &&
    !["/login", "/register", "/forgot-password", "/reset-password"].includes(
      location.pathname
    )
  ) {
    // Redirect to login is handled in a protected route component, not here
    return children;
  }

  // Don't show sidebar and header on auth pages
  if (
    ["/login", "/register", "/forgot-password", "/reset-password"].includes(
      location.pathname
    )
  ) {
    return children;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center justify-center border-b border-gray-200">
          <h1 className="text-xl font-bold text-primary-600">
            Health Dashboard
          </h1>
        </div>

        <nav className="mt-5 px-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center rounded-md px-4 py-3 text-gray-600 transition-colors hover:bg-primary-50 hover:text-primary-600 ${
                    location.pathname === item.path
                      ? "bg-primary-50 text-primary-600"
                      : ""
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-20 items-center justify-between border-b border-gray-200 bg-white px-6">
          <div className="flex items-center">
            <button
              className="mr-4 rounded-md p-1 text-gray-600 hover:bg-gray-100 hover:text-gray-900 lg:hidden"
              onClick={toggleSidebar}
            >
              {sidebarOpen ? (
                <HiX className="h-6 w-6" />
              ) : (
                <HiMenuAlt2 className="h-6 w-6" />
              )}
            </button>
            <h1 className="text-2xl font-semibold text-gray-800">
              Community Health Dashboard
            </h1>
          </div>

          {/* Profile Dropdown */}
          <ProfileDropdown />
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
