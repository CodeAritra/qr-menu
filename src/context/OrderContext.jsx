import { createContext } from "react";
import { db } from "../firebase";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { toast } from "react-hot-toast";

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  // get session id for each customer
  function getSessionId() {
    let sessionId = localStorage.getItem("sessionId");
    if (!sessionId) {
      sessionId = `sess-${crypto.randomUUID()}`;
      localStorage.setItem("sessionId", sessionId);
    }
    return sessionId;
  }

  const placeOrder = async (
    cafeId,
    items,
    fromCart = false,
    customerName,
    tableNo
  ) => {
    const sessionId = localStorage.getItem("sessionId") || getSessionId();
    localStorage.setItem("sessionId", sessionId);

    const cafeRef = doc(db, "cafes", cafeId);
    const cafeSnap = await getDoc(cafeRef);

    if (!cafeSnap.exists()) throw new Error("Cafe not found!");
    const cafeData = cafeSnap.data();

    let orders = cafeData.orders || [];

    // check if session already has a pending order
    let existingIndex = orders.findIndex(
      (o) => o.sessionId === sessionId && o.status === "pending"
    );

    if (existingIndex > -1) {
      // update existing
      let existingOrder = orders[existingIndex];
      let updatedItems = fromCart
        ? [...existingOrder.items, ...items]
        : [...existingOrder.items, items];

      orders[existingIndex] = {
        ...existingOrder,
        items: updatedItems,
        totalAmount: updatedItems.reduce(
          (sum, i) => sum + i.price * (i.qty || 1),
          0
        ),
        updatedAt: new Date().toISOString(),
      };
    } else {
      // new order
      const now = new Date();
      const createdAt = now.toISOString(); // "2025-08-31T05:01:20.836Z"
      const readableDate = now.toLocaleDateString(); // "31/08/2025"
      const readableTime = now.toLocaleTimeString(); // "10:31 AM"

      const newOrder = {
        orderId: crypto.randomUUID(),
        sessionId,
        customerName,
        tableNo,
        status: "pending",
        items: fromCart ? items : [items],
        totalAmount: (fromCart ? items : [items]).reduce(
          (sum, i) => sum + i.price * (i.qty || 1),
          0
        ),
        createdAt: createdAt,
        date: readableDate,
        time: readableTime,
      };
      orders.push(newOrder);
    }

    await updateDoc(cafeRef, { orders });
  };

  /*const listenOrders = (cafeId, setOrders) => {
    const cafeRef = doc(db, "cafes", cafeId);
    return onSnapshot(cafeRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setOrders(data.orders || []); // active/pending orders
        // completed/archived orders
      } else {
        setOrders([]);
      }
    });
  };*/

  const listenOrders = (cafeId, setOrders) => {
    const cafeRef = doc(db, "cafes", cafeId);

    let prevIds = new Set();

    // initialize prevIds once
    (async () => {
      const snap = await getDoc(cafeRef);
      if (snap.exists()) {
        const data = snap.data();
        prevIds = new Set((data.orders || []).map((o) => o.orderId));
      }
    })();

    return onSnapshot(cafeRef, (snap) => {
      if (!snap.exists()) {
        setOrders([]);
        prevIds = new Set();
        return;
      }

      const data = snap.data();
      const orders = data.orders || [];
      setOrders(orders);

      // find new orders
      const newOnes = orders.filter((o) => !prevIds.has(o.orderId));
      if (newOnes.length > 0) {
        newOnes.forEach((order) => {
          // show toast
          toast.success(
            `New order from ${order.customerName || "Guest"} (Table ${
              order.tableNo || "-"
            })`
          );

          // play sound (place notification.mp3 inside /public)
          try {
            const audio = new Audio("/notification.mp3");
            audio.play().catch(() => {});
          } catch (e) {
            console.error("Sound play error:", e);
          }

          // browser notification (optional)
          if (
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            new Notification("🍔 New Order", {
              body: `${order.customerName || "Guest"} • Table ${
                order.tableNo || "-"
              }`,
            });
          }
        });
      }

      // update prevIds
      prevIds = new Set(orders.map((o) => o.orderId));
    });
  };

  const updateOrderStatus = async (cafeId, orderId, status) => {
    const cafeRef = doc(db, "cafes", cafeId);
    const snap = await getDoc(cafeRef);

    if (!snap.exists()) throw new Error("Cafe not found!");
    const data = snap.data();

    let orders = data.orders || [];
    let orderHistory = data.orderHistory || [];

    // Debug log all orderIds
    /*console.log(
      "Existing Orders:",
      orders.map((o) => o.orderId)
    );
    console.log("Looking for:", orderId);*/

    // Find the order
    const orderIndex = orders.findIndex((o) => o.orderId === orderId);
    if (orderIndex === -1) throw new Error("Order not found!");

    let updatedOrder = {
      ...orders[orderIndex],
      status,
      updatedAt: new Date().toISOString(),
    };

    if (status === "completed") {
      // Move to history
      orders.splice(orderIndex, 1);
      orderHistory.push(updatedOrder);
    } else {
      // Just update inside orders[]
      orders[orderIndex] = updatedOrder;
    }

    await updateDoc(cafeRef, { orders, orderHistory });
  };

  const completeOrder = async (cafeId, orderId) => {
    const cafeRef = doc(db, "cafes", cafeId);
    const cafeSnap = await getDoc(cafeRef);
    if (!cafeSnap.exists()) throw new Error("Cafe not found!");

    let { orders = [], orderHistory = [] } = cafeSnap.data();

    const orderIndex = orders.findIndex((o) => o.orderId === orderId);
    if (orderIndex === -1) throw new Error("Order not found!");

    const completedOrder = {
      ...orders[orderIndex],
      status: "completed",
      updatedAt: new Date().toISOString(),
    };

    // remove from active orders
    orders.splice(orderIndex, 1);

    // add to history
    orderHistory.push(completedOrder);

    await updateDoc(cafeRef, { orders, orderHistory });
  };
  return (
    <OrderContext.Provider
      value={{
        listenOrders,
        updateOrderStatus,
        placeOrder,
        completeOrder,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export default OrderContext;
