import {
  collection,
  addDoc,
  doc,
  getDoc,
  deleteField,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase.js"; 

async function migrateMenu(cafeId) {
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

migrateMenu("YefNZlosfzWnsZOhqCQP5OGbGm33");
