import React from "react";
import { NavLink } from "react-router-dom";
import { assets } from "../assets/assets";

const Sidebar = () => {
  return (
    <div className="w-[18%] min-h-screen border-r-2 bg-white">
      <div className="flex flex-col gap-2 pt-6 pl-[20%] text-[15px]">
        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-1 transition-colors ${
              isActive
                ? "bg-black text-white border-black"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`
          }
          to="/dashboard"
        >
          <img className="w-5 h-5" src={assets.order_icon} alt="" />
          <p className="hidden md:block">Dashboard</p>
        </NavLink>

        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-1 transition-colors ${
              isActive
                ? "bg-black text-white border-black"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`
          }
          to="/add"
        >
          <img className="w-5 h-5" src={assets.add_icon} alt="" />
          <p className="hidden md:block">Add Items</p>
        </NavLink>

        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-1 transition-colors ${
              isActive
                ? "bg-black text-white border-black"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`
          }
          to="/list"
        >
          <img className="w-5 h-5" src={assets.order_icon} alt="" />
          <p className="hidden md:block">List Items</p>
        </NavLink>

        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-1 transition-colors ${
              isActive
                ? "bg-black text-white border-black"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`
          }
          to="/orders"
        >
          <img className="w-5 h-5" src={assets.order_icon} alt="" />
          <p className="hidden md:block">Orders</p>
        </NavLink>

        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-1 transition-colors ${
              isActive
                ? "bg-black text-white border-black"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`
          }
          to="/sale-settings"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <p className="hidden md:block">Sale Settings</p>
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;
