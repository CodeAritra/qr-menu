import { createContext, useCallback, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, onSnapshot, updateDoc, setDoc } from "firebase/firestore";
import { toast } from "react-hot-toast";

const MenuContext = createContext();

export const MenuProvider = ({ children }) => {
  const [menu, setMenu] = useState({});
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

        // ✅ Trial validation
        if (cafeData.trial) {
          const now = new Date('2025-09-28T03:21:52.861Z');
          // const now = new Date();
          const end = new Date(cafeData.trial.endDate);

          if (now > end && !cafeData.trial.expired) {
            await updateDoc(cafeRef, {
              "trial.isActive": false,
              "trial.expired": true,
            });
            cafeData.trial.isActive = false;
            cafeData.trial.expired = true;
          }
        }

        // ✅ Optional: validate cafeName from URL
        if (
          cafeName &&
          cafeData.name.toLowerCase().replace(/\s+/g, "") !==
            cafeName.toLowerCase()
        ) {
          console.warn("⚠️ Cafe name mismatch with URL");
        }

        setCafe(cafeData);
        setMenu(cafeData.menu || {});
      } else {
        setMenu(null);
      }
    } catch (err) {
      console.error("🔥 Error fetching menu:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addItem = async (category, newItem) => {
    try {
      if (!user) return console.error("❌ User not logged in");
      if (!category || category.trim() === "") {
        return console.error("❌ Category is missing");
      }

      const itemToAdd = {
        ...newItem,
        available: true,
        price: Number(newItem.price),
      };

      const cafeRef = doc(db, "cafes", user.uid);
      const cafeSnap = await getDoc(cafeRef);

      if (!cafeSnap.exists()) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        let username = "Unknown";
        if (userSnap.exists()) username = userSnap.data().username;

        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + 15); // 15 days trial

        await setDoc(
          cafeRef,
          {
            name: username,
            ownerId: user.uid,
            createdAt: new Date().toISOString(),
            menu: {
              [category]: {
                category,
                items: [itemToAdd],
              },
            },
            serviceType: "menu", //  default
            trial: {
              isActive: true,
              startDate: startDate.toISOString(),
              endDate: endDate.toISOString(),
              expired: false,
            },
          },
          { merge: true }
        );
        toast.success("Item added!");

        setMenu({ [category]: { category, items: [itemToAdd] } });
      } else {
        let existingMenu = cafeSnap.data().menu || {};
        if (!existingMenu[category]) {
          existingMenu[category] = { category, items: [] };
        }
        existingMenu[category].items.push(itemToAdd);

        await updateDoc(cafeRef, { menu: existingMenu });
        toast.success("Item added!");

        setMenu(existingMenu);
      }
    } catch (err) {
      console.error("🔥 Error adding item:", err);
    }
  };

  const updateItem = async (userId, category, updatedItem) => {
    try {
      const cafeRef = doc(db, "cafes", userId);
      const snap = await getDoc(cafeRef);
      if (!snap.exists()) return toast.error("Cafe not found!");

      const menu = snap.data().menu || {};
      if (!menu[category]) return toast.error("Category not found!");

      menu[category].items = menu[category].items.map((item) =>
        item.id === updatedItem.id ? updatedItem : item
      );

      await updateDoc(cafeRef, { menu });
      toast.success("Item updated!");
      return menu;
    } catch (err) {
      console.error(err);
      toast.error("Failed to update item");
    }
  };

  const deleteItem = async (userId, category, itemId) => {
    try {
      const cafeRef = doc(db, "cafes", userId);
      const snap = await getDoc(cafeRef);
      if (!snap.exists()) return toast.error("Cafe not found!");

      const menu = snap.data().menu || {};
      if (!menu[category]) return toast.error("Category not found!");

      menu[category].items = menu[category].items.filter(
        (item) => item.id !== itemId
      );

      if (menu[category].items.length === 0) {
        delete menu[category];
      }

      await updateDoc(cafeRef, { menu });
      toast.success("Item deleted!");
      return menu;
    } catch (err) {
      console.error(err);
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

  const listenOrders = (cafeId, setOrders) => {
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
