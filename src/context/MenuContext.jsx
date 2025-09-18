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

  // 🔹 Customer-side: fetch menu using cafeId + cafeName
  // --- CRUD Methods (same as before) ---

  const fetchCafe = useCallback(async (cafeId) => {
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
        trial: cafe?.trial || null,
      }}
    >
      {children}
    </MenuContext.Provider>
  );
};

export default MenuContext;
