import {
  collection, addDoc, getDocs, updateDoc, deleteDoc,
  doc, query, where, onSnapshot, orderBy
} from "firebase/firestore";
import { db } from "../firebase";

// COLLECTION REF
const itemsRef = collection(db, "menuItems");

// CREATE
export const addMenuItem = async (item) => {
  const docRef = await addDoc(itemsRef, item);
  return { id: docRef.id, ...item };
};

// READ (all)
export const fetchMenuItems = async () => {
  const snap = await getDocs(query(itemsRef, orderBy("category")));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

// READ by category (optional)
export const fetchByCategory = async (category) => {
  const q = query(itemsRef, where("category", "==", category));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

// REALTIME subscribe (UI auto-updates)
export const subscribeMenu = (callback) => {
  return onSnapshot(query(itemsRef, orderBy("category")), (snap) => {
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(data);
  });
};

// UPDATE
export const updateMenuItem = async (id, updates) => {
  await updateDoc(doc(db, "menuItems", id), updates);
};

// DELETE
export const deleteMenuItem = async (id) => {
  await deleteDoc(doc(db, "menuItems", id));
};
