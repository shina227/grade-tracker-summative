import React, { useState, useContext } from "react";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import { UserContext } from "../../context/userContext";
import SideMenu from "./SideMenu";
import CharAvatar from "../Cards/CharAvatar";
import logo from "../../../../../assets/logo.png";

const Navbar = ({ activeMenu }) => {
  const [openSideMenu, setOpenSideMenu] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const { user, clearUser } = useContext(UserContext);

  return (
    <nav className="flex items-center justify-between bg-white border-b border-gray-200 backdrop-blur-xl py-4 px-6 sticky top-0 z-50">
      {/* LEFT */}
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          className="block lg:hidden text-black"
          onClick={() => setOpenSideMenu(!openSideMenu)}
        >
          {openSideMenu ? (
            <HiOutlineX className="text-2xl" />
          ) : (
            <HiOutlineMenu className="text-2xl" />
          )}
        </button>

        {/* Logo */}
        <div className="flex items-center gap-2">
          <img src={logo} alt="Logo" className="w-7 h-7" />
          <h2 className="text-lg font-medium text-black">Grade Tracker</h2>
        </div>
      </div>

      {/* RIGHT */}
      <div className="relative">
        <button
          className="flex items-center gap-2"
          onClick={() => setOpenProfile(!openProfile)}
        >
          {user?.profileImageUrl ? (
            <img
              src={user.profileImageUrl}
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <CharAvatar
              fullName={user?.fullName}
              width="w-8"
              height="h-8"
              style="text-sm"
            />
          )}
        </button>

        {/* Dropdown */}
        {openProfile && (
          <div className="absolute right-0 mt-2 bg-white shadow-md border rounded-md w-40 py-2 animate-fade">
            <p className="px-4 py-2 text-sm text-gray-700">{user?.fullName}</p>
          </div>
        )}
      </div>

      {/* Side menu mobile panel */}
      {openSideMenu && (
        <div className="fixed lg:hidden top-[60px] left-0 w-64 h-full bg-white shadow-md z-40">
          <SideMenu activeMenu={activeMenu} />
        </div>
      )}
    </nav>
  );
};

export default Navbar;
