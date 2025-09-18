/* eslint-disable no-unused-vars */
import { useEffect, useRef, useState } from "react";
import Navbar from "../../components/Navbar";
import { Outlet, useParams } from "react-router-dom";
import { useMenu } from "../../context/useMenu";
import { useOrder } from "../../context/useOrder";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const { cafeId } = useParams();
  const { cafe } = useMenu();
  // const { notificationOrder } = useOrder();

  const [orders, setOrders] = useState([]);

  /*useEffect(() => {
    if (!cafeId) return;

    // 🔔 Start listening
    const unsubscribe = notificationOrder(cafeId);

    // Cleanup on unmount
    return () => unsubscribe();
  }, [cafeId, notificationOrder]);*/

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  /*useEffect(() => {
    console.log("cafe = ", cafe?.activated);
  }, [cafe]);*/

  if (cafe?.activated === false) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-3xl font-bold">🚨 Trial Expired</h1>
        <p className="mt-2">
          Your free trial for {cafe?.name} has ended. Please contact owner.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Main Section */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <Navbar user={true} />

        <main className="flex-1 p-4 md:p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </>
  );
}
