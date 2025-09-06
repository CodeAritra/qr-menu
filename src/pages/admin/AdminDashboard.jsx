import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import toast from "react-hot-toast";
import Navbar from "../../components/Navbar";
import { Outlet, useParams } from "react-router-dom";

export default function AdminDashboard() {
  const { cafeId } = useParams();
  const [orders, setOrders] = useState([]);

  // 🔊 function to play notification sound
  const playSound = () => {
    const audio = new Audio("/notification.mp3"); // put notification.mp3 in your public folder
    audio.play().catch((err) => console.log("Sound play error:", err));
  };

  useEffect(() => {
    if (!cafeId) return;

    const cafeRef = doc(db, "cafes", cafeId);

    const unsub = onSnapshot(cafeRef, (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();
      const newOrders = data.orders || [];

      // detect new order
      if (newOrders.length > orders.length) {
        const latestOrder = newOrders[newOrders.length - 1];

        // ✅ show toast
        toast.success(
          `🛎️ New Order from ${latestOrder.customerName} (Table ${latestOrder.tableNo})`
        );

        // ✅ play sound
        playSound();
      }

      setOrders(newOrders);
    });

    return () => unsub();
  }, [cafeId, orders.length]);

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
