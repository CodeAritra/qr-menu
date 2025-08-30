// import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ClientDashboard from "./pages/client/ClientDashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
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
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/client" element={<ClientDashboard />} />
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
