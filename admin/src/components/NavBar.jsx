import React from "react";
import { assets } from "../assets/assets";

const NavBar = ({ setToken }) => {
  return (
    <div className="flex items-center py-3 px-[4%] justify-between bg-white border-b border-gray-200">
      <div className="flex items-center gap-3">
        <img className="w-[max(10%,80px)]" src={assets.logo} alt="Logo" />
        <span className="hidden sm:inline-block text-sm text-gray-600">
          Admin Panel
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden sm:inline-block text-sm text-gray-600">
          Logged in as Admin
        </span>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            setToken("");
          }}
          className="bg-gray-600 text-white px-5 py-2 sm:px-7 sm:py-2 rounded-full text-xs s:text-sm hover:bg-gray-700 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default NavBar;
