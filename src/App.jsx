// import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ClientDashboard from "./pages/client/ClientDashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import CreateMenu from "./pages/admin/CreateMenu";
import ViewMenu from "./pages/ViewMenu";
import Order from "./pages/admin/Order";
import Cart from "./pages/client/Cart";
// import { seedMenu } from "./services/seedMenu";

export default function App() {
  //seed menu
  // useEffect(() => {
  //   seedMenu(); // run once
  // }, []);

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin/:cafeName/:cafeId" element={<AdminDashboard />}>
            <Route path="" element={<ViewMenu />} />
            <Route path="create" element={<CreateMenu />} />
            <Route path="order" element={<Order />} />
          </Route>
          <Route path="/:cafeName/:cafeId" element={<ClientDashboard />}>
            <Route path="" element={<ViewMenu />} />
            <Route path="cart" element={<Cart />} />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </Router>
      {/* <HomePage /> */}
      {/* <Dashboard/>  */}
      {/* <ClientDashboard /> */}
    </>
  );
}
