/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import {
  doc,
  onSnapshot,
  collection,
  addDoc,
  getDoc,
  deleteField,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../firebase";
import toast from "react-hot-toast";
import Navbar from "../../components/Navbar";
import { Outlet, useParams } from "react-router-dom";
import { useMenu } from "../../context/useMenu";

export default function AdminDashboard() {
  /*async function migrateMenu(cafeId) {
    const cafeRef = doc(db, "cafes", cafeId);
    const snap = await getDoc(cafeRef);

    if (!snap.exists()) return console.log("Cafe not found");

    const cafeData = snap.data();

    if (cafeData.menu) {
      const menuItems = Object.entries(cafeData.menu);

      for (const [id, item] of menuItems) {
        await addDoc(collection(db, "cafes", cafeId, "menu"), {
          ...item,
          createdAt: item.createdAt || Timestamp.now(),
        });
      }

      // optional: remove old menu field after migration
      await updateDoc(cafeRef, { menu: deleteField() });

      console.log(`✅ Migrated ${menuItems.length} items for cafe ${cafeId}`);
    } else {
      console.log("⚠️ No menu found to migrate");
    }
  }

  useEffect(() => {
    migrateMenu("YefNZlosfzWnsZOhqCQP5OGbGm33");
    console.log("migrated");
  }, []);*/

  const { cafeId } = useParams();
  const [orders, setOrders] = useState([]);
  const { cafe, trial } = useMenu();

  /*// 🔊 function to play notification sound
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
  }, [cafeId, orders.length]);*/

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  if (trial?.expired) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-3xl font-bold">🚨 Trial Expired</h1>
        <p className="mt-2">
          Your free trial for {cafe.name} has ended. Please contact owner.
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
