/* eslint-disable no-unused-vars */
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";

import { db, auth } from "../../firebase";
import { doc, getDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/useAuth";

export default function AdminDashboard() {
  const { user } = useAuth();
  useEffect(() => {
    console.log("user == ", user);
  }, [user]);
  return (
    <>
      {/* Main Section */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <Navbar user={true} />

        <main className="flex-1 p-4 md:p-6 bg-gray-50">
          {/* <Routes>
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
          </Routes> */}
          <Outlet />
        </main>
      </div>
    </>
  );
}
