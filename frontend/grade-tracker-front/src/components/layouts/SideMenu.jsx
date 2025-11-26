import React, { useContext } from "react";
import { SIDE_MENU_DATA } from "../../utils/data";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../context/userContext";
import { LuLogOut } from "react-icons/lu";

const SideMenu = ({ activeMenu }) => {
  const { clearUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleClick = (route) => navigate(route);

  const handleLogout = () => {
    localStorage.clear();
    clearUser();
    navigate("/login");
  };

  return (
    <div className="w-64 h-full bg-white border-r border-gray-200/50 flex flex-col p-5 sticky top-0">
      <div className="mt-2" />

      {/* menu items */}
      <div className="flex-1">
        {SIDE_MENU_DATA.map((item, index) => (
          <button
            key={`menu_${index}`}
            className={`w-full flex items-center gap-4 text-[15px] py-3 px-6 rounded-lg mb-3 cursor-pointer transition
              ${
                activeMenu === item.label
                  ? "text-white bg-primary"
                  : "text-gray-800 hover:bg-gray-100"
              }
            `}
            onClick={() => handleClick(item.path)}
          >
            <item.icon className="text-xl" />
            {item.label}
          </button>
        ))}
      </div>

      {/* logout */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-4 text-[15px] py-3 px-6 rounded-lg text-indigo-600 hover:bg-indigo-50 cursor-pointer"
      >
        <LuLogOut className="text-xl" />
        Logout
      </button>
    </div>
  );
};

export default SideMenu;
