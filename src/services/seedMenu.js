import { db } from "../firebase";
import { collection, doc, setDoc } from "firebase/firestore";
import {menu} from "./menuData"

export async function seedMenu() {
  try {
    const menuCollection = collection(db, "menu");

    for (const category of menu) {
      // Use category name as document ID (unique)
      const categoryDoc = doc(menuCollection, category.category);

      // setDoc will overwrite instead of duplicate
      await setDoc(categoryDoc, category, { merge: true });
    }

    console.log("Menu seeded successfully!");
  } catch (error) {
    console.error("Error seeding menu:", error);
  }
}
