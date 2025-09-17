/* eslint-disable no-unused-vars */
import { createContext, useCallback, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
  setDoc,
  getDocs,
  addDoc,
  serverTimestamp,
  collection,
  query,
  orderBy,
} from "firebase/firestore";
import { toast } from "react-hot-toast";

const MenuContext = createContext();

export const MenuProvider = ({ children }) => {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [cafe, setCafe] = useState(null); // ✅ store cafe info

  // 🔹 Handle Auth (for owners)
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUser({
            uid: currentUser.uid,
            email: currentUser.email,
            ...userSnap.data(),
          });
        } else {
          setUser({ uid: currentUser.uid, email: currentUser.email });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  // 🔹 Owner-side: live sync menu
  useEffect(() => {
    if (!user) return;

    const docRef = doc(db, "cafes", user.uid);
    const unsubscribeMenu = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        setMenu(snap.data().menu || []);
      } else {
        setMenu([]);
      }
    });

    return () => unsubscribeMenu();
  }, [user]);

  // get session id for each customer
  function getSessionId() {
    let sessionId = localStorage.getItem("sessionId");
    if (!sessionId) {
      sessionId = `sess-${crypto.randomUUID()}`;
      localStorage.setItem("sessionId", sessionId);
    }
    return sessionId;
  }

  // 🔹 Customer-side: fetch menu using cafeId + cafeName
  // --- CRUD Methods (same as before) ---

  const fetchCafe = useCallback(async (cafeId, cafeName) => {
    try {
      const cafeRef = doc(db, "cafes", cafeId);
      const snap = await getDoc(cafeRef);

      if (snap.exists()) {
        const cafeData = snap.data();

        // fetch menu from subcollection
        const q = query(
          collection(db, "cafes", cafeId, "menu"),
          orderBy("createdAt", "asc")
        );

        const menuSnap = await getDocs(q);
        const menuItems = menuSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setCafe(cafeData);
        setMenu(menuItems);
      } else {
        setMenu([]);
      }
    } catch (err) {
      console.error("🔥 Error fetching menu:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Add Item
  const addItem = async (categoryName, newItem) => {
    try {
      if (!user) return console.error("❌ User not logged in");
      if (!categoryName || categoryName.trim() === "")
        return console.error("❌ Category is missing");

      const cafeId = user.uid;
      const categoryId = categoryName.toLowerCase().replace(/\s+/g, "-"); // make it URL-safe

      const categoryRef = doc(db, "cafes", cafeId, "menu", categoryId);
      const categorySnap = await getDoc(categoryRef);

      const itemToAdd = {
        ...newItem,
        price: Number(newItem.price),
        available: true,
        createdAt: new Date(), // ⚠️ Use JS Date, not serverTimestamp() inside array
        id: newItem.name.toLowerCase().replace(/\s+/g, "-"), // optional: unique id per item
      };

      if (!categorySnap.exists()) {
        // Category doesn't exist → create new category document
        await setDoc(categoryRef, {
          name: categoryName,
          items: [itemToAdd],
          createdAt: new Date(),
        });

        toast.success("Category & item added!");
        return { categoryId, items: [itemToAdd] };
      } else {
        // Category exists → append item to items array
        const existingItems = categorySnap.data().items || [];
        await updateDoc(categoryRef, { items: [...existingItems, itemToAdd] });

        toast.success("Item added to existing category!");
        return { categoryId, items: [...existingItems, itemToAdd] };
      }
    } catch (err) {
      console.error("🔥 Error adding item:", err);
      toast.error("Failed to add item");
    }
  };

  //update item
  const updateItem = async (userId, categoryId, updatedItem) => {
    try {
      // console.log("category id = ", categoryId);

      const categoryRef = doc(
        db,
        "cafes",
        userId,
        "menu",
        categoryId.toLowerCase()
      );
      const snap = await getDoc(categoryRef);

      if (!snap.exists()) {
        toast.error("Category not found!");
        return;
      }

      const items = snap
        .data()
        .items.map((item) =>
          item.id === updatedItem.id
            ? { ...item, ...updatedItem, price: Number(updatedItem.price) }
            : item
        );

      await updateDoc(categoryRef, { items });
      toast.success("Item updated!");
      return items;
    } catch (err) {
      console.error("🔥 Error updating item:", err);
      toast.error("Failed to update item");
    }
  };

  // Delete item inside a category
  const deleteItem = async (userId, categoryId, itemId) => {
    try {
      const categoryRef = doc(
        db,
        "cafes",
        userId,
        "menu",
        categoryId.toLowerCase()
      );
      const snap = await getDoc(categoryRef);

      if (!snap.exists()) {
        toast.error("Category not found!");
        return;
      }

      const items = snap.data().items.filter((item) => item.id !== itemId);

      await updateDoc(categoryRef, { items });
      toast.success("Item deleted!");
      return items;
    } catch (err) {
      console.error("🔥 Error deleting item:", err);
      toast.error("Failed to delete item");
    }
  };


  //order
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

  //cart
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  // Load cart from localStorage so it persists
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(storedCart);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Add to cart
  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { ...item, qty: 1 }];
    });
    toast.success("Added to cart");
  };

  // Remove from cart
  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
    toast.success("Removed from cart");
  };

  // Update qty
  const increaseQty = (id) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty: item.qty + 1 } : item
      )
    );
  };

  const decreaseQty = (id) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, qty: Math.max(1, item.qty - 1) } : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  // Clear cart
  const clearCart = () => setCart([]);

  //total
  const totalAmount = cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  return (
    <MenuContext.Provider
      value={{
        menu,
        cafe,
        loading,
        setLoading,
        addItem,
        updateItem,
        deleteItem,
        user,
        fetchCafe,
        listenOrders,
        updateOrderStatus,
        placeOrder,
        cart,
        addToCart,
        removeFromCart,
        increaseQty,
        decreaseQty,
        clearCart,
        completeOrder,
        totalAmount,
        trial: cafe?.trial || null,
      }}
    >
      {children}
    </MenuContext.Provider>
  );
};

export default MenuContext;
