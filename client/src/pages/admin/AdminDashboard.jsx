import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Navbar from "../../components/Navbar";
import CreateMenu from "./CreateMenu";
import ViewMenu from "./ViewMenu";
import UpdateMenu from "./UpdateMenu";

export default function AdminDashboard() {
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

  const addMenuItem = (item) => setMenu([...menu, item]);
  const updateItem = (updated) =>
    setMenu(menu.map((m) => (m.name === updated.name ? updated : m)));
  const deleteItem = (del) => setMenu(menu.filter((m) => m.name !== del.name));

  return (
    <>
      <Router>
        {/* Main Section */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          <Navbar user={true}/>

          <main className="flex-1 p-4 md:p-6 bg-gray-50">
            <Routes>
              <Route path="/" element={<ViewMenu menu={menu} />} />
              <Route
                path="/create"
                element={<CreateMenu addMenuItem={addMenuItem} />}
              />
              <Route
                path="/update"
                element={
                  <UpdateMenu
                    menu={menu}
                    updateItem={updateItem}
                    deleteItem={deleteItem}
                  />
                }
              />
            </Routes>
          </main>
        </div>
      </Router>
    </>
  );
}
