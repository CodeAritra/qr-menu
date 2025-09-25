/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { Children, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useMenu } from "../context/useMenu";
import { useAuth } from "../context/useAuth";

export default function Navbar({ children }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const [open, setOpen] = useState(false);
  const closeMenu = () => setOpen(false);

  // console.log("open == ", open);

  const [user, setuser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  const { cafe } = useMenu();
  const { logout } = useAuth();

  // console.log("user nav == ", user);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    onSearch(e.target.value); // call parent handler
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    onFilter(e.target.value); // call parent handler
  };

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      toast.error("Logout failed: " + error.message);
    }
  };

  return (
    <>
      {/* Admin Navbar */}
      {user && (
        <div className="navbar bg-base-100 shadow-md sticky top-0 z-20 px-4">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex">
              <ul className="menu menu-horizontal gap-1">
                <li>
                  <NavLink
                    to={`/admin/${user?.username}/${user?.uid}`}
                    end
                    className={({ isActive }) =>
                      `btn btn-sm rounded-lg ${
                        isActive ? "btn-primary text-white" : "btn-ghost"
                      }`
                    }
                  >
                    Dashboard
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="create"
                    className={({ isActive }) =>
                      `btn btn-sm rounded-lg ${
                        isActive ? "btn-primary text-white" : "btn-ghost"
                      }`
                    }
                  >
                    Create Menu
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="order"
                    className={({ isActive }) =>
                      `btn btn-sm rounded-lg ${
                        isActive ? "btn-primary text-white" : "btn-ghost"
                      }`
                    }
                  >
                    Orders
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="order-history"
                    className={({ isActive }) =>
                      `btn btn-sm rounded-lg ${
                        isActive ? "btn-primary text-white" : "btn-ghost"
                      }`
                    }
                  >
                    History
                  </NavLink>
                </li>
              </ul>
            </div>

            {/* Mobile Dropdown */}
            <div className="dropdown md:hidden">
              <label tabIndex={0} className="btn btn-ghost btn-circle">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h7"
                  />
                </svg>
              </label>
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
              >
                <li>
                  <NavLink to="">Dashboard</NavLink>
                </li>
                <li>
                  <NavLink to="create">Create Menu</NavLink>
                </li>
                <li>
                  <NavLink to="order">Orders</NavLink>
                </li>
                <li>
                  <NavLink to="order-history">History</NavLink>
                </li>
              </ul>
            </div>
          </div>

          {/* Center */}
          <div className="text-lg font-bold badge badge-primary py-3 px-4">
            Admin Panel
          </div>

          {/* Right Section */}
          <div>
            <button
              className="btn btn-outline btn-error btn-sm"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Client Navbar */}
      {!user && (
        <div className="sticky top-0 z-20 bg-base-100 shadow-md">
          {/* Cafe Header (scrolls away if needed) */}
          <header className="flex items-center gap-2 p-2">
            <img
              src="/logo192.png"
              alt="Cafe Logo"
              className="w-10 h-10 rounded-full shadow"
            />
            <h1 className="font-bold text-lg text-primary">{cafe?.name || "Cafe"}</h1>
          </header>

          {/* Search + Filter (sticks below header) */}
          <div className="flex gap-2 p-2 bg-base-100 sticky top-0 z-30 input input-primary flex-1 rounded-md m-5">
            <svg
              className="h-[1em] opacity-50"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <g
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeWidth="2.5"
                fill="none"
                stroke="currentColor"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
              </g>
            </svg>

            <input type="search" placeholder="Search item..." className="" />
          </div>
        </div>
      )}
    </>
  );
}
