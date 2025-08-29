/* eslint-disable no-unused-vars */
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useState } from "react";

export default function Navbar({ user, categories, onSearch, onFilter }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    onSearch(e.target.value); // call parent handler
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    onFilter(e.target.value); // call parent handler
  };

  return (
    <div className="navbar bg-white shadow-md text-gray-600 justify-between">
      {user && (
        <>
          <div>
            <div className="navbar-center hidden md:flex">
              <ul className="menu menu-horizontal  ">
                <li>
                  <Link to="/" className="btn btn-ghost btn-primary">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/create" className="btn btn-ghost btn-primary">
                    Create Menu
                  </Link>
                </li>
              </ul>
            </div>

            <div className="dropdown md:hidden px-1">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h7"
                  />{" "}
                </svg>
              </div>
              <ul
                tabIndex={0}
                className="menu menu-lg dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow "
              >
                <li>
                  <Link to="/">Dashboard</Link>
                </li>
                <li>
                  <Link to="/create">Create Menu</Link>
                </li>
              </ul>
            </div>
          </div>
          <div className=" text-lg font-bold">Admin Panel</div>
          <div className="px-2 md:px-7">
            <button className="btn btn-outline btn-error ">Logout</button>
          </div>
        </>
      )}

      {!user && (
        <>
          <div className="flex-1">
            <a className="text-2xl font-bold text-primary">QRMenu</a>
          </div>
          
          <div className="flex items-center">
            {/* Search */}
            <label className="input">
                <svg
                  className="h-5 w-5 opacity-50"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  fill="none"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              <input
                type="text"
                placeholder="Search food..."
                className="input input-bordered"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </label>

            {/* Category Filter */}
            {/* <select
              className="select select-bordered"
              value={selectedCategory}
              onChange={handleCategoryChange}
            >
              <option value="">All Categories</option>
              {categories.map((cat, idx) => (
                <option key={idx} value={cat}>
                  {cat}
                </option>
              ))}
            </select> */}

            {/* Shopping Cart */}
            <button className="btn btn-ghost btn-square">
              <ShoppingCart className="h-6 w-6 text-primary" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
