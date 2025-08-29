/* eslint-disable no-unused-vars */
import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "../../components/Navbar";
import MenuTable from "../../components/MenuTable";

export default function ClientDashboard() {
  const [menu, setMenu] = useState([
    {
      category: "Starters",
      items: [
        { id: 1, name: "Paneer Tikka", price: 180, available: true },
        { id: 2, name: "Veg Spring Roll", price: 150, available: true },
        { id: 3, name: "Chicken Wings", price: 220, available: false },
      ],
    },
    {
      category: "Main Course",
      items: [
        { id: 4, name: "Butter Chicken", price: 320, available: true },
        { id: 5, name: "Paneer Butter Masala", price: 280, available: true },
        { id: 6, name: "Dal Makhani", price: 200, available: true },
      ],
    },
    {
      category: "Beverages",
      items: [
        { id: 7, name: "Cold Coffee", price: 120, available: true },
        { id: 8, name: "Fresh Lime Soda", price: 100, available: true },
        { id: 9, name: "Masala Chai", price: 50, available: true },
      ],
    },
    {
      category: "Desserts",
      items: [
        { id: 10, name: "Gulab Jamun", price: 90, available: true },
        { id: 11, name: "Ice Cream (2 Scoops)", price: 150, available: true },
        { id: 12, name: "Brownie with Ice Cream", price: 180, available: true },
      ],
    },
  ]);

  const categories = [...new Set(menu.map((m) => m.category))];


  return (
    <>
      <Router>
        <div className="flex-1 flex flex-col overflow-y-auto">
          <Navbar categories={categories}/>
          <div>
            <h2 className=" text-2xl font-bold p-3">View Menu</h2>
            <hr />
            <MenuTable menu={menu} pro={true}/>
          </div>
        </div>
      </Router>
    </>
  );
}
