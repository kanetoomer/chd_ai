import React from "react";
import { Link } from "react-router-dom";
import { HiOutlineHome } from "react-icons/hi";

const NotFound = () => {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary-500">404</h1>
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Page not found
        </h2>
        <p className="mt-6 text-base leading-7 text-gray-600">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link to="/" className="btn btn-primary flex items-center">
            <HiOutlineHome className="mr-2 h-5 w-5" />
            Go back home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
