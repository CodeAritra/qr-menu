import { createContext, useCallback, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
} from "firebase/firestore";
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
  item,
  fromCart = false,
  customerName = "",
  tableNo = ""
) => {
  const sessionId = getSessionId();

  // fallback name if none given
  const finalName =
    customerName && customerName.trim() !== ""
      ? customerName
      : `Guest-${sessionId.slice(-5)}`;

  // fallback table number if not given
  const finalTable = tableNo && tableNo.trim() !== "" ? tableNo : "N/A";

  // 1️⃣ Check if there’s a pending order for this session
  const q = query(
    collection(db, "orders"),
    where("cafeId", "==", cafeId),
    where("sessionId", "==", sessionId),
    where("status", "==", "pending")
  );
  const snap = await getDocs(q);

  if (!snap.empty) {
    // Update existing pending order
    const orderDoc = snap.docs[0];
    const existing = orderDoc.data();

    let updatedItems = [...existing.items];
    if (fromCart) {
      updatedItems.push(...item);
    } else {
      updatedItems.push(item);
    }

    await updateDoc(doc(db, "orders", orderDoc.id), {
      items: updatedItems,
      totalAmount: updatedItems.reduce(
        (sum, i) => sum + i.price * (i.qty || 1),
        0
      ),
      customerName: finalName,
      tableNo: finalTable,
      updatedAt: new Date().toISOString(),
    });
  } else {
    // Create a new order
    await addDoc(collection(db, "orders"), {
      cafeId,
      sessionId,
      customerName: finalName,
      tableNo: finalTable,
      status: "pending",
      items: fromCart ? item : [item],
      totalAmount: (fromCart ? item : [item]).reduce(
        (sum, i) => sum + i.price * (i.qty || 1),
        0
      ),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
};


  const listenOrders = (cafeId, setOrders) => {
    const q = query(collection(db, "orders"), where("cafeId", "==", cafeId));
    return onSnapshot(q, (snap) => {
      let results = [];
      snap.forEach((d) => results.push({ id: d.id, ...d.data() }));
      setOrders(results);
    });
  };

  const updateOrderStatus = async (orderId, status) => {
    await updateDoc(doc(db, "orders", orderId), {
      status,
      updatedAt: new Date().toISOString(),
    });
  };

  //cart
  const [cart, setCart] = useState([]);

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
  };

  // Remove from cart
  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  // Update qty
  const updateQty = (id, qty) => {
    setCart((prev) =>
      prev.map((i) => (i.id === id ? { ...i, qty } : i))
    );
  };

  // Clear cart
  const clearCart = () => setCart([]);

  return (
    <MenuContext.Provider
      value={{
        menu,
        cafe,
        loading,
        addItem,
        updateItem,
        deleteItem,
        user,
        fetchCafe,
        listenOrders,
        updateOrderStatus,
        placeOrder,addToCart,removeFromCart,updateQty,clearCart
      }}
    >
      {children}
    </MenuContext.Provider>
  );
};

export default MenuContext;
