/* eslint-disable no-unused-vars */
import { useEffect, useState, useRef } from "react";
import {
  doc,
  onSnapshot,
  collection,
  orderBy,
  query,
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
  const { cafe } = useMenu();
  const prevOrdersRef = useRef([]);

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
    if (!cafeId) return;

    const ordersRef = collection(db, "cafes", cafeId, "orders");
    const q = query(ordersRef, orderBy("createdAt", "asc"));

    const unsub = onSnapshot(q, (snap) => {
      const newOrders = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // detect newly added orders
      if (newOrders.length > prevOrdersRef.current.length) {
        const newOnes = newOrders.filter(
          (o) => !prevOrdersRef.current.some((p) => p.id === o.id)
        );

        newOnes.forEach((order) => {
          toast.success(
            `🛎️ New Order from ${order.customerName || "Guest"} (Table ${
              order.tableNo || "-"
            })`
          );

          if (
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            new Notification("🛎️ New Order!", {
              body: `From ${order.customerName || "Guest"} (Table ${
                order.tableNo || "-"
              })`,
              icon: "/logo192.png", // optional icon (replace with your app logo)
            });
          }

          // playSound();
        });
      }

      // update refs and state
      prevOrdersRef.current = newOrders;
      setOrders(newOrders);
    });

    return () => unsub();
  }, [cafeId]);

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
