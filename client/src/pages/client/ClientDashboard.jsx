import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "../../components/Navbar";
import MenuTable from "../../components/MenuTable";
import { db } from "../../firebase";
import { collection, getDocs } from "firebase/firestore";

export default function ClientDashboard() {
  const [menu, setMenu] = useState([]);

  const categories = [...new Set(menu.map((m) => m.category))];

  useEffect(() => {
    const fetchMenu = async () => {
      const snapshot = await getDocs(collection(db, "menu"));
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMenu(data);
    };
    fetchMenu();
  }, []);

  /*useEffect(() => {
    console.log("Menu === ", menu);
  }, [menu]);*/

  return (
    <>
      <Router>
        <div className="flex-1 flex flex-col overflow-y-auto">
          <Navbar categories={categories} />
          <div>
            <h2 className=" text-2xl font-bold p-3">View Menu</h2>
            <hr />
            <MenuTable menu={menu} pro={true} />
          </div>
        </div>
      </Router>
    </>
  );
}
