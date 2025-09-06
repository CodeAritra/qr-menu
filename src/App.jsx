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
import OrderHistory from "./pages/admin/OrderHistory";
import CafeQRCode from "./components/CafeQRCode";
import { useAuth } from "./context/useAuth";

function ProtectedRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    // not logged in → redirect to login
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  // import { seedMenu } from "./services/seedMenu";
  //seed menu
  // useEffect(() => {
  //   seedMenu(); // run once
  // }, []);

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/admin/:cafeName/:cafeId"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          >
            <Route path="" element={<ViewMenu />} />
            <Route path="create" element={<CreateMenu />} />
            <Route path="order" element={<Order />} />
            <Route path="order-history" element={<OrderHistory />} />
          </Route>
          <Route path="/:cafeName/:cafeId" element={<ClientDashboard />}>
            <Route path="" element={<ViewMenu />} />
            <Route path="cart" element={<Cart />} />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/qr" element={<CafeQRCode />} />
        </Routes>
      </Router>
      {/* <HomePage /> */}
      {/* <Dashboard/>  */}
      {/* <ClientDashboard /> */}
    </>
  );
}
