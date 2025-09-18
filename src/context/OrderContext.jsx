import { createContext } from "react";
import { db } from "../firebase";
import {
  doc,
  onSnapshot,
  updateDoc,
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  where,
  getDocs,
  setDoc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
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

  const placeOrder = async (cafeId, cart, customerName, tableNo) => {
    if (!Array.isArray(cart) || cart.length === 0) {
      throw new Error("No items to order");
    }

    const sessionId = localStorage.getItem("sessionId") || getSessionId();
    localStorage.setItem("sessionId", sessionId);

    const ordersRef = collection(db, "cafes", cafeId, "orders");

    // 🔍 Step 1: Find existing pending order for this session & table
    const q = query(
      ordersRef,
      where("sessionId", "==", sessionId),
      where("tableNo", "==", tableNo),
      where("status", "==", "pending")
    );

    const snapshot = await getDocs(q);

    // Prepare new items
    const newItems = cart.map((i) => ({
      ...i,
      price: Number(i.price),
      qty: i.qty || 1,
    }));

    const additionalAmount = newItems.reduce(
      (sum, i) => sum + i.price * (i.qty || 1),
      0
    );

    if (!snapshot.empty) {
      // 🔄 Step 2: Merge into existing order
      const existingDoc = snapshot.docs[0];
      const existingData = existingDoc.data();

      const updatedItems = [...existingData.items, ...newItems];
      const updatedTotal = (existingData.totalAmount || 0) + additionalAmount;

      await updateDoc(existingDoc.ref, {
        items: updatedItems,
        totalAmount: updatedTotal,
        updatedAt: serverTimestamp(),
      });

      toast.success("Order updated!");
      return {
        orderId: existingDoc.id,
        ...existingData,
        items: updatedItems,
        totalAmount: updatedTotal,
      };
    } else {
      // 🆕 Step 3: Create a new order
      const orderDoc = {
        items: newItems,
        totalAmount: additionalAmount,
        status: "pending",
        customerName: customerName || "Guest",
        tableNo: tableNo || "-",
        sessionId,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(ordersRef, orderDoc);
      toast.success(`Order placed!`);
      return { orderId: docRef.id, ...orderDoc };
    }
  };

  const listenOrders = (cafeId, callback) => {
    const q = query(
      collection(db, "cafes", cafeId, "orders"),
      orderBy("createdAt", "desc")
    );

    return onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(orders);
    });
  };

  const updateOrderStatus = async (cafeId, orderId, status) => {
    const orderRef = doc(db, "cafes", cafeId, "orders", orderId);
    await updateDoc(orderRef, { status, updatedAt: new Date().toISOString() });
  };

  const completeOrder = async (cafeId, orderId, status) => {
    if (!["completed", "cancelled"].includes(status)) {
      throw new Error("Invalid status. Must be 'completed' or 'cancelled'.");
    }

    const orderRef = doc(db, "cafes", cafeId, "orders", orderId);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) throw new Error("Order not found!");

    const orderData = orderSnap.data();

    // Create history doc
    const historyRef = doc(db, "cafes", cafeId, "orderHistory", orderId);
    await setDoc(historyRef, {
      ...orderData,
      status,
      updatedAt: serverTimestamp(),
    });

    // Delete from active orders
    await deleteDoc(orderRef);

    toast.success(`Order moved to history `);
  };

  const listenOrderHistory = (cafeId, setHistory) => {
    const historyRef = collection(db, "cafes", cafeId, "orderHistory");

    return onSnapshot(historyRef, (snap) => {
      const history = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // sort: latest first
      history.sort((a, b) => {
        const t1 = a.updatedAt?.seconds || 0;
        const t2 = b.updatedAt?.seconds || 0;
        return t2 - t1;
      });

      setHistory(history);
    });
  };

  return (
    <OrderContext.Provider
      value={{
        listenOrders,
        updateOrderStatus,
        placeOrder,
        completeOrder,listenOrderHistory
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export default OrderContext;
